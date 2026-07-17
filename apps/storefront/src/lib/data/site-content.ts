import { sdk } from "@lib/config"

export type HomeHeroContent = {
  image: string
  alt: string
  eyebrow: string
  headline_line1: string
  headline_line2: string
  subheading: string
}

export type HomeStoryContent = {
  image: string
  alt: string
  vertical_label: string
  caption: string
  section_label: string
  heading_line1: string
  heading_line2_italic: string
  body_paragraph_1: string
  body_paragraph_2: string
  cta_label: string
}

export type StoreHeroContent = {
  image: string
  eyebrow: string
  heading: string
  subheading: string
}

export type SocialLinksContent = {
  instagram: string
  pinterest: string
  tiktok: string
}

export type SiteContentMap = {
  home_hero?: HomeHeroContent
  home_story?: HomeStoryContent
  store_hero?: StoreHeroContent
  social_links?: SocialLinksContent
} & Record<string, unknown>

/**
 * Merchant-editable homepage/storefront copy (hero banners, brand-story
 * section, social links, etc) — content that doesn't belong to any existing
 * Medusa entity. Backed by the `siteContent` module; editable from the admin
 * panel's "Site Content" page.
 *
 * Uses a short shared time-based revalidation window (not the per-session
 * cache-tag helper other data-fetchers use) — admin edits happen in a
 * completely separate session with no way to call `revalidateTag` for a
 * specific visitor's cache tag, so a session-scoped tag would never
 * invalidate. A 30s window means edits appear on the next page load within
 * half a minute, without needing a revalidation webhook.
 */
export const getSiteContent = async (): Promise<SiteContentMap> => {
  return sdk.client
    .fetch<{ content: SiteContentMap }>("/store/site-content", {
      next: { revalidate: 30 },
    })
    .then(({ content }) => content)
}
