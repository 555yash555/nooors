"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

/**
 * Elora — Global motion controller (client-only).
 * Ports the imperative behaviours from ecom/canvas/script.js:
 *  - Custom cursor (dot + ring with rAF lag)
 *  - Magnetic buttons (.magnetic)
 *  - 3D tilt on .tilt / .product-card__img-wrap
 *  - Scroll reveal via IntersectionObserver
 *  - Split-text (data-split → words → staggered reveal)
 *  - Nav scroll state
 *
 * All DOM access is guarded inside useEffect with cleanup.
 * Honors prefers-reduced-motion and hover:hover for desktop-only fx.
 */
export default function NoorsMotion() {
  const pathname = usePathname()

  /* ---------- NAV SCROLL STATE (overlay-aware) ----------
   * The nav blends over any section marked with `data-hero-overlay` (dark
   * image hero) and switches to its solid ivory `.nav--scrolled` style once
   * the user has scrolled past the bottom of that section. No overlay on
   * the page → nav stays solid. Re-evaluated on every navigation so the
   * one-time NoorsMotion mount adapts to each route.
   */
  useEffect(() => {
    const nav = document.getElementById("noors-nav")
    if (!nav) return
    const NAV_HEIGHT = 80 // matches header h-20
    const overlay = document.querySelector<HTMLElement>(
      "[data-hero-overlay]"
    )

    const apply = () => {
      if (!overlay) {
        nav.classList.add("nav--scrolled")
        return
      }
      const r = overlay.getBoundingClientRect()
      if (r.bottom > NAV_HEIGHT) {
        nav.classList.remove("nav--scrolled")
      } else {
        nav.classList.add("nav--scrolled")
      }
    }

    apply()

    if (!overlay) return
    const onScroll = () => apply()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [pathname])

  useEffect(() => {
    if (typeof window === "undefined") return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const supportsHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches

    const cleanups: Array<() => void> = []

    // Defer all DOM mutations one tick so React 19 hydration is fully
    // committed before we add classes / inline styles. Prevents hydration
    // mismatch warnings caused by us touching the tree mid-hydration.
    let cancelled = false
    const rafId = requestAnimationFrame(() => {
      if (cancelled) return
      run()
    })
    cleanups.push(() => {
      cancelled = true
      cancelAnimationFrame(rafId)
    })
    return () => cleanups.forEach((fn) => fn())

    function run() {

    // Signal to CSS that JS-driven motion is wired so .clip-reveal etc can
    // start from their hidden state (without JS we keep them visible).
    document.documentElement.classList.add("js-motion-ready")
    cleanups.push(() =>
      document.documentElement.classList.remove("js-motion-ready")
    )

    /* ---------- SPLIT TEXT ---------- */
    const splitTargets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-split]")
    )
    splitTargets.forEach((el) => {
      if (el.dataset.splitInit === "1") return
      el.dataset.splitInit = "1"
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null)
      const textNodes: Text[] = []
      let n: Node | null
      while ((n = walker.nextNode())) textNodes.push(n as Text)
      textNodes.forEach((tn) => {
        if (!tn.nodeValue?.trim()) return
        const frag = document.createDocumentFragment()
        const parts = tn.nodeValue.split(/(\s+)/)
        parts.forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(part))
          } else {
            const span = document.createElement("span")
            span.className = "split-word"
            span.textContent = part
            frag.appendChild(span)
          }
        })
        tn.parentNode?.replaceChild(frag, tn)
      })
      el.classList.add("split-words")
      Array.from(el.querySelectorAll<HTMLElement>(".split-word")).forEach(
        (w, i) => w.style.setProperty("--i", String(i))
      )
    })

    /* ---------- SCROLL REVEAL ---------- */
    const revealSelector =
      ".reveal, .reveal-wrap, .section-header, .product-card, .category-tile, .testimonial, .cinematic__text-inner, .shop-card, .clip-reveal, [data-split], .draw-line, .mask-reveal, .ornament, [data-reveal]"
    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>(revealSelector)
    )
    let io: IntersectionObserver | null = null
    if (!reduce && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement
              el.classList.add("visible", "revealed", "drawn")
              el.classList.remove("is-prereveal")
              io?.unobserve(el)
            }
          })
        },
        { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
      )
      // For each candidate: if already in view → reveal now (no flash).
      // Off-screen → tag as prereveal (start hidden), then observe.
      revealEls.forEach((el) => {
        const r = el.getBoundingClientRect()
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add("visible", "revealed", "drawn")
        } else {
          el.classList.add("is-prereveal")
          io!.observe(el)
        }
      })
    } else if (reduce) {
      revealEls.forEach((el) =>
        el.classList.add("visible", "revealed", "drawn")
      )
    }
    cleanups.push(() => io?.disconnect())

    /* ---------- CUSTOM CURSOR ---------- */
    if (supportsHover && !reduce) {
      const dot = document.createElement("div")
      dot.className = "cursor-dot"
      dot.setAttribute("aria-hidden", "true")
      const ring = document.createElement("div")
      ring.className = "cursor-ring"
      ring.setAttribute("aria-hidden", "true")
      document.body.appendChild(dot)
      document.body.appendChild(ring)
      document.body.classList.add("has-cursor")

      let mx = window.innerWidth / 2
      let my = window.innerHeight / 2
      let rx = mx
      let ry = my
      let rafId = 0
      let alive = true

      const onMove = (e: MouseEvent) => {
        mx = e.clientX
        my = e.clientY
      }
      const onLeave = () => {
        dot.style.opacity = "0"
        ring.style.opacity = "0"
      }
      const onEnter = () => {
        dot.style.opacity = "1"
        ring.style.opacity = "1"
      }
      const loop = () => {
        if (!alive) return
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
        rx += (mx - rx) * 0.18
        ry += (my - ry) * 0.18
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
        rafId = requestAnimationFrame(loop)
      }
      window.addEventListener("mousemove", onMove)
      document.addEventListener("mouseleave", onLeave)
      document.addEventListener("mouseenter", onEnter)
      loop()

      const hoverSel =
        "a, button, .shop-card, .product-card, .category-tile, .filter-btn, .color-dot, input, select, textarea, [role='link']"
      const hoverEls = Array.from(document.querySelectorAll(hoverSel))
      const onElEnter = () => document.body.classList.add("cursor-hover")
      const onElLeave = () => document.body.classList.remove("cursor-hover")
      hoverEls.forEach((el) => {
        el.addEventListener("mouseenter", onElEnter)
        el.addEventListener("mouseleave", onElLeave)
      })

      cleanups.push(() => {
        alive = false
        cancelAnimationFrame(rafId)
        window.removeEventListener("mousemove", onMove)
        document.removeEventListener("mouseleave", onLeave)
        document.removeEventListener("mouseenter", onEnter)
        hoverEls.forEach((el) => {
          el.removeEventListener("mouseenter", onElEnter)
          el.removeEventListener("mouseleave", onElLeave)
        })
        document.body.classList.remove("has-cursor", "cursor-hover")
        dot.remove()
        ring.remove()
      })
    }

    /* ---------- MAGNETIC BUTTONS ---------- */
    if (supportsHover && !reduce) {
      const magnets = Array.from(
        document.querySelectorAll<HTMLElement>(".magnetic")
      )
      const handlers: Array<{
        el: HTMLElement
        move: (e: MouseEvent) => void
        leave: () => void
      }> = []
      magnets.forEach((btn) => {
        const move = (e: MouseEvent) => {
          const r = btn.getBoundingClientRect()
          const x = e.clientX - r.left - r.width / 2
          const y = e.clientY - r.top - r.height / 2
          btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`
        }
        const leave = () => {
          btn.style.transform = ""
        }
        btn.addEventListener("mousemove", move)
        btn.addEventListener("mouseleave", leave)
        handlers.push({ el: btn, move, leave })
      })
      cleanups.push(() =>
        handlers.forEach(({ el, move, leave }) => {
          el.removeEventListener("mousemove", move)
          el.removeEventListener("mouseleave", leave)
        })
      )
    }

    /* ---------- 3D TILT ---------- */
    if (supportsHover && !reduce) {
      const tiltWraps = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".tilt, .shop-card__img-wrap, .product-card__img-wrap"
        )
      )
      const handlers: Array<{
        el: HTMLElement
        move: (e: MouseEvent) => void
        leave: () => void
      }> = []
      tiltWraps.forEach((wrap) => {
        const img = wrap.querySelector("img") as HTMLImageElement | null
        if (!img) return
        wrap.style.perspective = "1000px"
        img.style.transformStyle = "preserve-3d"
        const move = (e: MouseEvent) => {
          const r = wrap.getBoundingClientRect()
          const x = (e.clientX - r.left) / r.width - 0.5
          const y = (e.clientY - r.top) / r.height - 0.5
          img.style.transform = `scale(1.06) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`
        }
        const leave = () => {
          img.style.transform = ""
        }
        wrap.addEventListener("mousemove", move)
        wrap.addEventListener("mouseleave", leave)
        handlers.push({ el: wrap, move, leave })
      })
      cleanups.push(() =>
        handlers.forEach(({ el, move, leave }) => {
          el.removeEventListener("mousemove", move)
          el.removeEventListener("mouseleave", leave)
        })
      )
    }

    /* ---------- SCROLL FLUIDITY ----------
     * Single rAF-throttled scroll loop drives:
     *   • Hero — background drifts down + scales slightly, content fades/lifts.
     *     Gives a cinematic "scene receding" feel as the page enters.
     *   • Any `.parallax-img` — gently translates Y as it passes through the
     *     viewport, magnitude controlled by `data-parallax-speed` (default 18).
     * Honors prefers-reduced-motion (skips entirely). All transforms reset on
     * cleanup so the layout returns to its CSS-defined state.
     */
    if (!reduce) {
      const hero = document.querySelector<HTMLElement>(".hero")
      const heroBg = hero?.querySelector<HTMLElement>(".hero__bg") ?? null
      const heroContent =
        hero?.querySelector<HTMLElement>(".hero__content") ?? null
      const parallaxImgs = Array.from(
        document.querySelectorAll<HTMLElement>(".parallax-img, [data-parallax]")
      )

      // Make hero__bg + content opt out of CSS transitions for these props so
      // every rAF frame paints exactly the scroll-mapped transform.
      if (heroBg) heroBg.style.willChange = "transform"
      if (heroContent) heroContent.style.willChange = "transform, opacity"
      parallaxImgs.forEach((img) => (img.style.willChange = "transform"))

      let ticking = false
      let lastY = window.scrollY

      const update = () => {
        ticking = false
        const y = lastY

        if (hero && heroBg) {
          const h = hero.offsetHeight || window.innerHeight
          const p = Math.min(1, Math.max(0, y / h))
          // bg drifts ~35% the scroll distance + tiny scale (extends Ken Burns)
          heroBg.style.transform = `translate3d(0, ${y * 0.35}px, 0) scale(${1 + p * 0.04})`
          if (heroContent) {
            heroContent.style.opacity = String(Math.max(0, 1 - p * 1.4))
            heroContent.style.transform = `translate3d(0, ${y * 0.18}px, 0)`
          }
        }

        if (parallaxImgs.length) {
          const vh = window.innerHeight
          parallaxImgs.forEach((img) => {
            const wrap = img.parentElement || img
            const r = wrap.getBoundingClientRect()
            // Skip far off-screen elements (perf)
            if (r.bottom < -200 || r.top > vh + 200) return
            // Normalized position: -1 (well above viewport) → 1 (well below).
            const center =
              (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2)
            const c = Math.max(-1, Math.min(1, center))
            const speed = parseFloat(img.dataset.parallaxSpeed || "18")
            img.style.transform = `translate3d(0, ${-c * speed}px, 0)`
          })
        }
      }

      const onScroll = () => {
        lastY = window.scrollY
        if (!ticking) {
          requestAnimationFrame(update)
          ticking = true
        }
      }

      window.addEventListener("scroll", onScroll, { passive: true })
      // Initial paint so first frame is correct (avoids jump on first scroll).
      update()

      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll)
        if (heroBg) {
          heroBg.style.transform = ""
          heroBg.style.willChange = ""
        }
        if (heroContent) {
          heroContent.style.transform = ""
          heroContent.style.opacity = ""
          heroContent.style.willChange = ""
        }
        parallaxImgs.forEach((img) => {
          img.style.transform = ""
          img.style.willChange = ""
        })
      })
    }

    // Nav scroll state lives in its own pathname-aware useEffect above.

    } // end run()
  }, [])

  return null
}
