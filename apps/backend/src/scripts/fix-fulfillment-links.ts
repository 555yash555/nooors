import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

/**
 * Repair: hard-delete stock_location ↔ fulfillment_set link rows that
 * point at fulfillment_sets which no longer exist.
 *
 * Background — every time switch-to-india.ts ran:
 *   1. it deleted the existing fulfillment_set (soft delete)
 *   2. it created a fresh fulfillment_set
 *   3. it created a new stock_location → fulfillment_set link row
 * But step 2 of the previous run left an orphan link row whose
 * `fulfillment_set_id` now points at a soft-deleted row. The Store API
 * workflow joins them, gets NULL for the deleted ones, and crashes when
 * it tries to read `.id` on the NULL inside a forEach.
 *
 * The link API doesn't expose enumerating dead rows, so we hit Postgres
 * directly via the pg connection registered under "__pg_connection__".
 *
 * Run: npx medusa exec ./src/scripts/fix-fulfillment-links.ts
 */
export default async function fixFulfillmentLinks({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const pg: any = container.resolve("__pg_connection__")

  // Mark every link row whose fulfillment_set_id is for a deleted set.
  const cleanLinks = await pg.raw(`
    UPDATE location_fulfillment_set
    SET deleted_at = NOW()
    WHERE deleted_at IS NULL
      AND fulfillment_set_id NOT IN (
        SELECT id FROM fulfillment_set WHERE deleted_at IS NULL
      )
    RETURNING id, stock_location_id, fulfillment_set_id
  `)
  logger.info(
    `[FIX] location_fulfillment_set: cleaned ${cleanLinks.rowCount ?? cleanLinks.rows?.length ?? 0} orphan row(s)`
  )

  // Same pattern for the payment provider ↔ region link, just in case.
  try {
    const r = await pg.raw(`
      UPDATE region_payment_provider
      SET deleted_at = NOW()
      WHERE deleted_at IS NULL
        AND region_id NOT IN (SELECT id FROM region WHERE deleted_at IS NULL)
    `)
    logger.info(`[FIX] region_payment_provider: ${r.rowCount ?? 0} orphan(s)`)
  } catch (e: any) {
    // Table name might differ; silent
  }

  logger.info("[FIX] ✓ Orphan link rows soft-deleted")
}
