"use client"

import { Dialog, Transition } from "@headlessui/react"
import useToggleState from "@lib/hooks/use-toggle-state"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Fragment, useEffect } from "react"
import CountrySelect from "../country-select"
import LanguageSelect from "../language-select"
import { Locale } from "@lib/data/locales"

type SideMenuProps = {
  regions: HttpTypes.StoreRegion[] | null
  locales: Locale[] | null
  currentLocale: string | null
}

const LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Collection", href: "/store" },
  { label: "Atelier", href: "/#story" },
  { label: "Account", href: "/account" },
  { label: "Bag", href: "/cart" },
]

/**
 * Elora SideMenu — mobile-first slide-in drawer.
 *
 * Trigger: hamburger icon (44px touch target).
 * Panel: ivory full-height, slides from left, holds the wordmark + tracked-caps
 * navigation + locale/region pickers at bottom. Body scroll is locked while
 * open. Designed for thumb reach on mobile but works at any width.
 */
const SideMenu = ({ regions, locales, currentLocale }: SideMenuProps) => {
  const { state: open, open: setOpen, close } = useToggleState()
  const countryToggleState = useToggleState()
  const languageToggleState = useToggleState()

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={setOpen}
        data-testid="nav-menu-button"
        className="flex items-center justify-center w-11 h-11 -ml-2 group"
      >
        <span className="flex flex-col gap-[5px] items-start">
          <span className="block w-6 h-px bg-current transition-transform duration-500 ease-silk" />
          <span className="block w-4 h-px bg-current transition-all duration-500 ease-silk group-hover:w-6" />
          <span className="block w-6 h-px bg-current transition-transform duration-500 ease-silk" />
        </span>
      </button>

      <Transition show={open} as={Fragment}>
        <Dialog as="div" className="relative z-[60]" onClose={close}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-silk duration-400"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-silk duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-ink/55 backdrop-blur-sm" />
          </Transition.Child>

          {/* Panel */}
          <div className="fixed inset-y-0 left-0 flex">
            <Transition.Child
              as={Fragment}
              enter="ease-silk duration-500"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-silk duration-400"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel
                className="relative w-[88vw] max-w-[420px] h-full bg-ivory text-ink flex flex-col"
                data-testid="nav-menu-popup"
              >
                {/* Header — wordmark + close */}
                <div
                  className="flex items-center justify-between border-b border-gold/15"
                  style={{
                    paddingTop: "calc(1.25rem + env(safe-area-inset-top))",
                    paddingLeft: "1.5rem",
                    paddingRight: "1.25rem",
                    paddingBottom: "1.25rem",
                  }}
                >
                  <LocalizedClientLink
                    href="/"
                    onClick={close}
                    className="flex flex-col leading-none"
                  >
                    <span className="font-script text-[2rem] leading-[0.85] text-ink">
                      elora
                    </span>
                    <span className="text-[0.5rem] tracking-[0.45em] uppercase mt-1 text-smoke">
                      by Harnoor
                    </span>
                  </LocalizedClientLink>
                  <button
                    type="button"
                    onClick={close}
                    aria-label="Close menu"
                    data-testid="close-menu-button"
                    className="w-11 h-11 -mr-2 flex items-center justify-center text-ink"
                  >
                    <span className="relative block w-5 h-5">
                      <span className="absolute inset-x-0 top-1/2 h-px bg-current rotate-45" />
                      <span className="absolute inset-x-0 top-1/2 h-px bg-current -rotate-45" />
                    </span>
                  </button>
                </div>

                {/* Section label */}
                <span className="text-[0.55rem] tracking-[0.5em] uppercase text-gold mt-8 px-6">
                  Maison
                </span>

                {/* Links */}
                <nav className="flex-1 overflow-y-auto px-6 pt-4 pb-8">
                  <ul className="flex flex-col">
                    {LINKS.map((link, i) => (
                      <li
                        key={link.label}
                        className="border-b border-ink/8 last:border-b-0"
                      >
                        <LocalizedClientLink
                          href={link.href}
                          onClick={close}
                          data-testid={`${link.label.toLowerCase()}-link`}
                          className="flex items-baseline justify-between py-5 group"
                        >
                          <span className="font-serif font-light text-[1.75rem] leading-tight text-ink group-active:text-gold transition-colors">
                            {link.label}
                          </span>
                          <span className="text-[0.55rem] tracking-[0.3em] uppercase text-smoke tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Footer — locale + region + copyright */}
                <div
                  className="border-t border-gold/15 px-6 pt-6 flex flex-col gap-5 text-[0.7rem] tracking-[0.18em] uppercase text-smoke"
                  style={{
                    paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))",
                  }}
                >
                  {!!locales?.length && (
                    <div
                      onMouseEnter={languageToggleState.open}
                      onMouseLeave={languageToggleState.close}
                      onClick={languageToggleState.open}
                    >
                      <LanguageSelect
                        toggleState={languageToggleState}
                        locales={locales}
                        currentLocale={currentLocale}
                      />
                    </div>
                  )}
                  {regions && (
                    <div
                      onMouseEnter={countryToggleState.open}
                      onMouseLeave={countryToggleState.close}
                      onClick={countryToggleState.open}
                    >
                      <CountrySelect
                        toggleState={countryToggleState}
                        regions={regions}
                      />
                    </div>
                  )}
                  <p className="text-[0.6rem] tracking-[0.25em] text-smoke/70 mt-2">
                    © {new Date().getFullYear()} Elora · All rights reserved
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default SideMenu
