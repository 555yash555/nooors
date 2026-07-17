import { renderLayout } from "./layout"

export function orderCanceledEmail(
  displayId: number | string,
  orderId: string,
  storefrontUrl: string
): { subject: string; html: string } {
  const bodyHtml = `
    <p>Your order #${displayId} has been canceled.</p>
    <p>If a payment was captured, any applicable refund will be processed back to your original payment method. If you have questions about this cancellation, please get in touch.</p>
  `

  return {
    subject: `Your Elora order #${displayId} has been canceled`,
    html: renderLayout({
      preheader: `Order #${displayId} has been canceled.`,
      heading: `Order #${displayId} canceled`,
      bodyHtml,
      ctaLabel: "View your order",
      ctaUrl: `${storefrontUrl}/order/${orderId}/confirmed`,
    }),
  }
}
