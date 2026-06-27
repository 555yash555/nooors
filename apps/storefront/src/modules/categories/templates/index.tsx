import { notFound } from "next/navigation"
import { Suspense } from "react"

import InteractiveLink from "@modules/common/components/interactive-link"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { listAvailableProductOptions } from "@lib/data/products"

export default async function CategoryTemplate({
  category,
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  category: HttpTypes.StoreProductCategory
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  if (!category || !countryCode) notFound()

  const availableOptions = await listAvailableProductOptions({
    countryCode,
    queryParams: { category_id: [category.id] },
  })

  const parents = [] as HttpTypes.StoreProductCategory[]

  const getParents = (category: HttpTypes.StoreProductCategory) => {
    if (category.parent_category) {
      parents.push(category.parent_category)
      getParents(category.parent_category)
    }
  }

  getParents(category)

  return (
    <>
      {/* Spacer past the fixed nav */}
      <div className="h-20" />

      {/* Page header band — breadcrumbs + title */}
      <header
        className="content-container pt-8 pb-6 lg:pt-12 lg:pb-10"
        data-testid="category-header"
      >
        {parents.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[0.65rem] lg:text-[0.7rem] tracking-[0.25em] uppercase text-smoke mb-4"
          >
            <LocalizedClientLink href="/" className="hover:text-gold">
              Home
            </LocalizedClientLink>
            <span className="text-gold/40">/</span>
            <LocalizedClientLink
              href="/store"
              className="hover:text-gold"
            >
              Collection
            </LocalizedClientLink>
            {parents.map((parent) => (
              <span
                key={parent.id}
                className="flex items-center gap-2 text-smoke"
              >
                <span className="text-gold/40">/</span>
                <LocalizedClientLink
                  href={`/categories/${parent.handle}`}
                  className="hover:text-gold"
                  data-testid="sort-by-link"
                >
                  {parent.name}
                </LocalizedClientLink>
              </span>
            ))}
          </nav>
        )}
        <span className="text-[0.6rem] tracking-[0.4em] uppercase text-gold">
          Category
        </span>
        <h1
          className="font-serif font-light text-ink mt-3"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
          data-testid="category-page-title"
        >
          {category.name}
        </h1>
        {category.description && (
          <p
            className="font-serif italic font-light text-smoke mt-4 max-w-[640px]"
            style={{ fontSize: "1rem", lineHeight: 1.7 }}
          >
            {category.description}
          </p>
        )}
        {!!category.category_children?.length && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {category.category_children.map((c) => (
              <li key={c.id}>
                <InteractiveLink href={`/categories/${c.handle}`}>
                  {c.name}
                </InteractiveLink>
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* Filter sidebar + product grid */}
      <div
        className="content-container pb-12 lg:pb-20"
        data-testid="category-container"
      >
        <div className="flex flex-col lg:flex-row gap-10">
          <RefinementList
            sortBy={sort}
            data-testid="sort-by-container"
            availableOptions={availableOptions}
          />
          <div className="w-full">
            <Suspense
              fallback={
                <SkeletonProductGrid
                  numberOfProducts={category.products?.length ?? 8}
                />
              }
            >
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                categoryId={category.id}
                countryCode={countryCode}
                optionValueIds={optionValueIds}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  )
}
