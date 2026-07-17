import { NextResponse } from "next/server"

/**
 * Convenience redirect — visiting the storefront's own `/admin` path sends
 * merchants straight to the Medusa admin dashboard on the backend, instead
 * of them needing to remember/bookmark the backend's URL separately.
 *
 * Excluded from the region-code middleware (see middleware.ts config
 * matcher) so it isn't rewritten to `/<countryCode>/admin` first.
 */
export function GET() {
  const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL

  if (!backendUrl) {
    return new NextResponse(
      "NEXT_PUBLIC_MEDUSA_BACKEND_URL is not configured.",
      { status: 500 }
    )
  }

  return NextResponse.redirect(`${backendUrl}/app`, 307)
}
