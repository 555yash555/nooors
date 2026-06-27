import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
export default async function ({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: p } = await query.graph({ entity: "product", fields: ["id", "handle"] })
  const { data: c } = await query.graph({ entity: "product_collection", fields: ["id", "handle"] })
  const { data: r } = await query.graph({ entity: "region", fields: ["id", "currency_code"] })
  console.log("Products:", p.length, p.map((x:any)=>x.handle))
  console.log("Collections:", c.length, c.map((x:any)=>x.handle))
  console.log("Regions:", r.length, r.map((x:any)=>x.currency_code))
}
