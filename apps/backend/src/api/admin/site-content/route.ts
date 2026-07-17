import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_CONTENT_MODULE } from "../../../modules/site-content"

/**
 * List every site-content entry — used by the admin "Site Content" page to
 * render all editable sections at once.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const siteContentModuleService = req.scope.resolve(SITE_CONTENT_MODULE)

  const entries = await siteContentModuleService.listSiteContentEntries()

  return res.status(200).json({ site_content_entries: entries })
}
