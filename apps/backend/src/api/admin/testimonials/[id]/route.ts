import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import updateTestimonialWorkflow from "../../../../workflows/update-testimonial"
import deleteTestimonialWorkflow from "../../../../workflows/delete-testimonial"
import { UpdateTestimonialSchema } from "../middlewares"

export async function POST(
  req: MedusaRequest<UpdateTestimonialSchema>,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await updateTestimonialWorkflow(req.scope).run({
    input: { id, ...req.validatedBody },
  })

  return res.status(200).json({ testimonial: result.testimonial })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params

  await deleteTestimonialWorkflow(req.scope).run({
    input: { id },
  })

  return res.status(200).json({ id, object: "testimonial", deleted: true })
}
