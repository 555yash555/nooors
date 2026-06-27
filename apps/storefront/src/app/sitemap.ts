import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"
import { listProducts } from "@lib/data/products"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"

/**
 * Dynamic sitemap. Next.js serves this at /sitemap.xml automatically.
 *
 * Per-region URLs: every product is reachable at /<countryCode>/products/<handle>.
 * We enumerate the cross-product of regions × catalog so search engines
 * discover both the localized URLs and the canonical product handles.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()

  // Defensive: any of these can fail on first build before catalog seeding.
  const [regions, productsResp, categories] = await Promise.all([
    listRegions().catch(() => []),
    listProducts({ countryCode: "in", queryParams: { limit: 1000 } as any })
      .catch(() => ({ response: { products: [] } })),
    listCategories().catch(() => []),
  ])

  const countryCodes = regions
    .flatMap((r) => r.countries ?? [])
    .map((c) => c?.iso_2)
    .filter(Boolean) as string[]

  const products = productsResp.response.products

  const staticPaths = ["", "/store", "/account/login"]

  const entries: MetadataRoute.Sitemap = []

  // Home + main static routes per country
  for (const cc of countryCodes) {
    for (const p of staticPaths) {
      entries.push({
        url: `${baseUrl}/${cc}${p}`,
        lastModified: new Date(),
        changeFrequency: p === "" ? "daily" : "weekly",
        priority: p === "" ? 1.0 : 0.6,
      })
    }
    // Products
    for (const product of products) {
      entries.push({
        url: `${baseUrl}/${cc}/products/${product.handle}`,
        lastModified: product.updated_at
          ? new Date(product.updated_at)
          : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    }
    // Categories
    for (const cat of categories) {
      entries.push({
        url: `${baseUrl}/${cc}/categories/${cat.handle}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      })
    }
  }

  return entries
}
