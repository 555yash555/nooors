import { renderLayout } from "./layout"

export function deliveryCreatedEmail(
  displayId: number | string,
  orderId: string,
  storefrontUrl: string
): { subject: string; html: string } {
  const bodyHtml = `
    <p>Your order #${displayId} has been delivered. We hope you love it.</p>
    <p>If anything isn't quite right, reach out and we'll make it right.</p>
  `

  return {
    subject: `Your Elora order #${displayId} has arrived`,
    html: renderLayout({
      preheader: `Order #${displayId} has been delivered.`,
      heading: `Order #${displayId} delivered`,
      bodyHtml,
      ctaLabel: "View your order",
      ctaUrl: `${storefrontUrl}/order/${orderId}/confirmed`,
    }),
  }
}
