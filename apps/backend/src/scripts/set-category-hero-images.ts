import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductCategoriesWorkflow } from "@medusajs/medusa/core-flows"

/**
 * One-time seed — sets `metadata.hero_image` on each existing category so
 * the homepage category tiles read their image from admin-editable data
 * instead of a hardcoded name->filename map. After this runs, a merchant
 * can change a category's tile image (or add a new category with one)
 * entirely from the admin panel: Categories -> edit -> Metadata ->
 * hero_image -> paste an R2/CDN URL.
 *
 * Run: npx medusa exec ./src/scripts/set-category-hero-images.ts
 */
export default async function setCategoryHeroImages({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  const R2_BASE = "https://pub-9cad65d70b394810add7ae0700500b86.r2.dev/site"

  const heroImageByName: Record<string, string> = {
    Gowns: `${R2_BASE}/product_dress_1.png`,
    Outerwear: `${R2_BASE}/product_coat_4.png`,
    Separates: `${R2_BASE}/product_blouse_5.png`,
    Sets: `${R2_BASE}/product_set_2.png`,
  }

  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name", "metadata"],
  })

  let updatedCount = 0
  for (const category of categories) {
    const heroImage = heroImageByName[category.name]
    if (!heroImage) continue

    await updateProductCategoriesWorkflow(container).run({
      input: {
        selector: { id: category.id },
        update: {
          metadata: {
            ...(category.metadata ?? {}),
            hero_image: heroImage,
          },
        },
      },
    })

    updatedCount++
    logger.info(`Set hero_image on "${category.name}" -> ${heroImage}`)
  }

  logger.info(`Done. ${updatedCount} categor${updatedCount === 1 ? "y" : "ies"} updated.`)
}
