import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  FloatAccentCircles,
  FloatAccentStar,
} from "@modules/common/components/noors"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""

/**
 * Elora Hero — full-bleed cinematic hero with Ken Burns, grain, deco, kinetic label.
 * Pure CSS animations; data-split + reveal classes are wired by NoorsMotion.
 */
const Hero = () => {
  return (
    <section className="hero relative h-screen min-h-[700px] w-full overflow-hidden flex items-center justify-center text-ivory">
      {/* Background image w/ Ken Burns */}
      <div className="hero__bg absolute inset-0 z-0">
        <Image
          src={`${BACKEND_URL}/static/hero_main.png`}
          alt="Elora — Woman in ivory silk gown"
          fill
          priority
          sizes="100vw"
          className="hero__img object-cover animate-hero-ken-burns will-change-transform"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(20,18,14,0.45), rgba(20,18,14,0.55)), radial-gradient(circle at 60% 40%, rgba(20,18,14,0) 0%, rgba(20,18,14,0.6) 100%)",
          }}
        />
      </div>

      {/* Grain */}
      <div className="grain" />

      {/* Decorative top line */}
      <svg
        className="absolute top-32 left-8 right-8 z-[3] pointer-events-none"
        style={{ height: 2 }}
        viewBox="0 0 600 2"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1="1"
          x2="600"
          y2="1"
          stroke="rgba(212,175,55,0.4)"
          strokeWidth="0.5"
        />
      </svg>

      {/* Content */}
      <div className="hero__content relative z-[4] text-center max-w-[760px] px-6">
        <p
          className="text-[0.72rem] tracking-[0.4em] uppercase text-gold-light mb-6 opacity-0 animate-fade-up"
          style={{ animationDelay: "0.3s" }}
        >
          S/S 2025 Collection
        </p>
        <h1
          className="font-serif font-light leading-[0.95] tracking-[-0.03em] text-ivory"
          style={{ fontSize: "clamp(3.5rem, 10vw, 8rem)" }}
        >
          <span
            className="block opacity-0 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            Dressed in
          </span>
          <span
            className="block italic text-champagne opacity-0 animate-fade-up"
            style={{ animationDelay: "0.75s", paddingLeft: "2rem" }}
          >
            Silence.
          </span>
        </h1>
        <p
          className="font-serif italic font-light text-ivory/85 mt-8 opacity-0 animate-fade-up"
          style={{
            animationDelay: "1s",
            fontSize: "clamp(1rem, 1.5vw, 1.3rem)",
          }}
        >
          Couture for women who move through the world with intention.
        </p>
        <div
          className="flex flex-wrap items-center justify-center gap-4 mt-12 opacity-0 animate-fade-up"
          style={{ animationDelay: "1.3s" }}
        >
          <LocalizedClientLink href="/store" className="btn btn--gold magnetic">
            Explore Collection
          </LocalizedClientLink>
          <a href="#story" className="btn btn--ghost">
            Our Story
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-3 opacity-0 animate-fade-up"
        style={{ animationDelay: "1.8s" }}
      >
        <span className="text-[0.6rem] tracking-[0.4em] uppercase text-gold">
          Scroll
        </span>
        <div className="relative w-px h-10 bg-gradient-to-b from-transparent via-gold to-transparent overflow-hidden">
          <span
            className="absolute left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold-light animate-scroll-dot"
            style={{ top: "50%" }}
          />
        </div>
      </div>

      {/* Floating vector ornaments */}
      <FloatAccentCircles
        style={{ top: "18%", right: "8%" }}
        className="float-accent--slow"
        size={60}
      />
      <FloatAccentStar
        style={{ bottom: "15%", left: "55%" }}
        className="float-accent--reverse"
        size={44}
      />
    </section>
  )
}

export default Hero
