import { isStripeLike, paymentInfoMap } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]
  if (!payment) return null

  const provider = paymentInfoMap[payment.provider_id]
  const detail =
    isStripeLike(payment.provider_id) && payment.data?.card_last4
      ? `**** **** **** ${payment.data.card_last4}`
      : `${convertToLocale({
          amount: payment.amount,
          currency_code: order.currency_code,
        })} · ${new Date(payment.created_at ?? "").toLocaleString()}`

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      <div>
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
          Method
        </p>
        <p
          className="font-serif text-base text-ink"
          data-testid="payment-method"
        >
          {provider?.title || payment.provider_id}
        </p>
      </div>
      <div className="sm:col-span-2">
        <p className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
          Details
        </p>
        <div className="font-serif text-base text-ink flex items-center gap-3">
          {provider?.icon && (
            <span className="w-8 h-6 flex items-center justify-center bg-cream">
              {provider.icon}
            </span>
          )}
          <span data-testid="payment-amount">{detail}</span>
        </div>
      </div>
    </div>
  )
}

export default PaymentDetails
