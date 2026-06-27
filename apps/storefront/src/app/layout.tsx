import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Cormorant_Garamond, Montserrat, Allura } from "next/font/google"
import "styles/globals.css"

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
})

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
})

// Script font for the "elora" wordmark in nav / footer / hero
const script = Allura({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-script",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Elora by Harnoor — Luxury Women's Fashion",
    template: "%s · Elora",
  },
  description:
    "Elora by Harnoor is a luxury women's fashion house. Couture gowns, tailored separates, and editorial pieces — crafted with love.",
  applicationName: "Elora by Harnoor",
  authors: [{ name: "Harnoor · Elora Atelier" }],
  keywords: [
    "luxury fashion",
    "couture",
    "designer gowns",
    "atelier",
    "women's fashion",
    "Elora",
    "Harnoor",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Elora by Harnoor",
    title: "Elora by Harnoor — Luxury Women's Fashion",
    description:
      "Couture gowns, tailored separates, and editorial pieces — crafted with love.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Elora by Harnoor — Dressed in Silence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Elora by Harnoor — Luxury Women's Fashion",
    description:
      "Couture gowns, tailored separates, and editorial pieces — crafted with love.",
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-mode="light"
      className={`${serif.variable} ${sans.variable} ${script.variable}`}
    >
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
