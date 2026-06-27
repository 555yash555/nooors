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
  deleteProductsWorkflow,
  deleteCollectionsWorkflow,
  deleteProductCategoriesWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
} from "@medusajs/medusa/core-flows"

/**
 * Elora — couture catalog seed.
 * Idempotent: wipes only Elora-managed products/categories/collection,
 * then creates the real catalog from ecom/products-data.js source.
 *
 * Run: npx medusa exec ./src/scripts/seed-noors.ts
 */

const BACKEND_BASE = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

type NoorsColor = { name: string; hex: string }
type NoorsProduct = {
  handle: string
  title: string
  category: string // "Gowns" | "Outerwear" | "Separates" | "Sets"
  priceUsd: number
  priceEur: number
  image: string
  material: string
  description: string
  colors: NoorsColor[]
  badge?: string
  sizes?: string[]
}

const SIZES_DEFAULT = ["XS", "S", "M", "L", "XL"]

const PRODUCTS: NoorsProduct[] = [
  {
    handle: "emerald-hour-gown",
    title: "The Emerald Hour Gown",
    category: "Gowns",
    priceUsd: 2850,
    priceEur: 2650,
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
    priceUsd: 3400,
    priceEur: 3160,
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
    priceUsd: 1620,
    priceEur: 1500,
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
    priceUsd: 4200,
    priceEur: 3900,
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
    priceUsd: 5100,
    priceEur: 4730,
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
    priceUsd: 980,
    priceEur: 910,
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

export default async function seedNoors({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)

  logger.info("[Elora] Starting couture catalog seed")

  // -------- Reuse existing region + sales channel + stock location --------
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  })
  if (!salesChannels.length) {
    throw new Error("No sales channel found — run initial seed first")
  }
  const defaultSalesChannel =
    salesChannels.find((s: any) => s.name === "Default Sales Channel") ||
    salesChannels[0]

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  })
  if (!stockLocations.length) {
    throw new Error("No stock location found — run initial seed first")
  }
  const stockLocation = stockLocations[0]

  // Ensure the sales channel can see this stock location (otherwise the
  // Store API reports every variant as out-of-stock).
  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: { id: stockLocation.id, add: [defaultSalesChannel.id] },
    })
  } catch (e: any) {
    logger.info(`[Elora] SC↔stock link already exists: ${e.message}`)
  }

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  })
  if (!shippingProfiles.length) {
    throw new Error("No shipping profile found")
  }
  const shippingProfile = shippingProfiles[0]

  // -------- Idempotency: wipe old products + categories + collection --------
  logger.info("[Elora] Clearing existing products / categories / collection")
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
    fields: ["id", "name"],
  })
  if (existingCategories.length) {
    await deleteProductCategoriesWorkflow(container).run({
      input: existingCategories.map((c: any) => c.id),
    })
  }

  const { data: existingCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
  })
  if (existingCollections.length) {
    await deleteCollectionsWorkflow(container).run({
      input: { ids: existingCollections.map((c: any) => c.id) },
    })
  }

  // -------- Categories --------
  logger.info("[Elora] Creating categories")
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

  // -------- Collection (S/S 2025 — for home featured rail) --------
  logger.info("[Elora] Creating collection")
  const { result: createdCollections } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: [
        {
          title: COLLECTION_TITLE,
          handle: COLLECTION_HANDLE,
        },
      ],
    },
  })
  const collection = createdCollections[0]

  // -------- Products --------
  logger.info(`[Elora] Creating ${PRODUCTS.length} products`)
  const productsInput = PRODUCTS.map((p) => {
    const sizes = p.sizes || SIZES_DEFAULT
    const variants = sizes.flatMap((size) =>
      p.colors.map((color) => ({
        title: `${size} / ${color.name}`,
        sku: `${p.handle.toUpperCase()}-${size}-${color.name.toUpperCase().replace(/\s+/g, "")}`,
        manage_inventory: true,
        options: {
          Size: size,
          Color: color.name,
        },
        prices: [
          { amount: p.priceEur, currency_code: "eur" },
          { amount: p.priceUsd, currency_code: "usd" },
        ],
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
        { title: "Size", values: sizes },
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
  ).run({
    input: { products: productsInput as any },
  })
  logger.info(`[Elora] Created ${createdProducts.length} products`)

  // -------- Inventory: stock every variant at the default location --------
  logger.info("[Elora] Stocking inventory")
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

  logger.info("[Elora] ✓ Couture catalog ready")
}
