"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

// Short shared time-based revalidation, not the per-session cache-tag
// helper — collection edits happen via the Admin dashboard, a separate
// session that can never invalidate a visitor-scoped cache tag. See
// lib/data/site-content.ts for the same reasoning.
export const retrieveCollection = async (id: string) => {
  return await sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next: { revalidate: 30 },
      }
    )
    .then(({ collection }) => collection)
}

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return await sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        next: { revalidate: 30 },
      }
    )
    .then(({ collections }) => ({ collections, count: collections.length }))
}

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection | null> => {
  return await sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "*products" },
      next: { revalidate: 30 },
    })
    .then(({ collections }) => collections[0] || null)
}
