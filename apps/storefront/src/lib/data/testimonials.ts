import { sdk } from "@lib/config"

export type Testimonial = {
  id: string
  quote: string
  citation: string
  sort_order: number
  is_active: boolean
}

/**
 * Active press/client quotes for the homepage Testimonials section, in
 * display order. Backed by the `testimonial` module; editable from the
 * admin panel's "Site Content" page.
 *
 * Short shared time-based revalidation (not the per-session cache-tag
 * helper) — admin edits happen in a separate session that can't invalidate
 * a visitor-scoped tag. See site-content.ts for the same reasoning.
 */
export const listTestimonials = async (): Promise<Testimonial[]> => {
  return sdk.client
    .fetch<{ testimonials: Testimonial[] }>("/store/testimonials", {
      next: { revalidate: 30 },
    })
    .then(({ testimonials }) => testimonials)
}
