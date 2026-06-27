import { HttpTypes } from "@medusajs/types"
import { Ornament } from "@modules/common/components/noors"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

/**
 * NOOORS PDP heading + intro: collection label, serif title, ornament, italic body.
 */
const ProductInfo = ({ product }: ProductInfoProps) => {
  const meta = (product.metadata as any) || {}
  const material: string | null = meta.material ?? null

  return (
    <div id="product-info" className="reveal-wrap">
      <div className="flex flex-col">
        <span className="section-label">
          {product.collection?.title || "Couture"}
        </span>
        <h1
          className="font-serif font-light text-ink mt-6"
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
          }}
          data-testid="product-title"
        >
          {product.title}
        </h1>
        <Ornament className="!ml-0" />
        <p
          className="font-serif italic font-light text-smoke leading-[1.7]"
          style={{ fontSize: "1.05rem" }}
          data-testid="product-description"
        >
          {product.description}
        </p>
        {material && (
          <p className="font-sans text-[0.7rem] tracking-[0.25em] uppercase text-gold mt-6">
            {material}
          </p>
        )}
      </div>
    </div>
  )
}

export default ProductInfo
