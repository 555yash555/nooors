import { model } from "@medusajs/framework/utils"

/**
 * Generic key/value store for merchant-editable homepage & storefront copy
 * that doesn't belong to any existing Medusa entity (hero banners, brand
 * story section, social links, etc). One row per logical "section" — the
 * `key` identifies which section (e.g. "home_hero"), `data` holds whatever
 * shape that section needs as JSON.
 */
const SiteContentEntry = model.define("site_content_entry", {
  id: model.id().primaryKey(),
  key: model.text().unique(),
  data: model.json(),
})

export default SiteContentEntry
