import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import { Ornament } from "@modules/common/components/noors"
import { HttpTypes } from "@medusajs/types"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"

  return (
    <div className="pt-28 lg:pt-32 pb-16 lg:pb-24 min-h-[calc(100vh-64px)]">
      <div className="content-container">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        {/* HERO */}
        <div className="text-center max-w-2xl mx-auto mb-16" data-testid="order-complete-container">
          <span className="text-[0.65rem] tracking-[0.35em] uppercase text-gold">
            Confirmed
          </span>
          <h1 className="font-serif font-light text-ink mt-6"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em", lineHeight: 1.05 }}>
            Thank you.<br />
            <em className="text-gold">Your piece is on its way.</em>
          </h1>
          <Ornament />
          <p className="font-serif italic font-light text-smoke leading-[1.7] mt-4 text-base">
            Each Elora piece is hand-prepared in our atelier before
            dispatch. You'll receive an update the moment it leaves us.
          </p>
        </div>

        {/* META */}
        <OrderDetails order={order} />

        {/* SUMMARY */}
        <section className="mt-16">
          <SectionTitle label="Your Order" title="Summary" />
          <Items order={order} />
          <div className="mt-8 border-t border-gold/20 pt-6">
            <CartTotals totals={order} />
          </div>
        </section>

        {/* DELIVERY */}
        <section className="mt-16">
          <SectionTitle label="Where it goes" title="Delivery" />
          <ShippingDetails order={order} />
        </section>

        {/* PAYMENT */}
        <section className="mt-16">
          <SectionTitle label="How you paid" title="Payment" />
          <PaymentDetails order={order} />
        </section>

        {/* HELP */}
        <div className="mt-16 text-center">
          <Help />
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-8 flex items-baseline gap-6 border-b border-gold/20 pb-3">
      <span className="text-[0.65rem] tracking-[0.3em] uppercase text-gold">
        {label}
      </span>
      <h2 className="font-serif font-light text-ink text-3xl">
        {title}
      </h2>
    </div>
  )
}
