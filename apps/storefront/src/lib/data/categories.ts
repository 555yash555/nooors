import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

// Short shared time-based revalidation, not the per-session cache-tag
// helper — category edits happen via the Admin dashboard, a separate
// session that can never invalidate a visitor-scoped cache tag. See
// lib/data/site-content.ts for the same reasoning.
export const listCategories = async (query?: Record<string, unknown>) => {
  const limit = query?.limit || 100

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields:
            "*category_children, *products, *parent_category, *parent_category.parent_category",
          limit,
          ...query,
        },
        next: { revalidate: 30 },
      }
    )
    .then(({ product_categories }) => product_categories)
}

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const handle = `${categoryHandle.join("/")}`

  return sdk.client
    .fetch<HttpTypes.StoreProductCategoryListResponse>(
      `/store/product-categories`,
      {
        query: {
          fields: "*category_children, *products",
          handle,
        },
        next: { revalidate: 30 },
      }
    )
    .then(({ product_categories }) => product_categories[0])
}
