"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

/**
 * Elora PDP gallery.
 *
 * Mobile  (< lg): full-bleed snap-scroll horizontal carousel, dot pagination
 *                 fixed at the bottom of the rail. Native swipe — no JS lib.
 * Desktop (lg+):  classic vertical stack of aspect-[3/4] frames, untouched.
 */
const ImageGallery = ({ images }: ImageGalleryProps) => {
  const railRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // Track which slide the user has scrolled to so the dot indicator updates.
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

  if (!images.length) return null

  return (
    <div className="w-full">
      {/* MOBILE — swipeable carousel, bled to viewport edges */}
      <div
        className="lg:hidden relative"
        style={{
          marginLeft: "calc(var(--pad-x) * -1)",
          marginRight: "calc(var(--pad-x) * -1)",
        }}
      >
        <div
          ref={railRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              id={image.id}
              className="relative flex-none w-screen aspect-[3/4] bg-cream snap-center"
            >
              {!!image.url && (
                <Image
                  src={image.url}
                  priority={index === 0}
                  alt={`Elora — product image ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                />
              )}
            </div>
          ))}
        </div>

        {/* Image counter — top-right */}
        {images.length > 1 && (
          <div className="absolute top-4 right-6 text-[0.6rem] tracking-[0.25em] uppercase text-ivory bg-ink/55 backdrop-blur-sm px-2.5 py-1 tabular-nums">
            {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </div>
        )}

        {/* Dot pagination — bottom, scrollable jump on tap */}
        {images.length > 1 && (
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  const rail = railRef.current
                  if (!rail) return
                  rail.scrollTo({ left: rail.clientWidth * i, behavior: "smooth" })
                }}
                aria-label={`Go to image ${i + 1}`}
                className={`h-1 transition-all duration-400 ease-silk ${
                  i === active
                    ? "w-6 bg-gold"
                    : "w-3 bg-ivory/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP — vertical stack (unchanged) */}
      <div className="hidden lg:flex flex-col gap-6 w-full">
        {images.map((image, index) => (
          <div
            key={image.id}
            id={image.id}
            className="product-card__img-wrap clip-reveal relative aspect-[3/4] w-full bg-cream overflow-hidden rounded-[3px]"
          >
            {!!image.url && (
              <Image
                src={image.url}
                priority={index === 0}
                alt={`Elora — product image ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 60vw"
                className="object-cover object-center transition-transform duration-[1500ms] ease-silk"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageGallery
