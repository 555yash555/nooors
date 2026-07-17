import { ExecArgs } from "@medusajs/framework/types"
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import fs from "fs"
import path from "path"

/**
 * One-time migration — uploads the 8 seeded PNGs from apps/backend/static/
 * to Cloudflare R2 via the file module, then rewrites every product's
 * `thumbnail` and `images[]` that reference `/static/<file>` to the new
 * public R2 URL. Idempotent: re-running just re-uploads (R2 overwrites by
 * key) and re-points the same products to the same resulting URLs.
 *
 * Run: npx medusa exec ./src/scripts/migrate-images-to-r2.ts
 */
export default async function migrateImagesToR2({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fileModuleService = container.resolve(Modules.FILE)

  const staticDir = path.resolve(__dirname, "../../static")
  const files = fs.readdirSync(staticDir).filter((f) => f.endsWith(".png"))

  logger.info(`Found ${files.length} images in ${staticDir}`)

  // 1. Upload every file, build old-filename -> new-R2-url map.
  const urlMap = new Map<string, string>()
  for (const filename of files) {
    const filePath = path.join(staticDir, filename)
    // The S3 file provider expects `content` as base64 — it tries a
    // base64-decode-then-reencode round-trip and falls back to utf8 decoding
    // if that doesn't match. Passing a raw "binary"/latin1 string isn't valid
    // base64, so it silently fell through to the utf8 path and corrupted
    // every byte >= 0x80 in the PNG (confirmed: uploaded size was ~1.5x the
    // original, the signature of latin1-as-utf8 mis-decoding).
    const content = fs.readFileSync(filePath).toString("base64")

    const [uploaded] = await fileModuleService.createFiles([
      {
        filename,
        mimeType: "image/png",
        content,
      },
    ])

    urlMap.set(filename, uploaded.url)
    logger.info(`Uploaded ${filename} -> ${uploaded.url}`)
  }

  // 2. Find every product whose thumbnail or images reference /static/*.
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "thumbnail", "images.id", "images.url"],
  })

  const toStaticFilename = (url?: string | null) => {
    if (!url) return null
    const match = url.match(/\/static\/([^/?#]+)$/)
    return match ? match[1] : null
  }

  let updatedCount = 0
  for (const product of products) {
    const thumbFilename = toStaticFilename(product.thumbnail)
    const newThumbnail =
      thumbFilename && urlMap.has(thumbFilename)
        ? urlMap.get(thumbFilename)!
        : product.thumbnail

    const images = (product.images ?? []).map((img: any) => {
      const filename = toStaticFilename(img.url)
      return {
        url: filename && urlMap.has(filename) ? urlMap.get(filename)! : img.url,
      }
    })

    const changed =
      newThumbnail !== product.thumbnail ||
      images.some((img: any, i: number) => img.url !== product.images?.[i]?.url)

    if (!changed) continue

    await updateProductsWorkflow(container).run({
      input: {
        selector: { id: product.id },
        update: {
          thumbnail: newThumbnail,
          images,
        },
      },
    })

    updatedCount++
    logger.info(`Updated product ${product.id}`)
  }

  logger.info(`Done. ${updatedCount} product(s) repointed to R2.`)
}
