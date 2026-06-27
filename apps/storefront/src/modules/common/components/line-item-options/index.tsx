import { HttpTypes } from "@medusajs/types"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

/**
 * NOOORS line item meta — replaces ugly "Variant: XL / Sand" with a
 * tracked-uppercase gold caption.
 */
const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  if (!variant?.title) return null
  return (
    <span
      data-testid={dataTestid}
      data-value={dataValue as any}
      className="inline-block text-[0.65rem] tracking-[0.25em] uppercase text-gold mt-1"
    >
      {variant.title}
    </span>
  )
}

export default LineItemOptions
