import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { customerWelcomeEmail } from "../modules/resend/templates/customer-welcome"
import { linkGuestOrdersWorkflow } from "../workflows/link-guest-orders"

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

  // A guest checkout under this same email earlier would have created a
  // separate, accountless customer row holding its own orders — Medusa
  // doesn't link those to a real account automatically. Re-point them now.
  const guestCustomers = await customerModuleService.listCustomers({
    email: customer.email,
    has_account: false,
  })

  if (guestCustomers.length) {
    try {
      await linkGuestOrdersWorkflow(container).run({
        input: {
          guestCustomerIds: guestCustomers.map((c) => c.id),
          newCustomerId: customer.id,
        },
      })
    } catch (error) {
      logger.error(`Failed to link guest orders for ${customer.email}`, error)
    }
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
