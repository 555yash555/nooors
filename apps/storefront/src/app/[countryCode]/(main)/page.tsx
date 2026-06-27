import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import Cinematic from "@modules/home/components/cinematic"
import Categories from "@modules/home/components/categories"
import Testimonials from "@modules/home/components/testimonials"
import Newsletter from "@modules/home/components/newsletter"
import { Marquee } from "@modules/common/components/noors"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "NOOORS — Luxury Women's Fashion",
  description:
    "A luxury women's fashion house. Discover couture gowns, tailored separates, and editorial pieces crafted for the modern woman.",
}

const MARQUEE_ITEMS = [
  "Couture",
  "Editorial",
  "Atelier",
  "Timeless",
  "Refined",
  "Couture",
  "Editorial",
  "Atelier",
  "Timeless",
  "Refined",
]

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const region = await getRegion(countryCode)
  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      <Hero />
      <Marquee items={MARQUEE_ITEMS} />
      <ul className="block">
        <FeaturedProducts collections={collections} region={region} />
      </ul>
      <Cinematic />
      <Categories />
      <Testimonials />
      <Newsletter />
    </>
  )
}
