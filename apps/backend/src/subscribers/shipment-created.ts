import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { shipmentCreatedEmail } from "../modules/resend/templates/shipment-created"

export default async function shipmentCreatedHandler({
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
    fields: [
      "id",
      "order.id",
      "order.display_id",
      "order.email",
      "labels.tracking_number",
      "labels.tracking_url",
    ],
    filters: { id: data.id } as any,
  })

  const fulfillment = fulfillments[0] as any
  const order = fulfillment?.order

  if (!order?.email) {
    return
  }

  const label = fulfillment.labels?.[0]

  const { subject, html } = shipmentCreatedEmail(
    order.display_id ?? order.id,
    process.env.STOREFRONT_URL || "http://localhost:8000",
    label
      ? { number: label.tracking_number, url: label.tracking_url }
      : undefined
  )

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: "shipment-created",
      content: { subject, html },
    })
  } catch (error) {
    logger.error(`Failed to send shipment-created email for order ${order.id}`, error)
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
