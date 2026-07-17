import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TESTIMONIAL_MODULE } from "../../modules/testimonial"

type Input = {
  id: string
  quote?: string
  citation?: string
  sort_order?: number
  is_active?: boolean
}

export const updateTestimonialStep = createStep(
  "update-testimonial",
  async (input: Input, { container }) => {
    const testimonialModuleService = container.resolve(TESTIMONIAL_MODULE)

    const previous = await testimonialModuleService.retrieveTestimonial(
      input.id
    )

    const testimonial = await testimonialModuleService.updateTestimonials(
      input
    )

    return new StepResponse(testimonial, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    const testimonialModuleService = container.resolve(TESTIMONIAL_MODULE)
    await testimonialModuleService.updateTestimonials({
      id: previous.id,
      quote: previous.quote,
      citation: previous.citation,
      sort_order: previous.sort_order,
      is_active: previous.is_active,
    })
  }
)
