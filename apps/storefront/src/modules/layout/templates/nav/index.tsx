import { Suspense } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"

/**
 * NOOORS Nav — fixed, transparent over hero; .nav--scrolled state
 * is toggled by NoorsMotion when window.scrollY > 80.
 */
export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <header
      id="noors-nav"
      // Default to the "scrolled" style (ivory bg + ink text) so non-home
      // pages render correctly even before JS boots. NoorsMotion removes
      // `nav--scrolled` on the home route when scrollY === 0, putting it
      // back into transparent-over-hero mode.
      className="nav nav--scrolled fixed top-0 inset-x-0 z-50 transition-all duration-500 ease-silk"
    >
      <style>{`
        #noors-nav .nav__inner { color: var(--ivory); }
        #noors-nav .nav__link { color: var(--ivory); }
        #noors-nav.nav--scrolled {
          background: rgba(251,248,243,0.92) !important;
          backdrop-filter: saturate(180%) blur(20px) !important;
          border-bottom: 1px solid rgba(184,153,104,0.2);
        }
        #noors-nav.nav--scrolled .nav__inner,
        #noors-nav.nav--scrolled .nav__link,
        #noors-nav.nav--scrolled .nav__logo {
          color: var(--ink);
        }
        #noors-nav .nav__link {
          position: relative;
          font-family: var(--font-sans), Montserrat, sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          padding: 0.5rem 0;
        }
        #noors-nav .nav__link::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 0;
          width: 0;
          height: 1px;
          background: var(--gold);
          transition: width 0.4s var(--t-silk), left 0.4s var(--t-silk);
        }
        #noors-nav .nav__link:hover::after,
        #noors-nav .nav__link.is-active::after {
          width: 100%;
          left: 0;
        }
      `}</style>
      <div
        className="nav__inner flex items-center justify-between h-20"
        style={{ paddingLeft: "var(--pad-x)", paddingRight: "var(--pad-x)" }}
      >
        {/* LEFT — Side menu (mobile-first hamburger) */}
        <div className="flex items-center gap-6 flex-1">
          <SideMenu
            regions={regions}
            locales={locales}
            currentLocale={currentLocale}
          />
        </div>

        {/* CENTER — Logo */}
        <LocalizedClientLink
          href="/"
          className="nav__logo font-serif font-light tracking-[0.35em] text-[1.6rem] uppercase"
          data-testid="nav-store-link"
        >
          NOOORS
        </LocalizedClientLink>

        {/* RIGHT — Links + actions */}
        <div className="flex items-center gap-8 flex-1 justify-end">
          <nav className="hidden lg:flex items-center gap-8">
            <LocalizedClientLink href="/store" className="nav__link">
              Collection
            </LocalizedClientLink>
            <LocalizedClientLink href="/account" className="nav__link" data-testid="nav-account-link">
              Account
            </LocalizedClientLink>
          </nav>
          <Suspense
            fallback={
              <LocalizedClientLink
                className="nav__link"
                href="/cart"
                data-testid="nav-cart-link"
              >
                Bag (0)
              </LocalizedClientLink>
            }
          >
            <CartButton />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
