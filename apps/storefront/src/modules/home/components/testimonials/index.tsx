import { SectionHeader } from "@modules/common/components/noors"
import { listTestimonials } from "@lib/data/testimonials"

/**
 * Elora press/client testimonials — backed by the `testimonial` module,
 * editable (add/edit/reorder/hide) from the admin panel's Site Content page.
 */
export default async function Testimonials() {
  const testimonials = await listTestimonials()

  if (testimonials.length === 0) return null

  return (
    <section className="testimonials py-16 lg:py-32 relative">
      <SectionHeader label="Press & Clients" title="Worn & Praised" />
      <div
        className="grid gap-12 mt-12 mx-auto"
        style={{
          maxWidth: "var(--max-w)",
          paddingLeft: "var(--pad-x)",
          paddingRight: "var(--pad-x)",
          gridTemplateColumns: `repeat(auto-fit, minmax(min(280px, 100%), 1fr))`,
        }}
      >
        {testimonials.map((t) => (
          <blockquote
            key={t.id}
            className="testimonial text-center px-6 py-8 lg:border-l lg:border-gold/30 first:lg:border-l-0"
          >
            <p
              className="font-serif italic font-light text-ink leading-[1.6]"
              style={{ fontSize: "1.15rem" }}
            >
              "{t.quote}"
            </p>
            <cite
              className="block mt-6 text-[0.7rem] tracking-[0.3em] uppercase text-gold not-italic"
            >
              {t.citation}
            </cite>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
