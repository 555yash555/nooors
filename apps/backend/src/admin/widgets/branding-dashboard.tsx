import { defineWidgetConfig } from "@medusajs/admin-sdk"
export { default } from "./branding"

// Same widget mounted at a post-login zone so debranding fires even when
// the user lands directly on /app/orders, /app/products, etc.
export const config = defineWidgetConfig({
  zone: "order.list.before",
})
