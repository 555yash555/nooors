import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type Input = {
  guestCustomerIds: string[]
  newCustomerId: string
}

export const reassignGuestOrdersStep = createStep(
  "reassign-guest-orders",
  async ({ guestCustomerIds, newCustomerId }: Input, { container }) => {
    const orderModuleService = container.resolve(Modules.ORDER)

    const orders = await orderModuleService.listOrders({
      customer_id: guestCustomerIds,
    })

    if (!orders.length) {
      return new StepResponse([], [])
    }

    const previous = orders.map((o) => ({
      id: o.id,
      customer_id: o.customer_id,
    }))

    await orderModuleService.updateOrders(
      orders.map((o) => ({ id: o.id, customer_id: newCustomerId }))
    )

    return new StepResponse(
      orders.map((o) => o.id),
      previous
    )
  },
  async (previous, { container }) => {
    if (!previous?.length) {
      return
    }
    const orderModuleService = container.resolve(Modules.ORDER)
    await orderModuleService.updateOrders(
      previous.map((p) => ({ id: p.id, customer_id: p.customer_id }))
    )
  }
)
