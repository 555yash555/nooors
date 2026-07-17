import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { TESTIMONIAL_MODULE } from "../../../modules/testimonial"
import createTestimonialWorkflow from "../../../workflows/create-testimonial"
import { CreateTestimonialSchema } from "./middlewares"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const testimonialModuleService = req.scope.resolve(TESTIMONIAL_MODULE)

  const testimonials = await testimonialModuleService.listTestimonials(
    {},
    { order: { sort_order: "ASC" } }
  )

  return res.status(200).json({ testimonials })
}

export async function POST(
  req: MedusaRequest<CreateTestimonialSchema>,
  res: MedusaResponse
) {
  const { result } = await createTestimonialWorkflow(req.scope).run({
    input: req.validatedBody,
  })

  return res.status(200).json({ testimonial: result.testimonial })
}
