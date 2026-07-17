import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TESTIMONIAL_MODULE } from "../../../modules/testimonial"

/**
 * Public — active testimonials only, ordered for display.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const testimonialModuleService = req.scope.resolve(TESTIMONIAL_MODULE)

  const testimonials = await testimonialModuleService.listTestimonials(
    { is_active: true },
    { order: { sort_order: "ASC" } }
  )

  return res.status(200).json({ testimonials })
}
