import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "@modules/store/templates/paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { listAvailableProductOptions } from "@lib/data/products"

export default async function CollectionTemplate({
  sortBy,
  collection,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  collection: HttpTypes.StoreCollection
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const availableOptions = await listAvailableProductOptions({
    countryCode,
    queryParams: { collection_id: [collection.id] },
  })

  return (
    <>
      {/* Spacer past the fixed nav */}
      <div className="h-20" />

      {/* Page header band */}
      <header
        className="content-container pt-8 pb-6 lg:pt-12 lg:pb-10"
        data-testid="collection-header"
      >
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-[0.65rem] lg:text-[0.7rem] tracking-[0.25em] uppercase text-smoke mb-4"
        >
          <LocalizedClientLink href="/" className="hover:text-gold">
            Home
          </LocalizedClientLink>
          <span className="text-gold/40">/</span>
          <LocalizedClientLink href="/store" className="hover:text-gold">
            Collection
          </LocalizedClientLink>
        </nav>
        <span className="text-[0.6rem] tracking-[0.4em] uppercase text-gold">
          Edit
        </span>
        <h1
          className="font-serif font-light text-ink mt-3"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.05,
          }}
          data-testid="collection-page-title"
        >
          {collection.title}
        </h1>
      </header>

      {/* Filter sidebar + product grid */}
      <div className="content-container pb-12 lg:pb-20">
        <div className="flex flex-col lg:flex-row gap-10">
          <RefinementList sortBy={sort} availableOptions={availableOptions} />
          <div className="w-full">
            <Suspense
              fallback={
                <SkeletonProductGrid
                  numberOfProducts={collection.products?.length}
                />
              }
            >
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
                collectionId={collection.id}
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
