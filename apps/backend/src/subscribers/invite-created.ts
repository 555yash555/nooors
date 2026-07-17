import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { inviteCreatedEmail } from "../modules/resend/templates/invite-created"

export default async function inviteCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const userModuleService = container.resolve(Modules.USER)
  const notificationModuleService = container.resolve(Modules.NOTIFICATION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const invite = await userModuleService.retrieveInvite(data.id)

  const acceptUrl = `${
    process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
  }/app/invite?token=${invite.token}`

  const { subject, html } = inviteCreatedEmail(acceptUrl)

  try {
    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: "email",
      template: "invite-created",
      content: { subject, html },
    })
  } catch (error) {
    logger.error(`Failed to send invite email to ${invite.email}`, error)
  }
}

export const config: SubscriberConfig = {
  event: "invite.created",
}
