import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

/**
 * Elora ProductPreview — luxury shop-card with:
 * - aspect-[3/4] image with hover zoom (Thumbnail provides .shop-card__img-wrap)
 * - quick-view overlay on hover
 * - badge (top-left)
 * - color dots
 * - serif name + italic material + price footer
 */
export default async function ProductPreview({
  product,
  isFeatured,
  isLarge,
  region: _region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  isLarge?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({ product })

  const meta = (product.metadata as any) || {}
  const badge: string | null = meta.badge ?? null
  const material: string | null = meta.material ?? null
  const colors: { name: string; hex: string }[] = meta.color_swatches || []

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="shop-card product-card group block"
      suppressHydrationWarning
    >
      <div className="relative" data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isLarge={isLarge}
          isFeatured={isFeatured}
        />

        {/* Hover overlay → quick view */}
        <div className="shop-card__hover-overlay absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-silk pointer-events-none flex items-end justify-center pb-8">
          <span className="text-[0.62rem] tracking-[0.35em] uppercase text-ivory border border-ivory/70 px-5 py-2.5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-silk delay-100">
            Quick View
          </span>
        </div>

        {badge && (
          <span
            className={`absolute top-4 left-4 text-[0.6rem] tracking-[0.25em] uppercase px-3 py-1 ${
              badge === "Bestseller"
                ? "bg-gold text-ivory"
                : "bg-ivory text-ink"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="shop-card__info pt-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          {colors.length > 0 && (
            <div className="flex gap-1.5">
              {colors.slice(0, 3).map((c) => (
                <span
                  key={c.name}
                  className="w-3 h-3 rounded-full border border-ink/10"
                  style={{ background: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
          {cheapestPrice && (
            <span className="font-sans text-[0.85rem] tracking-[0.12em] text-ink">
              <PreviewPrice price={cheapestPrice} />
            </span>
          )}
        </div>
        <h3
          className="font-serif text-ink font-normal"
          style={{
            fontSize: isLarge ? "1.6rem" : "1.35rem",
            letterSpacing: "-0.01em",
          }}
          data-testid="product-title"
        >
          {product.title}
        </h3>
        {material && (
          <p className="font-serif italic font-light text-smoke text-sm mt-1">
            {material}
          </p>
        )}
      </div>
    </LocalizedClientLink>
  )
}
