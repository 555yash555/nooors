import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { deliveryCreatedEmail } from "../modules/resend/templates/delivery-created"

export default async function deliveryCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  if (data.no_notification) {
    return
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data: fulfillments } = await query.graph({
    entity: "fulfillment",
    fields: ["id", "order.id", "order.display_id", "order.email"],
    filters: { id: data.id } as any,
  })

  const order = (fulfillments[0] as any)?.order

  if (!order?.email) {
    return
  }

  const { subject, html } = deliveryCreatedEmail(
    order.display_id ?? order.id,
    order.id,
    process.env.STOREFRONT_URL || "http://localhost:8000"
  )

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "delivery-created",
      content: { subject, html },
    })
  } catch (error) {
    logger.error(`Failed to send delivery-created email for order ${order.id}`, error)
  }
}

export const config: SubscriberConfig = {
  event: "delivery.created",
}
