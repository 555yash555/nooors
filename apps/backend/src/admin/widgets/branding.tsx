import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"

/**
 * Elora Admin Debrand.
 *
 * A "zone-mounted" widget that injects global CSS + sets document.title +
 * swaps the favicon. Mounting on `login.before` guarantees it runs before any
 * branded UI paints. The injected <style> persists across SPA navigation.
 */
const ELORA_BRAND = {
  name: "Elora",
  tagline: "by Harnoor",
  faviconDataUri:
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
         <rect width="32" height="32" rx="6" fill="#1a1814"/>
         <text x="16" y="23" font-family="Allura, 'Brush Script MT', cursive"
               font-style="italic" font-size="26" font-weight="400"
               text-anchor="middle" fill="#d4b787">e</text>
       </svg>`
    ),
}

const css = `
  /* === Elora admin debrand === */

  /* Hide Medusa wordmark images / svgs by alt or aria-label */
  img[alt*="Medusa" i],
  svg[aria-label*="Medusa" i] {
    visibility: hidden !important;
    width: 0 !important;
    height: 0 !important;
  }

  /* Hide 'Powered by Medusa' / external Medusa links */
  [class*="medusa-cta" i],
  a[href*="medusajs.com"]:not([href*="docs"]) {
    display: none !important;
  }
`

// Plain-text replacements that we apply via DOM walking (CSS can't match text).
const TEXT_REPLACEMENTS: Array<[RegExp, string]> = [
  [/Welcome to Medusa/g, `Welcome to ${ELORA_BRAND.name}`],
  [/Sign in to access the account area/g, "Sign in to access the atelier"],
  [/Medusa Admin/g, `${ELORA_BRAND.name} Atelier`],
  [/Made with Medusa/g, ""],
  [/Powered by Medusa/g, ""],
]

const replaceText = (root: Node) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  let node: Node | null
  while ((node = walker.nextNode())) {
    const text = node.nodeValue
    if (!text) continue
    let next = text
    for (const [pattern, replacement] of TEXT_REPLACEMENTS) {
      next = next.replace(pattern, replacement)
    }
    if (next !== text) node.nodeValue = next
  }
}

const Debrand = () => {
  useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Browser tab title
    const setTitle = () => {
      document.title = ELORA_BRAND.name + " · Atelier"
    }
    setTitle()
    const titleObserver = new MutationObserver(setTitle)
    titleObserver.observe(document.querySelector("title") || document.head, {
      childList: true,
    })

    // 2. Favicon
    let icon = document.querySelector<HTMLLinkElement>("link[rel='icon']")
    if (!icon) {
      icon = document.createElement("link")
      icon.rel = "icon"
      document.head.appendChild(icon)
    }
    icon.href = ELORA_BRAND.faviconDataUri
    icon.removeAttribute("data-placeholder-favicon")

    // 3. Inject CSS once
    const STYLE_ID = "noors-admin-debrand"
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style")
      style.id = STYLE_ID
      style.textContent = css
      document.head.appendChild(style)
    }

    // 4. Walk + rewrite "Welcome to Medusa" etc. Re-run on any DOM mutation
    //    so React-driven re-renders get caught (login form remounts etc.).
    replaceText(document.body)
    const bodyObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        m.addedNodes.forEach((n) => replaceText(n))
        if (m.type === "characterData" && m.target) replaceText(m.target)
      }
    })
    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    return () => {
      titleObserver.disconnect()
      bodyObserver.disconnect()
    }
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: "login.before",
})

export default Debrand
