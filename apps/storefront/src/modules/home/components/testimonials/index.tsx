import { SectionHeader } from "@modules/common/components/noors"

const QUOTES = [
  {
    quote:
      "Elora redefined what it means to dress with intention. Every seam tells a story.",
    cite: "— Harper. Bazaar India, March 2025",
  },
  {
    quote:
      "The silk gown I wore to the Cannes premiere drew more attention than anything I've worn in a decade.",
    cite: "— Sofia M., Actress",
  },
  {
    quote:
      "Architectural, feminine, and impossibly precise. A house to watch.",
    cite: "— Harper's Bazaar, 2025",
  },
]

export default function Testimonials() {
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
        {QUOTES.map((q, i) => (
          <blockquote
            key={i}
            className="testimonial text-center px-6 py-8 lg:border-l lg:border-gold/30 first:lg:border-l-0"
          >
            <p
              className="font-serif italic font-light text-ink leading-[1.6]"
              style={{ fontSize: "1.15rem" }}
            >
              "{q.quote}"
            </p>
            <cite
              className="block mt-6 text-[0.7rem] tracking-[0.3em] uppercase text-gold not-italic"
            >
              {q.cite}
            </cite>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
