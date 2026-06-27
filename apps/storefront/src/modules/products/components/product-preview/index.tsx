import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

/**
 * Elora ProductPreview — luxury shop-card.
 *
 * Mobile  — compact: stacked title/price, smaller type, no quick-view overlay
 *           (touch devices don't hover so the overlay reads as broken).
 * Desktop — full: side-by-side colors + price, larger serif title,
 *           italic material, hover quick-view overlay.
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

        {/* Quick-view — desktop hover only */}
        <div className="hidden lg:flex shop-card__hover-overlay absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-silk pointer-events-none items-end justify-center pb-8">
          <span className="text-[0.62rem] tracking-[0.35em] uppercase text-ivory border border-ivory/70 px-5 py-2.5 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700 ease-silk delay-100">
            Quick View
          </span>
        </div>

        {badge && (
          <span
            className={`absolute top-2.5 left-2.5 lg:top-4 lg:left-4 text-[0.5rem] lg:text-[0.6rem] tracking-[0.22em] lg:tracking-[0.25em] uppercase px-2 py-0.5 lg:px-3 lg:py-1 ${
              badge === "Bestseller"
                ? "bg-gold text-ivory"
                : "bg-ivory text-ink"
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* MOBILE INFO — stacked, tight */}
      <div className="shop-card__info lg:hidden pt-3 pb-1 flex flex-col gap-1">
        <h3
          className="font-serif text-ink font-normal leading-tight"
          style={{
            fontSize: "0.95rem",
            letterSpacing: "-0.005em",
          }}
          data-testid="product-title"
        >
          {product.title}
        </h3>
        {material && (
          <p className="font-serif italic font-light text-smoke text-[0.72rem] leading-tight">
            {material}
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          {cheapestPrice ? (
            <span className="font-sans text-[0.78rem] tracking-[0.08em] text-ink">
              <PreviewPrice price={cheapestPrice} />
            </span>
          ) : (
            <span />
          )}
          {colors.length > 0 && (
            <div className="flex gap-1">
              {colors.slice(0, 3).map((c) => (
                <span
                  key={c.name}
                  className="w-2 h-2 rounded-full border border-ink/15"
                  style={{ background: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DESKTOP INFO — original generous layout */}
      <div className="shop-card__info hidden lg:block pt-6 pb-2">
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
