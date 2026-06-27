import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"
import { HttpTypes } from "@medusajs/types"

/**
 * Elora Checkout Summary panel — bone card with gold border, proper
 * internal padding, scrollable item preview.
 */
const CheckoutSummary = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  return (
    <div className="small:sticky small:top-32 flex flex-col gap-y-6 py-6 small:py-0">
      <div
        className="w-full bg-cream/40 border border-gold/20 flex flex-col p-8"
      >
        <div className="flex items-baseline justify-between">
          <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold">
            Order
          </span>
          <h2 className="font-serif font-light text-ink text-3xl">
            Your Bag
          </h2>
        </div>

        <div className="my-6 border-t border-gold/20" />

        <CartTotals totals={cart} />

        <div className="my-6 border-t border-gold/15" />

        <ItemsPreviewTemplate cart={cart} />

        <div className="my-6 border-t border-gold/15" />

        <DiscountCode cart={cart} />
      </div>
    </div>
  )
}

export default CheckoutSummary
