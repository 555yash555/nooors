import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type Input = {
  guestCustomerIds: string[]
}

export const softDeleteGuestCustomersStep = createStep(
  "soft-delete-guest-customers",
  async ({ guestCustomerIds }: Input, { container }) => {
    const customerModuleService = container.resolve(Modules.CUSTOMER)
    await customerModuleService.softDeleteCustomers(guestCustomerIds)
    return new StepResponse(guestCustomerIds, guestCustomerIds)
  },
  async (guestCustomerIds, { container }) => {
    if (!guestCustomerIds?.length) {
      return
    }
    const customerModuleService = container.resolve(Modules.CUSTOMER)
    await customerModuleService.restoreCustomers(guestCustomerIds)
  }
)
