import { HttpTypes } from "@medusajs/types"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

/**
 * Elora order meta block — three labeled facts on a couture row.
 */
const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    if (!str) return "—"
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto py-6 border-y border-gold/15">
      <Field label="Confirmation Sent To" value={order.email} testId="order-email" mono />
      <Field
        label="Order Date"
        value={new Date(order.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        testId="order-date"
      />
      <Field
        label="Order Number"
        value={`Nº ${order.display_id}`}
        testId="order-id"
        accent
      />
      {showStatus && (
        <>
          <Field
            label="Order Status"
            value={formatStatus(order.fulfillment_status)}
            testId="order-status"
          />
          <Field
            label="Payment Status"
            value={formatStatus(order.payment_status)}
            testId="order-payment-status"
          />
        </>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  testId,
  accent,
  mono,
}: {
  label: string
  value?: string | null
  testId?: string
  accent?: boolean
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-2">
        {label}
      </p>
      <p
        className={`text-base ${mono ? "font-sans" : "font-serif"} ${accent ? "text-gold" : "text-ink"} break-words`}
        data-testid={testId}
      >
        {value}
      </p>
    </div>
  )
}

export default OrderDetails
