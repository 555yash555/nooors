import { model } from "@medusajs/framework/utils"

/**
 * Press mentions / client quotes shown in the homepage Testimonials section.
 * `sort_order` controls display order (ascending); `is_active` lets a
 * merchant hide a quote without deleting it.
 */
const Testimonial = model.define("testimonial", {
  id: model.id().primaryKey(),
  quote: model.text(),
  citation: model.text(),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default Testimonial
