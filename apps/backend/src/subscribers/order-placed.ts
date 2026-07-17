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

  const order = await orderModuleService.retrieveOrder(data.id, {
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
