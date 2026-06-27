import {
  FloatAccentCircles,
  Ornament,
} from "@modules/common/components/noors"

export default function Newsletter() {
  return (
    <section
      id="contact"
      className="newsletter relative bg-ink text-ivory overflow-hidden py-16 lg:py-32 px-6"
    >
      {/* Decorative blobs */}
      <div
        className="absolute -top-20 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(184,153,104,0.15) 0%, rgba(184,153,104,0) 70%)",
        }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(212,183,135,0.12) 0%, rgba(212,183,135,0) 70%)",
        }}
      />

      <FloatAccentCircles
        style={{ top: "3rem", left: "8%", opacity: 0.25 }}
        className="float-accent--slow"
        size={80}
      />

      <div className="newsletter__inner relative z-[2] mx-auto max-w-[600px] text-center">
        <span className="section-label section-label--light">
          Private Access
        </span>
        <h2
          className="font-serif font-light text-ivory mt-6"
          data-split
          style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          Join the Inner Circle
        </h2>
        <Ornament light />
        <p
          className="font-serif italic font-light text-ivory/70 mt-2"
          style={{ fontSize: "1.05rem" }}
        >
          First access to new collections, atelier events, and private client
          evenings.
        </p>
        <form
          className="flex items-stretch mt-10 max-w-[480px] mx-auto border-b border-ivory/25 focus-within:border-gold transition-colors"
          action="#"
          method="POST"
        >
          <input
            type="email"
            required
            placeholder="Your email address"
            className="flex-1 bg-transparent text-ivory font-sans text-sm py-4 placeholder:text-ivory/40 focus:outline-none"
          />
          <button
            type="submit"
            className="btn btn--ghost border-0 hover:!translate-y-0"
            style={{ color: "var(--gold-light)" }}
          >
            Join
          </button>
        </form>
        <p className="text-[0.7rem] tracking-[0.18em] uppercase text-ivory/40 mt-4">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  )
}
