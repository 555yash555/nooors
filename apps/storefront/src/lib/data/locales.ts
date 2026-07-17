"use server"

import { sdk } from "@lib/config"

export type Locale = {
  code: string
  name: string
}

/**
 * Fetches available locales from the backend.
 * Returns null if the endpoint returns 404 (locales not configured).
 *
 * Short shared time-based revalidation, not the per-session cache-tag
 * helper — same bug class as products/categories/collections/etc: locale
 * config is admin-controlled, not visitor-controlled.
 */
export const listLocales = async (): Promise<Locale[] | null> => {
  return sdk.client
    .fetch<{ locales: Locale[] }>(`/store/locales`, {
      method: "GET",
      next: { revalidate: 30 },
    })
    .then(({ locales }) => locales)
    .catch(() => null)
}
