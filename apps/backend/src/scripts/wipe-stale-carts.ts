import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Hard-deletes any cart whose line items reference variants that no longer
 * exist. Run once after a destructive catalog/region switch to ensure no
 * stale browser cookies can resurrect zombie carts.
 */
export default async function wipeStaleCarts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const cartModule = container.resolve("cart" as any)

  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id"],
  })
  const liveVariantIds = new Set(variants.map((v: any) => v.id))

  const { data: carts } = await query.graph({
    entity: "cart",
    fields: ["id", "items.variant_id"],
  })

  const stale = carts.filter((c: any) =>
    (c.items || []).some((i: any) => !liveVariantIds.has(i.variant_id))
  )

  if (!stale.length) {
    logger.info("[WIPE] No stale carts found")
    return
  }

  logger.info(`[WIPE] Deleting ${stale.length} stale cart(s)`)
  await cartModule.deleteCarts(stale.map((c: any) => c.id))
  logger.info("[WIPE] Done")
}
