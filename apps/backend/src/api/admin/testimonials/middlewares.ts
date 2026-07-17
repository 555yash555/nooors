import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "zod"

export const CreateTestimonialSchema = z.object({
  quote: z.string().min(1),
  citation: z.string().min(1),
  sort_order: z.number().optional(),
  is_active: z.boolean().optional(),
})

export type CreateTestimonialSchema = z.infer<typeof CreateTestimonialSchema>

export const UpdateTestimonialSchema = z.object({
  quote: z.string().min(1).optional(),
  citation: z.string().min(1).optional(),
  sort_order: z.number().optional(),
  is_active: z.boolean().optional(),
})

export type UpdateTestimonialSchema = z.infer<typeof UpdateTestimonialSchema>

export const testimonialMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/testimonials",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateTestimonialSchema)],
  },
  {
    matcher: "/admin/testimonials/:id",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateTestimonialSchema)],
  },
]
