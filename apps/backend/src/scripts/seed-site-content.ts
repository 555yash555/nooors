import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import upsertSiteContentWorkflow from "../workflows/upsert-site-content"
import createTestimonialWorkflow from "../workflows/create-testimonial"
import { TESTIMONIAL_MODULE } from "../modules/testimonial"

/**
 * One-time seed — migrates the copy/images that were previously hardcoded
 * in storefront components (home hero, cinematic/brand-story section, store
 * listing hero, footer social links, homepage testimonials) into the new
 * siteContent + testimonial modules, so they become admin-editable.
 *
 * Idempotent: site-content upserts by key (safe to re-run), testimonials are
 * skipped if any already exist (re-running won't duplicate press quotes).
 *
 * Run: npx medusa exec ./src/scripts/seed-site-content.ts
 */
export default async function seedSiteContent({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const R2 = "https://pub-9cad65d70b394810add7ae0700500b86.r2.dev/site"

  const entries: { key: string; data: Record<string, unknown> }[] = [
    {
      key: "home_hero",
      data: {
        image: `${R2}/hero_main.png`,
        alt: "Elora — Woman in ivory silk gown",
        eyebrow: "S/S 2025 Collection",
        headline_line1: "Dressed in",
        headline_line2: "Silence.",
        subheading:
          "Couture for women who move through the world with intention.",
      },
    },
    {
      key: "home_story",
      data: {
        image: `${R2}/hero_secondary.png`,
        alt: "Elora editorial — two women on marble staircase",
        vertical_label: "The Atelier · By Harnoor",
        caption: "Autumn Couture Atelier, Studio 2025",
        section_label: "The House",
        heading_line1: "Born from",
        heading_line2_italic: "stillness.",
        body_paragraph_1:
          "Elora was founded on the belief that true luxury lives in restraint — in the precise cut of a lapel, the weight of a silk hem against the floor, the way light falls on a considered silhouette.",
        body_paragraph_2:
          "Each piece is conceived in our atelier and finished by hand, built for women who collect clothing the way others collect art.",
        cta_label: "Explore Atelier",
      },
    },
    {
      key: "store_hero",
      data: {
        image: `${R2}/hero_secondary.png`,
        eyebrow: "S/S 2025",
        heading: "The Collection",
        subheading: "Pieces selected for the discerning eye.",
      },
    },
    {
      key: "social_links",
      data: {
        instagram: "",
        pinterest: "",
        tiktok: "",
      },
    },
  ]

  for (const entry of entries) {
    await upsertSiteContentWorkflow(container).run({ input: entry })
    logger.info(`Upserted site_content key "${entry.key}"`)
  }

  const testimonialModuleService = container.resolve(TESTIMONIAL_MODULE)
  const existing = await testimonialModuleService.listTestimonials()

  if (existing.length > 0) {
    logger.info(
      `Skipping testimonial seed — ${existing.length} already exist.`
    )
  } else {
    const testimonials = [
      {
        quote:
          "Elora redefined what it means to dress with intention. Every seam tells a story.",
        citation: "— Harper. Bazaar India, March 2025",
        sort_order: 0,
      },
      {
        quote:
          "The silk gown I wore to the Cannes premiere drew more attention than anything I've worn in a decade.",
        citation: "— Sofia M., Actress",
        sort_order: 1,
      },
      {
        quote:
          "Architectural, feminine, and impossibly precise. A house to watch.",
        citation: "— Harper's Bazaar, 2025",
        sort_order: 2,
      },
    ]

    for (const testimonial of testimonials) {
      await createTestimonialWorkflow(container).run({ input: testimonial })
      logger.info(`Created testimonial from "${testimonial.citation}"`)
    }
  }

  logger.info("Done seeding site content.")
}
