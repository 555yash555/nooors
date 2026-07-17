import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { SITE_CONTENT_MODULE } from "../../modules/site-content"

type Input = {
  key: string
  data: Record<string, unknown>
}

type CompensationData = {
  entryId: string
  previousData: Record<string, unknown> | null
  wasCreated: boolean
}

/**
 * Create-or-update by `key`. Site content entries are addressed by a
 * human-readable key (e.g. "home_hero") rather than an id the caller has to
 * look up first — the admin UI and seed script always just "set this key
 * to this value."
 */
export const upsertSiteContentStep = createStep(
  "upsert-site-content",
  async (input: Input, { container }) => {
    const siteContentModuleService = container.resolve(SITE_CONTENT_MODULE)

    const existing = await siteContentModuleService.listSiteContentEntries({
      key: input.key,
    })
    const previous = existing[0] ?? null

    let entry
    if (previous) {
      entry = await siteContentModuleService.updateSiteContentEntries({
        id: previous.id,
        data: input.data,
      })
    } else {
      entry = await siteContentModuleService.createSiteContentEntries({
        key: input.key,
        data: input.data,
      })
    }

    const compensation: CompensationData = {
      entryId: entry.id,
      previousData: previous ? (previous.data as Record<string, unknown>) : null,
      wasCreated: !previous,
    }

    return new StepResponse(entry, compensation)
  },
  async (compensation, { container }) => {
    if (!compensation) return
    const siteContentModuleService = container.resolve(SITE_CONTENT_MODULE)

    if (compensation.wasCreated) {
      await siteContentModuleService.deleteSiteContentEntries(
        compensation.entryId
      )
    } else {
      await siteContentModuleService.updateSiteContentEntries({
        id: compensation.entryId,
        data: compensation.previousData!,
      })
    }
  }
)
