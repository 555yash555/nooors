import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { updateTestimonialStep } from "./steps/update-testimonial"

type Input = {
  id: string
  quote?: string
  citation?: string
  sort_order?: number
  is_active?: boolean
}

const updateTestimonialWorkflow = createWorkflow(
  "update-testimonial",
  function (input: Input) {
    const testimonial = updateTestimonialStep(input)

    return new WorkflowResponse({ testimonial })
  }
)

export default updateTestimonialWorkflow
