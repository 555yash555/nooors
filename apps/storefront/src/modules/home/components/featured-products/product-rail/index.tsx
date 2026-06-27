import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SectionHeader } from "@modules/common/components/noors"
import ProductPreview from "@modules/products/components/product-preview"

/**
 * NOOORS Featured rail — asymmetric grid: 1 large + 2 small.
 * Falls back to plain grid if fewer than 3 products.
 */
export default async function ProductRail({
  collection,
  region,
}: {
  collection: HttpTypes.StoreCollection
  region: HttpTypes.StoreRegion
}) {
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: {
      collection_id: collection.id,
      limit: 3,
    },
  })

  if (!products || products.length === 0) return null

  const [hero, ...rest] = products

  return (
    <section className="featured py-24 lg:py-32">
      <SectionHeader
        label="New Arrivals"
        title="The Edit"
        sub="Pieces selected for the discerning eye."
      />

      <div
        className="mt-12 mx-auto"
        style={{
          maxWidth: "var(--max-w)",
          paddingLeft: "var(--pad-x)",
          paddingRight: "var(--pad-x)",
        }}
      >
        {products.length >= 3 ? (
          <div className="grid gap-8 grid-cols-1 lg:[grid-template-columns:minmax(0,1.2fr)_minmax(0,1fr)]">
            <div>
              <ProductPreview
                product={hero}
                region={region}
                isLarge
                isFeatured
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-8">
              {rest.slice(0, 2).map((p) => (
                <ProductPreview key={p.id} product={p} region={region} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p) => (
              <ProductPreview key={p.id} product={p} region={region} />
            ))}
          </div>
        )}
      </div>

      <div className="text-center mt-16">
        <LocalizedClientLink href="/store" className="btn btn--outline">
          View All Pieces
        </LocalizedClientLink>
      </div>
    </section>
  )
}
