import { defineMiddlewares } from "@medusajs/framework/http"
import { Request, Response, NextFunction } from "express"
import path from "path"
import fs from "fs"
import { siteContentMiddlewares } from "./admin/site-content/middlewares"
import { testimonialMiddlewares } from "./admin/testimonials/middlewares"

/**
 * Serve files from `apps/backend/static/` at `/static/*`.
 *
 * Why this exists:
 * Medusa v2 doesn't ship a built-in static-file route — putting images in
 * `apps/backend/static/` is a community convention, not an out-of-the-box
 * served path. This middleware exposes that folder so seeded product images
 * with URLs like `/static/product_dress_3.png` actually resolve.
 *
 * Production path is resolved relative to process.cwd(). When the server
 * starts from `.medusa/server/`, we look one level up at the original source
 * folder which Render's build copied into the deploy.
 */

// Try a few candidate paths so this works in dev (run from apps/backend),
// production (run from apps/backend/.medusa/server), and edge cases.
const STATIC_CANDIDATES = [
  path.resolve(process.cwd(), "static"),                 // dev (medusa develop)
  path.resolve(process.cwd(), "..", "..", "static"),     // .medusa/server → apps/backend/static
  path.resolve(process.cwd(), "..", "static"),
]
const STATIC_ROOT =
  STATIC_CANDIDATES.find((p) => {
    try {
      return fs.statSync(p).isDirectory()
    } catch {
      return false
    }
  }) || STATIC_CANDIDATES[0]

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
}

export default defineMiddlewares({
  routes: [
    ...siteContentMiddlewares,
    ...testimonialMiddlewares,
    {
      matcher: "/static/*",
      method: ["GET", "HEAD"],
      middlewares: [
        (req: Request, res: Response, next: NextFunction) => {
          // Strip the /static/ prefix and resolve safely under STATIC_ROOT.
          const rawPath = req.path.replace(/^\/static\//, "")
          const safe = path
            .normalize(rawPath)
            .replace(/^(\.\.[\/\\])+/, "") // block path traversal
          const filePath = path.join(STATIC_ROOT, safe)

          if (!filePath.startsWith(STATIC_ROOT)) {
            return res.status(403).send("Forbidden")
          }

          fs.stat(filePath, (err, stat) => {
            if (err || !stat.isFile()) return next()
            const ext = path.extname(filePath).toLowerCase()
            res.setHeader(
              "Content-Type",
              MIME[ext] || "application/octet-stream"
            )
            res.setHeader("Cache-Control", "public, max-age=86400")
            fs.createReadStream(filePath).pipe(res)
          })
        },
      ],
    },
  ],
})
