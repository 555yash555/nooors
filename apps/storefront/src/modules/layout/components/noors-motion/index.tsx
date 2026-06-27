"use client"

import { useEffect } from "react"

/**
 * NOOORS — Global motion controller (client-only).
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

    /* ---------- NAV SCROLL STATE ----------
     * The nav starts transparent so it sits over the home hero. Only the home
     * "/" or "/<country>" route has that hero — every other route renders the
     * nav over cream/ivory backgrounds where the ivory text would be invisible.
     * So we force the .nav--scrolled style on every non-home page and only do
     * scroll-based toggling on the home route.
     */
    const nav = document.getElementById("noors-nav")
    if (nav) {
      const path = window.location.pathname.replace(/\/$/, "")
      // matches "" (root) and "/in" / "/dk" / etc — all home pages
      const isHome = /^(\/[a-z]{2})?$/.test(path)

      if (isHome) {
        // On home: remove the default scrolled class when at top so the nav
        // sits transparent over the hero, re-add it when user scrolls.
        const onScroll = () => {
          if (window.scrollY > 80) nav.classList.add("nav--scrolled")
          else nav.classList.remove("nav--scrolled")
        }
        window.addEventListener("scroll", onScroll, { passive: true })
        onScroll()
        cleanups.push(() => window.removeEventListener("scroll", onScroll))
      }
      // On non-home: leave the SSR-default `nav--scrolled` in place.
    }

    } // end run()
  }, [])

  return null
}
