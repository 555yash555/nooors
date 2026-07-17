import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { TESTIMONIAL_MODULE } from "../../modules/testimonial"

export const deleteTestimonialStep = createStep(
  "delete-testimonial",
  async (id: string, { container }) => {
    const testimonialModuleService = container.resolve(TESTIMONIAL_MODULE)

    const previous = await testimonialModuleService.retrieveTestimonial(id)

    await testimonialModuleService.deleteTestimonials(id)

    return new StepResponse({ id }, previous)
  },
  async (previous, { container }) => {
    if (!previous) return
    const testimonialModuleService = container.resolve(TESTIMONIAL_MODULE)
    await testimonialModuleService.createTestimonials({
      id: previous.id,
      quote: previous.quote,
      citation: previous.citation,
      sort_order: previous.sort_order,
      is_active: previous.is_active,
    })
  }
)
