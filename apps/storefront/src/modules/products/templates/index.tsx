import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

/**
 * NOOORS PDP — breadcrumb + 2-col (gallery left, sticky info right).
 * Related products in a NOOORS rail below.
 */
const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) return notFound()

  return (
    <>
      {/* spacer to push past fixed nav */}
      <div className="h-20" />

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="content-container pt-4 pb-2 text-[0.7rem] tracking-[0.25em] uppercase text-smoke flex items-center gap-3"
      >
        <LocalizedClientLink href="/" className="hover:text-gold">
          Home
        </LocalizedClientLink>
        <span className="text-gold/40">/</span>
        <LocalizedClientLink href="/store" className="hover:text-gold">
          Collection
        </LocalizedClientLink>
        <span className="text-gold/40">/</span>
        <span className="text-ink">{product.title}</span>
      </nav>

      {/* Main PDP grid */}
      <main
        className="content-container py-12 lg:py-20"
        data-testid="product-container"
      >
        <div className="grid gap-10 lg:gap-16 lg:[grid-template-columns:minmax(0,1.1fr)_minmax(0,1fr)]">
          {/* Gallery */}
          <div className="block w-full">
            <ImageGallery images={images} />
          </div>

          {/* Info column (sticky on large screens) */}
          <aside
            className="flex flex-col gap-y-10 self-start lg:sticky lg:top-32"
          >
            <ProductInfo product={product} />
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
            <ProductTabs product={product} />
          </aside>
        </div>
      </main>

      {/* Related */}
      <section
        className="content-container my-16 lg:my-32"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </section>
    </>
  )
}

export default ProductTemplate
