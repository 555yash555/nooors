import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { SITE_CONTENT_MODULE } from "../../../../modules/site-content"
import upsertSiteContentWorkflow from "../../../../workflows/upsert-site-content"
import { UpsertSiteContentSchema } from "../middlewares"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { key } = req.params
  const siteContentModuleService = req.scope.resolve(SITE_CONTENT_MODULE)

  const [entry] = await siteContentModuleService.listSiteContentEntries({
    key,
  })

  return res.status(200).json({ site_content_entry: entry ?? null })
}

export async function POST(
  req: MedusaRequest<UpsertSiteContentSchema>,
  res: MedusaResponse
) {
  const { key } = req.params
  const { data } = req.validatedBody

  const { result } = await upsertSiteContentWorkflow(req.scope).run({
    input: { key, data },
  })

  return res.status(200).json({ site_content_entry: result.entry })
}
