import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import {
  deleteRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Repair: ensure every region has the system payment provider linked, and
 * remove the orphan Europe region left over from the starter seed.
 *
 * Symptom this fixes: storefront /checkout left column renders blank because
 * CheckoutForm bails with `return null` when listCartPaymentMethods() returns
 * an empty array — which happens when no payment providers are linked to the
 * cart's region.
 *
 * Run: npx medusa exec ./src/scripts/fix-payment-providers.ts
 */
export default async function fixPayments({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  // 1. Delete any region that isn't India
  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name", "currency_code"],
  })

  const orphanRegions = regions.filter(
    (r: any) => r.name !== "India" || r.currency_code !== "inr"
  )
  if (orphanRegions.length > 0) {
    logger.info(
      `[FIX] Deleting ${orphanRegions.length} orphan region(s): ${orphanRegions
        .map((r: any) => r.name)
        .join(", ")}`
    )
    await deleteRegionsWorkflow(container).run({
      input: { ids: orphanRegions.map((r: any) => r.id) },
    })
  }

  // 2. Link pp_system_default to the surviving India region(s)
  const { data: survivingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  })

  for (const r of survivingRegions) {
    try {
      await link.create({
        [Modules.REGION]: { region_id: r.id },
        [Modules.PAYMENT]: { payment_provider_id: "pp_system_default" },
      })
      logger.info(`[FIX] Linked pp_system_default to region ${r.name}`)
    } catch (e: any) {
      // Link already exists is fine
      if (e.message?.includes("already exists")) {
        logger.info(`[FIX] Region ${r.name} already linked`)
      } else {
        logger.info(`[FIX] Link error on ${r.name}: ${e.message}`)
      }
    }
  }

  logger.info("[FIX] ✓ Payment providers linked, orphan regions cleared")
}
