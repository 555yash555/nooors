import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useQuery } from "@tanstack/react-query"
import { Container, Heading, Text } from "@medusajs/ui"
import { PencilSquare } from "@medusajs/icons"
import { sdk } from "../../lib/client"
import SiteContentCard, {
  SiteContentField,
} from "./components/site-content-card"
import TestimonialsSection from "./components/testimonials-section"

type SiteContentEntry = {
  id: string
  key: string
  data: Record<string, unknown>
}

const HOME_HERO_FIELDS: SiteContentField[] = [
  { name: "image", label: "Image URL", type: "url" },
  { name: "alt", label: "Image alt text", type: "text" },
  { name: "eyebrow", label: "Eyebrow label", type: "text" },
  { name: "headline_line1", label: "Headline — line 1", type: "text" },
  { name: "headline_line2", label: "Headline — line 2 (italic)", type: "text" },
  { name: "subheading", label: "Subheading", type: "textarea" },
]

const HOME_STORY_FIELDS: SiteContentField[] = [
  { name: "image", label: "Image URL", type: "url" },
  { name: "alt", label: "Image alt text", type: "text" },
  { name: "vertical_label", label: "Vertical side label", type: "text" },
  { name: "caption", label: "Image caption", type: "text" },
  { name: "section_label", label: "Section label", type: "text" },
  { name: "heading_line1", label: "Heading — line 1", type: "text" },
  {
    name: "heading_line2_italic",
    label: "Heading — line 2 (italic)",
    type: "text",
  },
  { name: "body_paragraph_1", label: "Body paragraph 1", type: "textarea" },
  { name: "body_paragraph_2", label: "Body paragraph 2", type: "textarea" },
  { name: "cta_label", label: "Button label", type: "text" },
]

const STORE_HERO_FIELDS: SiteContentField[] = [
  { name: "image", label: "Image URL", type: "url" },
  { name: "eyebrow", label: "Eyebrow label", type: "text" },
  { name: "heading", label: "Heading", type: "text" },
  { name: "subheading", label: "Subheading", type: "textarea" },
]

const SOCIAL_LINKS_FIELDS: SiteContentField[] = [
  { name: "instagram", label: "Instagram URL", type: "url" },
  { name: "pinterest", label: "Pinterest URL", type: "url" },
  { name: "tiktok", label: "TikTok URL", type: "url" },
]

/**
 * Elora "Site Content" admin page — central place to edit every piece of
 * merchant-controllable homepage/storefront copy that isn't tied to a
 * product/category/collection: hero banners, the brand-story section, the
 * store listing hero, social links, and homepage testimonials.
 *
 * Single display query for all site-content entries (loads on mount, no
 * per-section fetch) — each SiteContentCard reads its own key's slice and
 * saves independently via `POST /admin/site-content/:key`.
 */
const SiteContentPage = () => {
  const { data, isLoading } = useQuery({
    queryFn: () =>
      sdk.client.fetch<{ site_content_entries: SiteContentEntry[] }>(
        "/admin/site-content"
      ),
    queryKey: ["site-content"],
  })

  const byKey = new Map(
    (data?.site_content_entries ?? []).map((e) => [e.key, e.data])
  )

  return (
    <div className="flex flex-col gap-y-4">
      <Container className="p-0">
        <div className="flex items-center gap-x-3 px-6 py-4">
          <PencilSquare className="text-ui-fg-subtle" />
          <div>
            <Heading level="h1">Site Content</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              Edit homepage banners, the brand story, and testimonials without
              a code change.
            </Text>
          </div>
        </div>
      </Container>

      {isLoading ? (
        <Container>
          <Text size="small" className="text-ui-fg-subtle">
            Loading…
          </Text>
        </Container>
      ) : (
        <>
          <SiteContentCard
            title="Home Hero"
            description="The full-bleed banner at the top of the homepage."
            entryKey="home_hero"
            fields={HOME_HERO_FIELDS}
            data={byKey.get("home_hero")}
          />
          <SiteContentCard
            title="Brand Story"
            description='The "Born from stillness" editorial section on the homepage.'
            entryKey="home_story"
            fields={HOME_STORY_FIELDS}
            data={byKey.get("home_story")}
          />
          <SiteContentCard
            title="Store Page Hero"
            description="The banner at the top of the /store listing page."
            entryKey="store_hero"
            fields={STORE_HERO_FIELDS}
            data={byKey.get("store_hero")}
          />
          <SiteContentCard
            title="Social Links"
            description="Shown in the footer — an icon only appears once its URL is set."
            entryKey="social_links"
            fields={SOCIAL_LINKS_FIELDS}
            data={byKey.get("social_links")}
          />
          <TestimonialsSection />
        </>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Site Content",
  icon: PencilSquare,
})

export default SiteContentPage
