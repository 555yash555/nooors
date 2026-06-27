import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  CornerBracket,
  DrawLine,
} from "@modules/common/components/noors"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || ""

/**
 * NOOORS Cinematic split — image left, copy right (or stacked on mobile).
 * The image-side uses .clip-reveal (animated by NoorsMotion IntersectionObserver).
 */
export default function Cinematic() {
  return (
    <section
      id="story"
      className="cinematic grid grid-cols-1 lg:grid-cols-2 lg:min-h-[85vh] bg-ink text-ivory relative"
    >
      {/* Vertical side label */}
      <span
        className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-10 origin-left text-[0.65rem] tracking-[0.4em] uppercase text-gold-light/70 whitespace-nowrap"
        style={{ transform: "rotate(-90deg) translateY(-50%)" }}
      >
        The Atelier · Est. Paris
      </span>

      {/* IMAGE SIDE */}
      <div className="cinematic__image-side relative min-h-[55vh] lg:min-h-full overflow-hidden">
        <Image
          src={`${BACKEND_URL}/static/hero_secondary.png`}
          alt="NOOORS editorial — two women on marble staircase"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="parallax-img object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(15,14,11,0) 60%, rgba(15,14,11,0.85) 100%)",
          }}
        />
        <div className="absolute bottom-8 left-8 text-[0.7rem] tracking-[0.35em] uppercase text-gold-light flex items-center gap-3">
          <span className="w-8 h-px bg-gold-light/60" />
          Autumn Couture Atelier, Paris 2025
        </div>

        <CornerBracket
          position="tl"
          className=""
          size={60}
        />
        <div className="absolute top-8 left-8">
          <CornerBracket position="tl" size={60} />
        </div>
        <div className="absolute bottom-8 right-8">
          <CornerBracket position="br" size={60} />
        </div>
      </div>

      {/* TEXT SIDE */}
      <div className="cinematic__text-side flex items-center px-8 py-20 lg:px-16">
        <div className="cinematic__text-inner max-w-[480px]">
          <span className="section-label section-label--light">The House</span>
          <h2
            className="font-serif font-light text-ivory mt-6"
            data-split
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
            }}
          >
            Born from
            <br />
            <em className="text-champagne">stillness.</em>
          </h2>
          <p
            className="font-serif italic font-light text-ivory/75 mt-8 leading-[1.7]"
            style={{ fontSize: "1.1rem" }}
          >
            NOOORS was founded on the belief that true luxury lives in restraint
            — in the precise cut of a lapel, the weight of a silk hem against
            the floor, the way light falls on a considered silhouette.
          </p>
          <p
            className="font-serif italic font-light text-ivory/75 mt-6 leading-[1.7]"
            style={{ fontSize: "1.1rem" }}
          >
            Each piece is conceived in our Parisian atelier and finished by
            hand, built for women who collect clothing the way others collect
            art.
          </p>
          <LocalizedClientLink
            href="/store"
            className="btn btn--gold magnetic mt-10"
          >
            Explore Atelier
          </LocalizedClientLink>
          <DrawLine className="mt-8" width={180} height={40} />
        </div>
      </div>
    </section>
  )
}
