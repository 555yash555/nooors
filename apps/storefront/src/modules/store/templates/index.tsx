import { Suspense } from "react"

import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { Ornament } from "@modules/common/components/noors"

import PaginatedProducts from "./paginated-products"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""

/**
 * NOOORS store / listing page — page-hero band, filter bar, then shop grid.
 */
const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <>
      {/* PAGE HERO */}
      <section
        className="relative w-full overflow-hidden flex items-center justify-center text-ivory"
        style={{ height: "60vh", minHeight: "420px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${BACKEND_URL}/static/hero_secondary.png')`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(20,18,14,0.55), rgba(20,18,14,0.7))",
          }}
        />
        <div className="relative z-[2] text-center max-w-2xl px-6 pt-20">
          <span className="section-label section-label--light">S/S 2025</span>
          <h1
            className="font-serif font-light text-ivory mt-6"
            data-split
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
            data-testid="store-page-title"
          >
            The Collection
          </h1>
          <p
            className="font-serif italic font-light text-ivory/80 mt-3 text-base"
          >
            Pieces selected for the discerning eye.
          </p>
          <Ornament light />
        </div>
      </section>

      {/* CONTENT */}
      <div
        className="content-container py-12 lg:py-20"
        data-testid="category-container"
      >
        <div className="flex flex-col lg:flex-row gap-10">
          <RefinementList sortBy={sort} />
          <div className="w-full">
            <Suspense fallback={<SkeletonProductGrid />}>
              <PaginatedProducts
                sortBy={sort}
                page={pageNumber}
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

export default StoreTemplate
