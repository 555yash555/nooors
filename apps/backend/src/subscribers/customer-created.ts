import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { customerWelcomeEmail } from "../modules/resend/templates/customer-welcome"

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const customerModuleService = container.resolve(Modules.CUSTOMER)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const customer = await customerModuleService.retrieveCustomer(data.id)

  // Guest checkout customers don't have an account/password — skip them.
  if (!customer.email || customer.has_account === false) {
    return
  }

  const { subject, html } = customerWelcomeEmail(
    customer.first_name,
    process.env.STOREFRONT_URL || "http://localhost:8000"
  )

  try {
    await notificationModuleService.createNotifications({
      to: customer.email,
      channel: "email",
      template: "customer-welcome",
      content: { subject, html },
    })
  } catch (error) {
    logger.error(`Failed to send welcome email to ${customer.email}`, error)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
