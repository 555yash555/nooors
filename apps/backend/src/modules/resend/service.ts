import {
  AbstractNotificationProviderService,
  MedusaError,
} from "@medusajs/framework/utils"
import { Logger } from "@medusajs/framework/types"
import {
  ProviderSendNotificationDTO,
  ProviderSendNotificationResultsDTO,
} from "@medusajs/framework/types"
import { Resend } from "resend"

type Options = {
  api_key: string
  from: string
}

type InjectedDependencies = {
  logger: Logger
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "resend"

  protected config_: Options
  protected logger_: Logger
  protected client_: Resend

  constructor({ logger }: InjectedDependencies, options: Options) {
    super()
    this.config_ = options
    this.logger_ = logger
    this.client_ = new Resend(options.api_key)
  }

  static validateOptions(options: Record<string, unknown>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend notification provider requires the api_key option"
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Resend notification provider requires the from option"
      )
    }
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    if (!notification) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No notification information provided"
      )
    }

    if (!notification.content?.html) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Resend notification provider requires pre-rendered content.html (template "${notification.template}" did not supply it)`
      )
    }

    const from = notification.from?.trim() || this.config_.from

    const { data, error } = await this.client_.emails.send({
      from,
      to: notification.to,
      subject: notification.content.subject ?? notification.template,
      html: notification.content.html,
    })

    if (error) {
      this.logger_.error(
        `Failed to send email via Resend (template: ${notification.template}): ${error.message}`
      )
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to send email via Resend: ${error.message}`
      )
    }

    return { id: data?.id }
  }
}

export default ResendNotificationProviderService
