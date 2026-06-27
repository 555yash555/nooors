import { clx } from "@modules/common/components/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

/**
 * NOOORS PDP price — large sans, gold accent on sale.
 */
export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-8 bg-cream animate-pulse" />
  }

  const onSale = selectedPrice.price_type === "sale"

  return (
    <div className="flex flex-col gap-1">
      <span
        className={clx(
          "font-sans text-[1.1rem] tracking-[0.18em] text-ink",
          onSale && "text-gold"
        )}
      >
        {!variant && "From "}
        <span
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
      </span>
      {onSale && (
        <span className="text-[0.7rem] tracking-[0.2em] uppercase text-smoke">
          <span
            className="line-through"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
          <span className="ml-3 text-gold">
            -{selectedPrice.percentage_diff}%
          </span>
        </span>
      )}
    </div>
  )
}
