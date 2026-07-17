import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_CONTENT_MODULE } from "../../../modules/site-content"

/**
 * Public — returns every site-content entry collapsed into a flat
 * `{ [key]: data }` map, so the storefront can do `content.home_hero.headline`
 * without a per-key round trip.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const siteContentModuleService = req.scope.resolve(SITE_CONTENT_MODULE)

  const entries = await siteContentModuleService.listSiteContentEntries()

  const content: Record<string, unknown> = {}
  for (const entry of entries) {
    content[entry.key] = entry.data
  }

  return res.status(200).json({ content })
}
