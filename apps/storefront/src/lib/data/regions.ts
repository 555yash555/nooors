"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

// Short shared time-based revalidation, not the per-session cache-tag
// helper — regions are edited via Admin (Settings > Regions), a separate
// session that can never invalidate a visitor-scoped cache tag. Same bug
// class as products/categories/collections/site-content/payment-providers/
// shipping-options.
export const listRegions = async () => {
  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next: { revalidate: 30 },
    })
    .then(({ regions }) => regions)
}

export const retrieveRegion = async (id: string) => {
  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next: { revalidate: 30 },
    })
    .then(({ region }) => region)
}

// NOTE: this in-memory map persists for the lifetime of the server process
// (not per-request) — a second, separate layer of staleness on top of the
// Next.js fetch cache above. A region edit (e.g. enabling a country) won't
// be picked up here until the server process restarts/redeploys. Low risk
// in practice (region config changes are rare), but worth knowing if a
// region-level change ever seems to need a restart to take effect.
const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  if (regionMap.has(countryCode)) {
    return regionMap.get(countryCode)
  }

  const regions = await listRegions()

  if (!regions) {
    return null
  }

  regions.forEach((region) => {
    region.countries?.forEach((c) => {
      regionMap.set(c?.iso_2 ?? "", region)
    })
  })

  const region = countryCode
    ? regionMap.get(countryCode)
    : regionMap.get("us")

  return region
}
