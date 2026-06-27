import { NextResponse } from "next/server"

/**
 * Tiny liveness probe for UptimeRobot / load balancer health checks.
 * Returns 200 OK with a small JSON payload. No DB hit, no Medusa API call —
 * if the Node runtime answers, the storefront is up.
 *
 * Endpoint: GET /api/health → { ok: true, ts: <iso> }
 */
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export function GET() {
  return NextResponse.json(
    { ok: true, service: "elora-storefront", ts: new Date().toISOString() },
    { status: 200 }
  )
}

export function HEAD() {
  return new Response(null, { status: 200 })
}
