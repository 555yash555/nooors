import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework/http"
import { z } from "zod"

export const UpsertSiteContentSchema = z.object({
  data: z.record(z.string(), z.unknown()),
})

export type UpsertSiteContentSchema = z.infer<typeof UpsertSiteContentSchema>

export const siteContentMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/site-content/:key",
    method: "POST",
    middlewares: [validateAndTransformBody(UpsertSiteContentSchema)],
  },
]
