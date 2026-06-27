import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { linkSalesChannelsToStockLocationWorkflow } from "@medusajs/medusa/core-flows"

export default async function linkScStock({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const { data: sc } = await query.graph({ entity: "sales_channel", fields: ["id"] })
  const { data: sl } = await query.graph({ entity: "stock_location", fields: ["id"] })
  if (!sc.length || !sl.length) throw new Error("Missing sc or sl")

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: sl[0].id, add: sc.map((s: any) => s.id) },
  })
  logger.info(`Linked stock location ${sl[0].id} to ${sc.length} sales channel(s)`)

  // Also link stock location → fulfillment provider so shipping options work
  try {
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: sl[0].id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    })
    logger.info("Linked fulfillment provider")
  } catch (e: any) {
    logger.info(`Fulfillment link skip: ${e.message}`)
  }
}
