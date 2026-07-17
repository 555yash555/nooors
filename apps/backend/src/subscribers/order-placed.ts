import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { orderPlacedEmail } from "../modules/resend/templates/order-placed"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService = container.resolve(Modules.ORDER)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  // `total` (order- and line-item-level) is a computed BigNumber field.
  // Medusa only runs that computation when a total-ish field (here just
  // "total" is enough) is present in `select` — it then auto-attaches the
  // relations (items.tax_lines, items.adjustments, etc.) the calculation
  // needs. Without a total field in `select`, these silently come back 0.
  const order = await orderModuleService.retrieveOrder(data.id, {
    select: ["email", "display_id", "currency_code", "total"],
    relations: ["items", "shipping_address"],
  })

  if (!order.email) {
    return
  }

  const { subject, html } = orderPlacedEmail(
    order as any,
    process.env.STOREFRONT_URL || "http://localhost:8000"
  )

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-placed",
      content: { subject, html },
    })
  } catch (error) {
    logger.error(`Failed to send order-placed email for order ${order.id}`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
