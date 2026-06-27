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
