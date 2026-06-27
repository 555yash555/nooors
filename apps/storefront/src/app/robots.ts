import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

/**
 * Robots.txt route. Next.js serves this at /robots.txt automatically.
 *
 * - Allow everything except checkout / cart / account (no SEO value;
 *   crawlers shouldn't follow into authenticated flows).
 * - Point crawlers at our sitemap so they find products faster.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseURL()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/*/cart",
          "/*/checkout",
          "/*/account",
          "/*/order/",
          "/*/verify-account",
        ],
      },
      {
        // Block AI scrapers from training on the catalog by default.
        // Remove this rule if you want LLM discoverability.
        userAgent: ["GPTBot", "ChatGPT-User", "CCBot", "anthropic-ai", "Claude-Web"],
        disallow: "/",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
