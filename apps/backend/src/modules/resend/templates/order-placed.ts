import { renderLayout, formatMoney } from "./layout"

type OrderItem = {
  title: string
  quantity: number
  total?: number | null
}

type OrderForEmail = {
  id: string
  display_id: number | string
  email: string
  currency_code: string
  total: number
  items?: OrderItem[] | null
  shipping_address?: {
    first_name?: string | null
    last_name?: string | null
    address_1?: string | null
    address_2?: string | null
    city?: string | null
    postal_code?: string | null
    country_code?: string | null
  } | null
}

export function orderPlacedEmail(
  order: OrderForEmail,
  storefrontUrl: string
): { subject: string; html: string } {
  const itemsHtml = (order.items ?? [])
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #ede6da; font-size:14px; color:#1a1814;">${item.title} &times; ${item.quantity}</td>
        <td style="padding:10px 0; border-bottom:1px solid #ede6da; font-size:14px; color:#1a1814; text-align:right;">${formatMoney(
          item.total ?? 0,
          order.currency_code
        )}</td>
      </tr>`
    )
    .join("")

  const address = order.shipping_address
  const addressHtml = address
    ? `<p style="margin:16px 0 0;">
        ${address.first_name ?? ""} ${address.last_name ?? ""}<br/>
        ${address.address_1 ?? ""}${address.address_2 ? `, ${address.address_2}` : ""}<br/>
        ${address.city ?? ""}, ${address.postal_code ?? ""}<br/>
        ${address.country_code?.toUpperCase() ?? ""}
      </p>`
    : ""

  const bodyHtml = `
    <p>Thank you for your order. We're preparing it with care.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
      ${itemsHtml}
      <tr>
        <td style="padding:16px 0 0; font-size:15px; color:#1a1814; font-weight:600;">Total</td>
        <td style="padding:16px 0 0; font-size:15px; color:#1a1814; font-weight:600; text-align:right;">${formatMoney(
          order.total,
          order.currency_code
        )}</td>
      </tr>
    </table>
    ${addressHtml}
  `

  return {
    subject: `Your Elora order #${order.display_id} is confirmed`,
    html: renderLayout({
      preheader: `Order #${order.display_id} confirmed — thank you for shopping with Elora.`,
      heading: `Order #${order.display_id} confirmed`,
      bodyHtml,
      ctaLabel: "View your order",
      ctaUrl: `${storefrontUrl}/order/${order.id}/confirmed`,
    }),
  }
}
