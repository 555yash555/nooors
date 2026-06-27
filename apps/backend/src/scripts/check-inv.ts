import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export default async function check({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: variants } = await query.graph({
    entity: "variant",
    fields: ["id", "title", "inventory_items.*"],
  })
  console.log(`Total variants: ${variants.length}`)
  console.log(`First variant inventory items:`, JSON.stringify(variants[0]?.inventory_items, null, 2))

  const { data: ii } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku", "location_levels.*"],
  })
  console.log(`Inventory items: ${ii.length}`)
  console.log(`First item:`, JSON.stringify(ii[0], null, 2))
}
