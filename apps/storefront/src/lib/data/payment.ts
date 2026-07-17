"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"
import { HttpTypes } from "@medusajs/types"

// Short shared time-based revalidation, not the per-session cache-tag
// helper — enabling/disabling a payment provider happens via the Admin
// dashboard's Region settings, a separate session that can never invalidate
// a visitor-scoped cache tag. See lib/data/site-content.ts for the same
// reasoning; this is the same bug class caught there and in products/
// categories/collections.
export const listCartPaymentMethods = async (regionId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<HttpTypes.StorePaymentProviderListResponse>(
      `/store/payment-providers`,
      {
        method: "GET",
        query: { region_id: regionId },
        headers,
        next: { revalidate: 30 },
      }
    )
    .then(({ payment_providers }) =>
      payment_providers.sort((a, b) => {
        return a.id > b.id ? 1 : -1
      })
    )
    .catch(() => {
      return null
    })
}
