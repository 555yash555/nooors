import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { passwordResetEmail } from "../modules/resend/templates/password-reset"

type PasswordResetData = {
  entity_id: string
  actor_type: "customer" | "user" | string
  token: string
}

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<PasswordResetData>) {
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const isAdmin = data.actor_type === "user"

  const resetUrl = isAdmin
    ? `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/app/reset-password?token=${data.token}&email=${encodeURIComponent(data.entity_id)}`
    : `${process.env.STOREFRONT_URL || "http://localhost:8000"}/reset-password?token=${data.token}&email=${encodeURIComponent(data.entity_id)}`

  const { subject, html } = passwordResetEmail(resetUrl, isAdmin)

  try {
    await notificationModuleService.createNotifications({
      to: data.entity_id,
      channel: "email",
      template: "password-reset",
      content: { subject, html },
    })
  } catch (error) {
    logger.error(`Failed to send password-reset email to ${data.entity_id}`, error)
  }
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
}
