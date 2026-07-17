import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createTestimonialStep } from "./steps/create-testimonial"

type Input = {
  quote: string
  citation: string
  sort_order?: number
  is_active?: boolean
}

const createTestimonialWorkflow = createWorkflow(
  "create-testimonial",
  function (input: Input) {
    const testimonial = createTestimonialStep(input)

    return new WorkflowResponse({ testimonial })
  }
)

export default createTestimonialWorkflow
