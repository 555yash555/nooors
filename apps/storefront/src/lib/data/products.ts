"use server"

import { sdk } from "@lib/config"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  countryCode,
  regionId,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  countryCode?: string
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  if (!countryCode && !regionId) {
    throw new Error("Country code or region ID is required")
  }

  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  let region: HttpTypes.StoreRegion | undefined | null

  if (countryCode) {
    region = await getRegion(countryCode)
  } else {
    region = await retrieveRegion(regionId!)
  }

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,*options,+metadata,+tags,",
          ...queryParams,
        },
        headers,
        // Short shared time-based revalidation, not the per-session cache-tag
        // helper — product edits happen via the Admin dashboard, a separate
        // session that can never invalidate a visitor-scoped cache tag. See
        // lib/data/site-content.ts for the same reasoning.
        next: { revalidate: 30 },
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  countryCode,
  optionValueIds,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  countryCode: string
  optionValueIds?: OptionValueIds
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )

  // Always fetch the full listing context unfiltered — we apply the
  // option-value filter client-side. Medusa's store route does support
  // `option_value_id` but its serialization is brittle, and filtering after
  // we have the data lets us match the typical e-com semantics:
  //   • Same option group  → OR  (Black OR White)
  //   • Different groups   → AND (Color=Black AND Size=M)
  const {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      limit: 100,
    },
    countryCode,
  })

  const filteredProducts = optionFilters.length
    ? filterProductsByOptionValues(products, optionFilters)
    : products

  const sortedProducts = sortProducts(filteredProducts, sortBy)

  const pageParam = (page - 1) * limit

  const filteredCount = filteredProducts.length

  const nextPage = filteredCount > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}

/** Normalize a label (option title or value text) into a URL-safe slug. */
function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-")
}

/**
 * Build a synthetic value id of the form `<titleSlug>:<valueSlug>` — stable
 * across products because Medusa v2 stores options and their values
 * per-product, so the raw value ids would otherwise differ for the same
 * label (e.g. "Black") on different products.
 */
function syntheticValueId(optionTitle: string, valueText: string) {
  return `${slugify(optionTitle)}:${slugify(valueText)}`
}

/**
 * Keep a product if at least one of its variants satisfies every selected
 * option group. Within a group (e.g. Color), any selected value matches (OR).
 * Across groups (Color + Size), all groups must match (AND).
 *
 * Selected ids are synthetic `<titleSlug>:<valueSlug>` strings, so we group
 * by title slug and match against the variant's option-value text.
 */
function filterProductsByOptionValues(
  products: HttpTypes.StoreProduct[],
  selectedSyntheticIds: string[]
) {
  const groups = new Map<string, Set<string>>()
  for (const sid of selectedSyntheticIds) {
    const idx = sid.indexOf(":")
    if (idx <= 0) continue
    const titleSlug = sid.slice(0, idx)
    const valueSlug = sid.slice(idx + 1)
    if (!titleSlug || !valueSlug) continue
    if (!groups.has(titleSlug)) groups.set(titleSlug, new Set())
    groups.get(titleSlug)!.add(valueSlug)
  }

  // No parseable selections → treat as "no filter" rather than blanking the
  // grid (covers stale URLs from earlier per-product-id filter format).
  if (!groups.size) return products

  const groupEntries = Array.from(groups.entries())

  return products.filter((p) => {
    const optionTitleById = new Map<string, string>()
    for (const o of p.options ?? []) {
      if (o.id && o.title) optionTitleById.set(o.id, slugify(o.title))
    }
    return (p.variants ?? []).some((v) =>
      groupEntries.every(([titleSlug, allowedValueSlugs]) =>
        (v.options ?? []).some((opt) => {
          const ownerTitleSlug =
            (opt.option_id && optionTitleById.get(opt.option_id)) || ""
          return (
            ownerTitleSlug === titleSlug &&
            allowedValueSlugs.has(slugify(opt.value ?? ""))
          )
        })
      )
    )
  })
}

/**
 * Derive the option groups (and their values) actually present in a listing
 * context — used to drive the Filter accordion. Without this the picker
 * shows every option in the whole catalogue, including ones that filter to
 * zero products on the current page.
 */
export const listAvailableProductOptions = async ({
  countryCode,
  queryParams,
}: {
  countryCode: string
  queryParams?: ProductListQueryParams
}): Promise<HttpTypes.StoreProductOption[]> => {
  const {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      fields: "id,*options,*variants.options",
      limit: 100,
    },
    countryCode,
  })

  // Medusa v2 stores options per-product, so the same logical option (e.g.
  // "Color") gets a fresh record on each product. Without deduping we end up
  // rendering one accordion per (product, option) pair. We group by the
  // option's title slug and merge value records that share the same value
  // text — collapsing 4 "Color" accordions into one with all unique colors.
  type ValueAcc = { id: string; value: string }
  type OptionAcc = {
    id: string // titleSlug — also the synthetic option id
    title: string
    values: Map<string, ValueAcc> // keyed by value-text slug
  }
  const optionAcc = new Map<string, OptionAcc>()

  for (const p of products) {
    const optionTitleById = new Map<string, string>()
    for (const opt of p.options ?? []) {
      if (!opt.id || !opt.title) continue
      optionTitleById.set(opt.id, opt.title)
      const titleSlug = slugify(opt.title)
      if (!optionAcc.has(titleSlug)) {
        optionAcc.set(titleSlug, {
          id: titleSlug,
          title: opt.title,
          values: new Map(),
        })
      }
    }
    for (const v of p.variants ?? []) {
      for (const ov of v.options ?? []) {
        if (!ov.option_id || !ov.value) continue
        const ownerTitle = optionTitleById.get(ov.option_id)
        if (!ownerTitle) continue
        const titleSlug = slugify(ownerTitle)
        const acc = optionAcc.get(titleSlug)
        if (!acc) continue
        const valueSlug = slugify(ov.value)
        if (!acc.values.has(valueSlug)) {
          acc.values.set(valueSlug, {
            id: syntheticValueId(ownerTitle, ov.value),
            value: ov.value,
          })
        }
      }
    }
  }

  return Array.from(optionAcc.values()).map(
    (a) =>
      ({
        id: a.id,
        title: a.title,
        values: Array.from(a.values.values()),
      }) as unknown as HttpTypes.StoreProductOption
  )
}
