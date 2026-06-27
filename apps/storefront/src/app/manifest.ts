import { MetadataRoute } from "next"

/**
 * Web app manifest. Next.js serves at /manifest.webmanifest automatically.
 * Lets iOS / Android users "Add to Home Screen" with a branded icon + name.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Elora by Harnoor",
    short_name: "Elora",
    description:
      "Elora by Harnoor — luxury couture and editorial pieces, crafted with love.",
    start_url: "/",
    display: "standalone",
    background_color: "#f4f0ea",
    theme_color: "#1a1814",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  }
}
