import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { clx } from "@modules/common/components/ui"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

/**
 * Elora Footer — couture dark with gold accents.
 * Categories + collections are dynamic from the backend.
 */
export default async function Footer() {
  const { collections } = await listCollections({
    fields: "id, handle, title",
  })
  const productCategories = await listCategories()

  return (
    <footer
      className="footer w-full text-ivory/65"
      style={{ background: "var(--noir)" }}
    >
      <div
        className="mx-auto w-full"
        style={{
          maxWidth: "var(--max-w)",
          paddingLeft: "var(--pad-x)",
          paddingRight: "var(--pad-x)",
        }}
      >
        {/* Top — brand + columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] gap-12 pt-20 pb-16 border-b border-ivory/10">
          <div>
            <LocalizedClientLink
              href="/"
              className="footer__logo flex flex-col items-start leading-none"
            >
              <span className="font-script text-ivory text-[3.5rem] leading-[0.85]">
                elora
              </span>
              <span className="text-[0.6rem] tracking-[0.5em] uppercase text-gold-light/80 mt-1">
                by Harnoor
              </span>
            </LocalizedClientLink>
            <p className="font-serif italic text-ivory/50 mt-5 text-base">
              Crafted with love. Worn with intention.
            </p>
          </div>

          {productCategories && productCategories.length > 0 && (
            <div>
              <h4 className="text-[0.7rem] tracking-[0.3em] uppercase text-gold-light font-normal mb-5">
                Collection
              </h4>
              <ul
                className="flex flex-col gap-2.5 text-sm"
                data-testid="footer-categories"
              >
                {productCategories.slice(0, 6).map((c) => {
                  if (c.parent_category) return null
                  return (
                    <li key={c.id}>
                      <LocalizedClientLink
                        className="hover:text-ivory hover:pl-2 transition-all duration-300 ease-silk inline-block text-ivory/70"
                        href={`/categories/${c.handle}`}
                        data-testid="category-link"
                      >
                        {c.name}
                      </LocalizedClientLink>
                    </li>
                  )
                })}
                <li>
                  <LocalizedClientLink
                    className="hover:text-ivory hover:pl-2 transition-all duration-300 ease-silk inline-block text-ivory/70"
                    href="/store"
                  >
                    All Pieces
                  </LocalizedClientLink>
                </li>
              </ul>
            </div>
          )}

          <div>
            <h4 className="text-[0.7rem] tracking-[0.3em] uppercase text-gold-light font-normal mb-5">
              Atelier
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                "Our Story",
                "Craftsmanship",
                "Sustainability",
                "Careers",
              ].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="hover:text-ivory hover:pl-2 transition-all duration-300 ease-silk inline-block text-ivory/70"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[0.7rem] tracking-[0.3em] uppercase text-gold-light font-normal mb-5">
              Client Services
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {[
                "Contact",
                "Sizing Guide",
                "Returns",
                "Bespoke Orders",
              ].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="hover:text-ivory hover:pl-2 transition-all duration-300 ease-silk inline-block text-ivory/70"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom — copyright + social */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-8 text-[0.75rem] tracking-[0.18em] uppercase">
          <p className="text-ivory/45">
            © {new Date().getFullYear()} Elora. All rights reserved.
          </p>
          <div className="flex gap-3">
            {[
              { label: "Instagram", short: "IG" },
              { label: "Pinterest", short: "PI" },
              { label: "TikTok", short: "TK" },
            ].map(({ label, short }) => (
              <a
                key={short}
                href="#"
                aria-label={label}
                className={clx(
                  "w-9 h-9 inline-flex items-center justify-center rounded-full",
                  "border border-ivory/15 text-[0.65rem] tracking-[0.15em]",
                  "hover:border-gold hover:text-gold hover:-translate-y-0.5",
                  "transition-all duration-500 ease-silk"
                )}
              >
                {short}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
