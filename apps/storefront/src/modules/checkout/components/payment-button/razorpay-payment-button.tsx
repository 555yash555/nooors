"use client"

import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import { useCallback, useEffect, useState } from "react"
import { useRazorpay, RazorpayOrderOptions } from "react-razorpay"
import { CurrencyCode } from "react-razorpay/dist/constants/currency"

import ErrorMessage from "../error-message"

type Props = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

/**
 * Elora Razorpay button.
 *
 * The Medusa Razorpay provider creates the Razorpay order server-side during
 * `initiatePaymentSession` and returns its id inside `session.data.razorpayOrder`.
 * This button opens the Razorpay checkout modal with that id, then — on
 * successful payment — calls Medusa's `placeOrder()` which triggers server-side
 * signature verification via `authorizePayment` on the provider.
 */
const RazorpayPaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: Props) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { Razorpay } = useRazorpay()

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )
  const razorpayOrderId =
    (session?.data as { razorpayOrder?: { id?: string } } | undefined)
      ?.razorpayOrder?.id ?? ""

  const [ready, setReady] = useState(!!razorpayOrderId)
  useEffect(() => {
    setReady(!!razorpayOrderId)
  }, [razorpayOrderId])

  const onPaymentCompleted = async () => {
    await placeOrder().catch((err) => {
      setErrorMessage(err?.message ?? "Could not place the order.")
      setSubmitting(false)
    })
  }

  const handlePayment = useCallback(() => {
    if (!razorpayOrderId || !session) return
    setSubmitting(true)
    setErrorMessage(null)

    // Medusa stores amounts in the currency's minor unit already (paise for
    // INR). Razorpay's `amount` field also expects paise, so pass through
    // verbatim — no ×100.
    const amountInPaise = Math.round(Number(session.amount))

    const options: RazorpayOrderOptions = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
      callback_url: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/hooks/payment/razorpay_razorpay`,
      amount: amountInPaise,
      order_id: razorpayOrderId,
      currency: cart.currency_code.toUpperCase() as CurrencyCode,
      name: process.env.NEXT_PUBLIC_SHOP_NAME ?? "Elora by Harnoor",
      description:
        process.env.NEXT_PUBLIC_SHOP_DESCRIPTION ??
        `Order ${razorpayOrderId}`,
      remember_customer: true,
      modal: {
        backdropclose: true,
        escape: true,
        handleback: true,
        confirm_close: true,
        animation: true,
        ondismiss: () => {
          setSubmitting(false)
          setErrorMessage("Payment cancelled.")
        },
      },
      handler: () => {
        // Fires when Razorpay redirects back after success. The provider
        // module verifies the signature; we then finalize the Medusa cart.
        onPaymentCompleted()
      },
      prefill: {
        name: [
          cart.billing_address?.first_name,
          cart.billing_address?.last_name,
        ]
          .filter(Boolean)
          .join(" "),
        email: cart.email ?? undefined,
        contact:
          cart.billing_address?.phone ??
          cart.shipping_address?.phone ??
          undefined,
      },
    }

    const rzp = new Razorpay(options)
    rzp.on("payment.failed", (response: { error?: { description?: string } }) => {
      setErrorMessage(response?.error?.description ?? "Payment failed.")
      setSubmitting(false)
    })
    rzp.open()
  }, [Razorpay, cart, razorpayOrderId, session])

  return (
    <>
      <Button
        disabled={submitting || notReady || !ready}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="razorpay-payment-error-message"
      />
    </>
  )
}

export default RazorpayPaymentButton
