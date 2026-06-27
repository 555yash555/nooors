"use client"

import Accordion from "./accordion"
import { HttpTypes } from "@medusajs/types"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

/**
 * NOOORS PDP accordions — Composition & Fabric, Care, Delivery & Returns.
 * Replaces the starter's "Product Information / Shipping & Returns" with
 * couture-house language and pulls material from product.metadata.
 */
const ProductTabs = ({ product }: ProductTabsProps) => {
  const meta = (product.metadata as any) || {}
  const material: string = meta.material || product.material || ""

  const tabs = [
    {
      label: "Composition & Fabric",
      content: (
        <div className="py-6 font-serif italic font-light text-smoke leading-[1.7] text-base">
          {material ? (
            <p>{material}. Hand-finished in our Parisian atelier.</p>
          ) : (
            <p>Crafted from the finest materials, hand-finished in Paris.</p>
          )}
          <dl className="grid grid-cols-2 gap-x-8 gap-y-4 mt-6 font-sans not-italic text-[0.7rem] tracking-[0.18em] uppercase">
            {product.origin_country && (
              <div>
                <dt className="text-gold">Origin</dt>
                <dd className="text-ink mt-1">{product.origin_country}</dd>
              </div>
            )}
            {product.type && (
              <div>
                <dt className="text-gold">Type</dt>
                <dd className="text-ink mt-1">{product.type.value}</dd>
              </div>
            )}
            {product.weight && (
              <div>
                <dt className="text-gold">Weight</dt>
                <dd className="text-ink mt-1">{product.weight} g</dd>
              </div>
            )}
          </dl>
        </div>
      ),
    },
    {
      label: "Care",
      content: (
        <div className="py-6 font-serif italic font-light text-smoke leading-[1.7] text-base">
          <p>
            Dry clean only. Store on a padded hanger away from direct sunlight.
            Avoid contact with perfumes and abrasive surfaces.
          </p>
        </div>
      ),
    },
    {
      label: "Delivery & Returns",
      content: (
        <div className="py-6 font-serif italic font-light text-smoke leading-[1.7] text-base">
          <p>
            Complimentary shipping worldwide on orders above €500. 30-day
            returns on all non-bespoke pieces. Each parcel arrives wrapped in
            our signature ivory tissue, sealed with a hand-pressed wax stamp.
          </p>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.content}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

export default ProductTabs
