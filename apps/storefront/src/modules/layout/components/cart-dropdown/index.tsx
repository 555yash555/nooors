"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timer | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const totalItems =
    cartState?.items?.reduce((acc, item) => {
      return acc + item.quantity
    }, 0) || 0

  const subtotal = cartState?.subtotal ?? 0
  const itemRef = useRef<number>(totalItems || 0)

  const timedOpen = () => {
    open()

    const timer = setTimeout(close, 5000)

    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) {
      clearTimeout(activeTimer)
    }

    open()
  }

  // Clean up the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (activeTimer) {
        clearTimeout(activeTimer)
      }
    }
  }, [activeTimer])

  const pathname = usePathname()

  // open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== totalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, itemRef.current])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full">
        <PopoverButton className="h-full">
          <LocalizedClientLink
            className="nav__link"
            href="/cart"
            data-testid="nav-cart-link"
          >{`Bag (${totalItems})`}</LocalizedClientLink>
        </PopoverButton>
        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-ivory border border-gold/20 w-[440px] text-ink shadow-[0_20px_50px_-20px_rgba(26,24,20,0.25)]"
            data-testid="nav-cart-dropdown"
          >
            <div className="px-6 py-5 border-b border-gold/20 text-center">
              <span className="text-[0.6rem] tracking-[0.35em] uppercase text-gold">
                Your Selection
              </span>
              <h3 className="font-serif font-light text-2xl mt-2">The Bag</h3>
            </div>
            {cartState && cartState.items?.length ? (
              <>
                <div className="overflow-y-auto max-h-[402px] px-6 py-5 grid grid-cols-1 gap-y-6 no-scrollbar">
                  {cartState.items
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "")
                        ? -1
                        : 1
                    })
                    .map((item) => (
                      <div
                        className="grid grid-cols-[80px_1fr] gap-x-4"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="block"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>
                        <div className="flex flex-col justify-between min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col min-w-0 flex-1">
                              <LocalizedClientLink
                                href={`/products/${item.product_handle}`}
                                data-testid="product-link"
                                className="font-serif text-base text-ink leading-tight truncate hover:text-gold transition-colors"
                              >
                                {item.title}
                              </LocalizedClientLink>
                              <LineItemOptions
                                variant={item.variant}
                                data-testid="cart-item-variant"
                                data-value={item.variant}
                              />
                              <span
                                className="text-[0.65rem] tracking-[0.25em] uppercase text-smoke mt-1"
                                data-testid="cart-item-quantity"
                                data-value={item.quantity}
                              >
                                Qty · {item.quantity}
                              </span>
                            </div>
                            <div className="text-right shrink-0 font-sans text-sm text-ink whitespace-nowrap">
                              <LineItemPrice
                                item={item}
                                style="tight"
                                currencyCode={cartState.currency_code}
                              />
                            </div>
                          </div>
                          <DeleteButton
                            id={item.id}
                            className="mt-2 text-[0.65rem] tracking-[0.25em] uppercase text-smoke hover:text-gold"
                            data-testid="cart-item-remove-button"
                          >
                            Remove
                          </DeleteButton>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="px-6 py-5 border-t border-gold/20 flex flex-col gap-y-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[0.65rem] tracking-[0.25em] uppercase text-smoke">
                      Subtotal{" "}
                      <span className="text-smoke/60">(excl. taxes)</span>
                    </span>
                    <span
                      className="font-sans text-lg text-ink whitespace-nowrap"
                      data-testid="cart-subtotal"
                      data-value={subtotal}
                    >
                      {convertToLocale({
                        amount: subtotal,
                        currency_code: cartState.currency_code,
                      })}
                    </span>
                  </div>
                  <LocalizedClientLink href="/cart" passHref>
                    <Button
                      className="w-full"
                      data-testid="go-to-cart-button"
                    >
                      Go to Bag
                    </Button>
                  </LocalizedClientLink>
                </div>
              </>
            ) : (
              <div className="flex py-12 px-6 flex-col gap-y-5 items-center justify-center text-center">
                <span className="font-serif italic font-light text-smoke">
                  Your bag is currently empty.
                </span>
                <LocalizedClientLink href="/store">
                  <Button onClick={close} variant="secondary">
                    Explore Collection
                  </Button>
                </LocalizedClientLink>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}

export default CartDropdown
