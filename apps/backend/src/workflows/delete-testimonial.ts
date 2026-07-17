import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { deleteTestimonialStep } from "./steps/delete-testimonial"

type Input = {
  id: string
}

const deleteTestimonialWorkflow = createWorkflow(
  "delete-testimonial",
  function (input: Input) {
    const result = deleteTestimonialStep(input.id)

    return new WorkflowResponse(result)
  }
)

export default deleteTestimonialWorkflow
