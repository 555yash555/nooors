import { ExecArgs } from "@medusajs/framework/types"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import fs from "fs"
import path from "path"

/**
 * Uploads the two site-chrome hero images (home hero + cinematic/store-hero
 * background) to R2 with STABLE keys under `site/`, bypassing Medusa's file
 * module (which auto-suffixes uploads with a ULID). These images are
 * hardcoded in components rather than stored on a product record, so their
 * URL must never change between re-uploads.
 *
 * Run: npx medusa exec ./src/scripts/upload-site-images-to-r2.ts
 */
export default async function uploadSiteImagesToR2({}: ExecArgs) {
  const client = new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  })

  const staticDir = path.resolve(__dirname, "../../static")
  const targets = [
    "hero_main.png",
    "hero_secondary.png",
    // Category tile backgrounds (home page) — hardcoded by filename in
    // categories/index.tsx's CATEGORY_HERO map, not tied to a product record.
    "product_dress_1.png",
    "product_coat_4.png",
    "product_blouse_5.png",
    "product_set_2.png",
  ]

  for (const filename of targets) {
    const filePath = path.join(staticDir, filename)
    const body = fs.readFileSync(filePath)
    const key = `site/${filename}`

    await client.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET!,
        Key: key,
        Body: body,
        ContentType: "image/png",
      })
    )

    console.log(`Uploaded ${filename} -> ${process.env.S3_FILE_URL}/${key}`)
  }

  console.log("DONE")
}
