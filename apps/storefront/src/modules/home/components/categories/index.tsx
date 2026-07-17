import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { SectionHeader } from "@modules/common/components/noors"
import { listCategories } from "@lib/data/categories"

/**
 * Elora category tiles — image comes from each category's own
 * `metadata.hero_image`, set in the admin panel (Categories -> edit ->
 * Metadata). No hardcoded name/filename map: rename a category, add a new
 * one, or swap its tile image, all without touching code or redeploying.
 * Categories without a hero_image set are simply not shown as a tile.
 */
export default async function Categories() {
  const categories = await listCategories()
  const featured = (categories || [])
    .filter((c: any) => c.metadata?.hero_image)
    .slice(0, 4)

  if (featured.length === 0) return null

  return (
    <section className="categories py-16 lg:py-32" id="categories">
      <SectionHeader label="Shop by Category" title="Your Wardrobe" />
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 mt-10 lg:mt-12 mx-auto"
        style={{
          maxWidth: "var(--max-w)",
          paddingLeft: "var(--pad-x)",
          paddingRight: "var(--pad-x)",
        }}
      >
        {featured.map((c: any) => (
          <LocalizedClientLink
            key={c.id}
            href={`/categories/${c.handle}`}
            className="category-tile group block relative overflow-hidden aspect-[3/4] rounded-[3px]"
          >
            <div
              className="category-tile__bg absolute inset-0 bg-cover bg-center transition-transform [transition-duration:1300ms] ease-silk group-hover:scale-110"
              style={{
                backgroundImage: `url('${c.metadata.hero_image}')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent group-hover:from-ink/85 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
              <h3
                className="font-serif font-light text-ivory transition-transform duration-700 ease-silk group-hover:translate-x-2"
                style={{
                  fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                  letterSpacing: "-0.01em",
                }}
              >
                {c.name}
              </h3>
              <span className="flex items-center gap-3 mt-2 text-[0.7rem] tracking-[0.35em] uppercase text-gold-light">
                <span className="w-8 h-px bg-gold-light" />
                Discover
              </span>
            </div>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
