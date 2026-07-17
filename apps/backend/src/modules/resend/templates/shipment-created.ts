import { renderLayout } from "./layout"

export function shipmentCreatedEmail(
  displayId: number | string,
  orderId: string,
  storefrontUrl: string,
  tracking?: { number?: string | null; url?: string | null } | null
): { subject: string; html: string } {
  const trackingHtml = tracking?.number
    ? `<p style="margin-top:16px;">
        Tracking number: <strong>${tracking.number}</strong>
        ${tracking.url ? `<br/><a href="${tracking.url}" style="color:#b89968;">Track your package</a>` : ""}
      </p>`
    : ""

  const bodyHtml = `
    <p>Your order #${displayId} is on its way.</p>
    ${trackingHtml}
  `

  return {
    subject: `Your Elora order #${displayId} has shipped`,
    html: renderLayout({
      preheader: `Order #${displayId} has shipped.`,
      heading: `Order #${displayId} has shipped`,
      bodyHtml,
      ctaLabel: "View your order",
      ctaUrl: `${storefrontUrl}/order/${orderId}/confirmed`,
    }),
  }
}
