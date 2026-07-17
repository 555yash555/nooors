"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

import { getAuthHeaders } from "./cookies"

// Short shared time-based revalidation, not the per-session cache-tag
// helper — variant data (images, etc) is admin-controlled catalog data,
// same bug class as products/categories/collections.
export const retrieveVariant = async (
  variant_id: string
): Promise<HttpTypes.StoreProductVariant | null> => {
  const authHeaders = await getAuthHeaders()

  if (!authHeaders) return null

  const headers = {
    ...authHeaders,
  }

  return await sdk.client
    .fetch<{ variant: HttpTypes.StoreProductVariant }>(
      `/store/product-variants/${variant_id}`,
      {
        method: "GET",
        query: {
          fields: "*images",
        },
        headers,
        next: { revalidate: 30 },
      }
    )
    .then(({ variant }) => variant)
    .catch(() => null)
}
