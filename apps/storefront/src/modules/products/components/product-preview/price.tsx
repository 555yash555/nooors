import { clx } from "@modules/common/components/ui"
import { VariantPrice } from "types/global"

/**
 * NOOORS PreviewPrice — inline span (no <p>) so it nests inside any heading row.
 */
export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) return null

  return (
    <>
      {price.price_type === "sale" && (
        <span
          className="line-through text-smoke mr-2"
          data-testid="original-price"
        >
          {price.original_price}
        </span>
      )}
      <span
        className={clx("font-sans", {
          "text-gold": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {price.calculated_price}
      </span>
    </>
  )
}
