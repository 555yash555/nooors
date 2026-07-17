import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { orderCanceledEmail } from "../modules/resend/templates/order-canceled"

export default async function orderCanceledHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const orderModuleService = container.resolve(Modules.ORDER)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const order = await orderModuleService.retrieveOrder(data.id)

  if (!order.email) {
    return
  }

  const { subject, html } = orderCanceledEmail(
    order.display_id,
    process.env.STOREFRONT_URL || "http://localhost:8000"
  )

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "order-canceled",
      content: { subject, html },
    })
  } catch (error) {
    logger.error(`Failed to send order-canceled email for order ${order.id}`, error)
  }
}

export const config: SubscriberConfig = {
  event: "order.canceled",
}
