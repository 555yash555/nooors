import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TESTIMONIAL_MODULE } from "../../modules/testimonial"

type Input = {
  quote: string
  citation: string
  sort_order?: number
  is_active?: boolean
}

export const createTestimonialStep = createStep(
  "create-testimonial",
  async (input: Input, { container }) => {
    const testimonialModuleService = container.resolve(TESTIMONIAL_MODULE)

    const testimonial = await testimonialModuleService.createTestimonials(
      input
    )

    return new StepResponse(testimonial, testimonial.id)
  },
  async (id, { container }) => {
    if (!id) return
    const testimonialModuleService = container.resolve(TESTIMONIAL_MODULE)
    await testimonialModuleService.deleteTestimonials(id)
  }
)
