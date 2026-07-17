"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

/**
 * Elora PDP gallery — one snap-scroll carousel across every breakpoint.
 *
 * Mobile  (< lg): full-bleed, native swipe, no arrow buttons (touch handles it).
 * Desktop (lg+):  contained within its grid column, rounded corners,
 *                 hover-revealed prev/next arrows for mouse users (swipe
 *                 alone isn't a discoverable affordance without a touchpad).
 *
 * Single rail markup for both breakpoints — only the bleed margin differs,
 * handled via the scoped <style> block below (a plain Tailwind arbitrary
 * negative-margin utility can't express "cancel to 0 at lg", since the
 * bleed amount is `--pad-x`, the page's OUTER padding, which has no
 * relationship to how far this element sits from the edge once it's inside
 * the lg+ two-column grid).
 */
const ImageGallery = ({ images }: ImageGalleryProps) => {
  const railRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        const w = rail.clientWidth
        if (!w) return
        const i = Math.round(rail.scrollLeft / w)
        setActive(i)
      })
    }
    rail.addEventListener("scroll", onScroll, { passive: true })
    return () => rail.removeEventListener("scroll", onScroll)
  }, [])

  const goTo = (i: number) => {
    const rail = railRef.current
    if (!rail) return
    rail.scrollTo({ left: rail.clientWidth * i, behavior: "smooth" })
  }

  if (!images.length) return null

  return (
    <div className="pdp-gallery group relative w-full lg:rounded-[3px] lg:overflow-hidden">
      <style>{`
        .pdp-gallery {
          margin-left: calc(var(--pad-x) * -1);
          margin-right: calc(var(--pad-x) * -1);
        }
        @media (min-width: 1024px) {
          .pdp-gallery {
            margin-left: 0;
            margin-right: 0;
          }
        }
      `}</style>

      <div
        ref={railRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            id={image.id}
            className="relative flex-none w-full aspect-[3/4] bg-cream snap-center"
          >
            {!!image.url && (
              <Image
                src={image.url}
                priority={index === 0}
                alt={`Elora — product image ${index + 1}`}
                fill
                sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 60vw"
                className="object-cover object-center"
              />
            )}
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          {/* Image counter — top-right */}
          <div className="absolute top-4 right-6 lg:right-4 text-[0.6rem] tracking-[0.25em] uppercase text-ivory bg-ink/55 backdrop-blur-sm px-2.5 py-1 tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </div>

          {/* Prev/next arrows — desktop only, revealed on hover */}
          <button
            type="button"
            onClick={() => goTo(Math.max(active - 1, 0))}
            disabled={active === 0}
            aria-label="Previous image"
            className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-ivory/85 backdrop-blur-sm text-ink opacity-0 group-hover:opacity-100 hover:bg-ivory transition-all duration-300 ease-silk disabled:opacity-0"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M7 1L1 7L7 13" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(Math.min(active + 1, images.length - 1))}
            disabled={active === images.length - 1}
            aria-label="Next image"
            className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 items-center justify-center rounded-full bg-ivory/85 backdrop-blur-sm text-ink opacity-0 group-hover:opacity-100 hover:bg-ivory transition-all duration-300 ease-silk disabled:opacity-0"
          >
            <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
              <path d="M1 1L7 7L1 13" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>

          {/* Dot pagination — bottom, click/tap to jump */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1 transition-all duration-400 ease-silk ${
                  i === active ? "w-6 bg-gold" : "w-3 bg-ivory/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default ImageGallery
