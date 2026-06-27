import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { Cormorant_Garamond, Montserrat } from "next/font/google"
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

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "NOOORS — Luxury Women's Fashion",
    template: "%s · NOOORS",
  },
  description:
    "NOOORS is a luxury women's fashion house. Couture gowns, tailored separates, and editorial pieces — crafted in Paris, worn everywhere.",
  applicationName: "NOOORS",
  authors: [{ name: "NOOORS Atelier" }],
  keywords: [
    "luxury fashion",
    "couture",
    "designer gowns",
    "Paris atelier",
    "women's fashion",
    "NOOORS",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "NOOORS",
    title: "NOOORS — Luxury Women's Fashion",
    description:
      "Couture gowns, tailored separates, and editorial pieces — crafted in Paris, worn everywhere.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "NOOORS — Dressed in Silence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NOOORS — Luxury Women's Fashion",
    description:
      "Couture gowns, tailored separates, and editorial pieces — crafted in Paris, worn everywhere.",
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
      className={`${serif.variable} ${sans.variable}`}
    >
      <body>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
