import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { reassignGuestOrdersStep } from "./steps/reassign-guest-orders"
import { softDeleteGuestCustomersStep } from "./steps/soft-delete-guest-customers"

type LinkGuestOrdersWorkflowInput = {
  guestCustomerIds: string[]
  newCustomerId: string
}

// Guest checkout creates a real `customer` row (has_account: false, no login
// credentials) to hold the order. If that same person later registers a real
// account with the same email, Medusa doesn't link the two — the guest row
// and its orders are permanently orphaned otherwise. This re-points those
// orders at the new account and retires the now-empty guest row.
export const linkGuestOrdersWorkflow = createWorkflow(
  "link-guest-orders",
  (input: LinkGuestOrdersWorkflowInput) => {
    const orderIds = reassignGuestOrdersStep(input)
    softDeleteGuestCustomersStep({
      guestCustomerIds: input.guestCustomerIds,
    })

    return new WorkflowResponse(orderIds)
  }
)
