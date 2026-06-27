import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

/**
 * NOOORS delivery block — 3 labeled columns: address, contact, method.
 */
const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  const a = order.shipping_address
  const method = order.shipping_methods?.[0] as { name?: string; total?: number } | undefined

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      <Col label="Shipping Address" testId="shipping-address-summary">
        <p>{a?.first_name} {a?.last_name}</p>
        <p>{a?.address_1} {a?.address_2}</p>
        <p>{a?.postal_code}, {a?.city}</p>
        <p>{a?.country_code?.toUpperCase()}</p>
      </Col>

      <Col label="Contact" testId="shipping-contact-summary">
        <p>{a?.phone}</p>
        <p>{order.email}</p>
      </Col>

      <Col label="Method" testId="shipping-method-summary">
        <p>{method?.name}</p>
        <p className="text-smoke">
          {convertToLocale({
            amount: method?.total ?? 0,
            currency_code: order.currency_code,
          })}
        </p>
      </Col>
    </div>
  )
}

function Col({
  label,
  testId,
  children,
}: {
  label: string
  testId?: string
  children: React.ReactNode
}) {
  return (
    <div data-testid={testId}>
      <p className="text-[0.6rem] tracking-[0.3em] uppercase text-gold mb-3">
        {label}
      </p>
      <div className="font-serif text-base text-ink space-y-1 leading-relaxed">
        {children}
      </div>
    </div>
  )
}

export default ShippingDetails
