import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils"
import {
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createInventoryLevelsWorkflow,
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  createShippingOptionsWorkflow,
  deleteProductsWorkflow,
  deleteCollectionsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteRegionsWorkflow,
  deleteShippingOptionsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * NOOORS — Switch the whole storefront to India / INR / ₹.
 *
 * Wipes Europe region + EUR pricing, creates India region, INR shipping,
 * tax region, fulfillment service zone, and re-seeds the 6 NOOORS products
 * with luxury INR prices.
 *
 * Run: npx medusa exec ./src/scripts/switch-to-india.ts
 */

const BACKEND_BASE = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

type NoorsColor = { name: string; hex: string }
type NoorsProduct = {
  handle: string
  title: string
  category: string
  priceInr: number
  image: string
  material: string
  description: string
  colors: NoorsColor[]
  badge?: string
}

const SIZES = ["XS", "S", "M", "L", "XL"]

// Luxury INR pricing (rounded to clean numbers)
const PRODUCTS: NoorsProduct[] = [
  {
    handle: "emerald-hour-gown",
    title: "The Emerald Hour Gown",
    category: "Gowns",
    priceInr: 248000,
    image: "product_dress_3.png",
    material: "Silk charmeuse · Lace trim · Hand-finished",
    description:
      "A floor-grazing gown cut from Italian silk charmeuse, finished with whisper-fine French lace at the neckline. Designed for evenings that linger past the last glass of wine.",
    colors: [
      { name: "Emerald", hex: "#1a5c3a" },
      { name: "Noir", hex: "#1a1a1a" },
    ],
    badge: "New",
  },
  {
    handle: "ivory-power-set",
    title: "Ivory Power Set",
    category: "Sets",
    priceInr: 295000,
    image: "product_set_2.png",
    material: "Double-faced cashmere · Structured lapel",
    description:
      "A two-piece tailored cashmere suit. Sharp lapel, softened shoulder, and a column trouser built to carry you from morning meetings to the terrace at dusk.",
    colors: [
      { name: "Ivory", hex: "#f5f0e8" },
      { name: "Sand", hex: "#c8bba0" },
    ],
  },
  {
    handle: "champagne-plisse-set",
    title: "Champagne Plissé Set",
    category: "Separates",
    priceInr: 140000,
    image: "product_skirt_6.png",
    material: "Hammered silk satin · Pleated midi skirt",
    description:
      "Hand-pressed pleats in hammered silk satin catch the light like liquid champagne. Cinched at the waist with a hand-stitched belt of matching silk.",
    colors: [
      { name: "Champagne", hex: "#d4af37" },
      { name: "Cream", hex: "#e8dcc8" },
    ],
    badge: "Bestseller",
  },
  {
    handle: "noir-opulence-gown",
    title: "Noir Opulence Gown",
    category: "Gowns",
    priceInr: 365000,
    image: "product_dress_1.png",
    material: "Black satin · Gold beadwork · Couture finish",
    description:
      "A couture gown of deep black satin traced with hand-applied gold beadwork. Each piece takes over 120 hours in our Paris atelier — only twelve are made per season.",
    colors: [
      { name: "Noir", hex: "#0a0a0a" },
      { name: "Gold", hex: "#d4af37" },
    ],
    badge: "Limited",
  },
  {
    handle: "camel-atelier-coat",
    title: "Camel Atelier Coat",
    category: "Outerwear",
    priceInr: 442000,
    image: "product_coat_4.png",
    material: "Double-faced wool · Structured silhouette",
    description:
      "A double-faced virgin wool coat with a structured shoulder and hand-stitched lapel. Cut to fall just below the knee, it is an heirloom waiting to happen.",
    colors: [
      { name: "Camel", hex: "#c19a6b" },
      { name: "Noir", hex: "#1a1a1a" },
      { name: "Tobacco", hex: "#8b7355" },
    ],
  },
  {
    handle: "organza-bloom-blouse",
    title: "Organza Bloom Blouse",
    category: "Separates",
    priceInr: 85000,
    image: "product_blouse_5.png",
    material: "Sheer organza · Embroidered pearl detail",
    description:
      "An ethereal silk-organza blouse with a constellation of seed pearls hand-embroidered at the collar. Built to be layered, or worn entirely on its own.",
    colors: [
      { name: "White", hex: "#fafafa" },
      { name: "Blush", hex: "#ede0d4" },
    ],
    badge: "New",
  },
]

const CATEGORY_NAMES = ["Gowns", "Outerwear", "Separates", "Sets"]
const COLLECTION_HANDLE = "ss-2025"
const COLLECTION_TITLE = "S/S 2025"

export default async function switchToIndia({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT)

  logger.info("[NOOORS-IN] Starting India / INR switch")

  // -------- Make sure store supports INR --------
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "supported_currencies.*"],
  })
  if (stores.length) {
    const store = stores[0]
    const hasInr = (store.supported_currencies || []).some(
      (c: any) => c.currency_code === "inr"
    )
    if (!hasInr) {
      logger.info("[NOOORS-IN] Adding INR to store supported currencies")
      await updateStoresWorkflow(container).run({
        input: {
          selector: { id: store.id },
          update: {
            supported_currencies: [
              { currency_code: "inr", is_default: true },
              ...(store.supported_currencies || [])
                .filter((c: any) => c.currency_code !== "inr")
                .map((c: any) => ({
                  currency_code: c.currency_code,
                  is_default: false,
                })),
            ],
          },
        },
      })
    }
  }

  // -------- Reuse existing sales channel + stock location --------
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  if (!salesChannels.length) {
    throw new Error("No sales channel — run initial seed first")
  }
  const defaultSalesChannel =
    salesChannels.find((s: any) => s.name === "Default Sales Channel") ||
    salesChannels[0]

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })
  if (!stockLocations.length) {
    throw new Error("No stock location — run initial seed first")
  }
  const stockLocation = stockLocations[0]

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  const shippingProfile = shippingProfiles[0]

  // -------- Wipe inventory reservations (test orders block delete otherwise) --------
  const inventoryModuleService = container.resolve(Modules.INVENTORY)
  const reservations =
    await inventoryModuleService.listReservationItems({})
  if (reservations.length) {
    logger.info(
      `[NOOORS-IN] Deleting ${reservations.length} inventory reservation(s)`
    )
    await inventoryModuleService.deleteReservationItems(
      reservations.map((r: any) => r.id)
    )
  }

  // -------- Wipe products / categories / collections --------
  logger.info("[NOOORS-IN] Wiping existing catalog")
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id"],
  })
  if (existingProducts.length) {
    await deleteProductsWorkflow(container).run({
      input: { ids: existingProducts.map((p: any) => p.id) },
    })
  }

  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id"],
  })
  if (existingCategories.length) {
    await deleteProductCategoriesWorkflow(container).run({
      input: existingCategories.map((c: any) => c.id),
    })
  }

  const { data: existingCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id"],
  })
  if (existingCollections.length) {
    await deleteCollectionsWorkflow(container).run({
      input: existingCollections.map((c: any) => c.id),
    })
  }

  // -------- Wipe old shipping options + regions --------
  logger.info("[NOOORS-IN] Wiping Europe region + shipping")
  const { data: shippingOpts } = await query.graph({
    entity: "shipping_option",
    fields: ["id"],
  })
  if (shippingOpts.length) {
    await deleteShippingOptionsWorkflow(container).run({
      input: { ids: shippingOpts.map((s: any) => s.id) },
    })
  }

  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id"],
  })
  if (existingRegions.length) {
    await deleteRegionsWorkflow(container).run({
      input: { ids: existingRegions.map((r: any) => r.id) },
    })
  }

  // -------- Wipe + recreate fulfillment service zones --------
  logger.info("[NOOORS-IN] Resetting fulfillment for India")
  const existingSets = await fulfillmentModuleService.listFulfillmentSets({})
  if (existingSets.length) {
    await fulfillmentModuleService.deleteFulfillmentSets(
      existingSets.map((s: any) => s.id)
    )
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "India Warehouse delivery",
    type: "shipping",
    service_zones: [
      {
        name: "India",
        geo_zones: [{ country_code: "in", type: "country" }],
      },
    ],
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })

  // -------- Create India region (INR) --------
  logger.info("[NOOORS-IN] Creating India region with INR")
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "India",
          currency_code: "inr",
          countries: ["in"],
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  })
  const region = regionResult[0]

  try {
    await createTaxRegionsWorkflow(container).run({
      input: [{ country_code: "in", provider_id: "tp_system" }],
    })
  } catch (e: any) {
    logger.info(`[NOOORS-IN] Tax region exists: ${e.message}`)
  }

  // -------- INR Shipping options --------
  logger.info("[NOOORS-IN] Creating INR shipping options")
  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Delivered in 3-5 business days",
          code: "standard",
        },
        prices: [
          { currency_code: "inr", amount: 250 },
          { region_id: region.id, amount: 250 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Delivered next business day",
          code: "express",
        },
        prices: [
          { currency_code: "inr", amount: 750 },
          { region_id: region.id, amount: 750 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  })

  // -------- Link sales channel to stock location --------
  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [defaultSalesChannel.id] },
    })
  } catch (e: any) {
    logger.info(`[NOOORS-IN] SC↔stock link existed: ${e.message}`)
  }

  // -------- Categories --------
  const { result: createdCategories } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: CATEGORY_NAMES.map((name) => ({
        name,
        is_active: true,
      })),
    },
  })
  const categoryByName = new Map<string, any>()
  createdCategories.forEach((c) => categoryByName.set(c.name, c))

  // -------- Collection (handle gets time-suffixed to avoid soft-delete conflicts) --------
  const handleSuffix = String(Date.now()).slice(-6)
  const { result: createdCollections } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: [
        {
          title: COLLECTION_TITLE,
          handle: `${COLLECTION_HANDLE}-${handleSuffix}`,
        },
      ],
    },
  })
  const collection = createdCollections[0]

  // -------- Products (INR prices) --------
  logger.info(`[NOOORS-IN] Seeding ${PRODUCTS.length} products in INR`)
  const productsInput = PRODUCTS.map((p) => {
    const variants = SIZES.flatMap((size) =>
      p.colors.map((color) => ({
        title: `${size} / ${color.name}`,
        sku: `${p.handle.toUpperCase()}-${size}-${color.name.toUpperCase().replace(/\s+/g, "")}`,
        manage_inventory: true,
        options: { Size: size, Color: color.name },
        prices: [{ amount: p.priceInr, currency_code: "inr" }],
      }))
    )

    return {
      title: p.title,
      handle: p.handle,
      description: p.description,
      status: ProductStatus.PUBLISHED,
      shipping_profile_id: shippingProfile.id,
      category_ids: [categoryByName.get(p.category).id],
      collection_id: collection.id,
      sales_channels: [{ id: defaultSalesChannel.id }],
      weight: 1000,
      images: [{ url: `${BACKEND_BASE}/static/${p.image}` }],
      thumbnail: `${BACKEND_BASE}/static/${p.image}`,
      options: [
        { title: "Size", values: SIZES },
        { title: "Color", values: p.colors.map((c) => c.name) },
      ],
      variants,
      metadata: {
        material: p.material,
        badge: p.badge ?? null,
        color_swatches: p.colors,
      },
    }
  })

  const { result: createdProducts } = await createProductsWorkflow(
    container
  ).run({ input: { products: productsInput as any } })
  logger.info(`[NOOORS-IN] Created ${createdProducts.length} products`)

  // -------- Inventory --------
  const { data: variantsWithInventory } = await query.graph({
    entity: "variant",
    fields: ["id", "inventory_items.inventory.id"],
    filters: { product_id: createdProducts.map((p: any) => p.id) },
  })

  const inventoryItemIds = new Set<string>()
  variantsWithInventory.forEach((v: any) => {
    v.inventory_items?.forEach((ii: any) => {
      if (ii.inventory?.id) inventoryItemIds.add(ii.inventory.id)
    })
  })

  if (inventoryItemIds.size > 0) {
    await createInventoryLevelsWorkflow(container).run({
      input: {
        inventory_levels: Array.from(inventoryItemIds).map((id) => ({
          inventory_item_id: id,
          location_id: stockLocation.id,
          stocked_quantity: 25,
        })),
      },
    })
  }

  logger.info("[NOOORS-IN] ✓ Store is now India / INR")
  logger.info(
    "[NOOORS-IN]   Set storefront NEXT_PUBLIC_DEFAULT_REGION=in and restart"
  )
}
