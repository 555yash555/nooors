import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  // Both calls can legitimately return [] for a brand-new cart (no address
  // → no shipping rates available yet; payment methods only exist if the
  // region has providers linked). Empty results are NOT a reason to hide
  // the whole form — each step gates itself by ?step= and shows a CTA when
  // it can't proceed. Bailing on empty here was the root cause of the
  // blank checkout left column on first-time visitors.
  const shippingMethods = (await listCartShippingMethods(cart.id)) ?? []
  const paymentMethods =
    (await listCartPaymentMethods(cart.region?.id ?? "")) ?? []

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />

      <Shipping cart={cart} availableShippingMethods={shippingMethods} />

      <Payment cart={cart} availablePaymentMethods={paymentMethods} />

      <Review cart={cart} />
    </div>
  )
}
