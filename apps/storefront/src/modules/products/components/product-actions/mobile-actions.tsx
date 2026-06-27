import { Dialog, Transition } from "@headlessui/react"
import { Button, clx } from "@modules/common/components/ui"
import React, { Fragment, useMemo } from "react"

import useToggleState from "@lib/hooks/use-toggle-state"
import X from "@modules/common/icons/x"

import { getProductPrice } from "@lib/util/get-product-price"
import OptionSelect from "./option-select"
import { HttpTypes } from "@medusajs/types"
import { isSimpleProduct } from "@lib/util/product"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

/**
 * Elora mobile sticky bar.
 * Single slim row: price (left) + Add-to-Bag CTA (right).
 * Tapping the CTA when options aren't picked opens a bottom-sheet picker.
 */
const MobileActions: React.FC<MobileActionsProps> = ({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}) => {
  const { state, open, close } = useToggleState()

  const price = getProductPrice({ product, variantId: variant?.id })
  const selectedPrice = useMemo(() => {
    if (!price) return null
    return price.variantPrice || price.cheapestPrice || null
  }, [price])

  const isSimple = isSimpleProduct(product)
  const productOptions = product.options || []
  const missing = productOptions.filter((o) => !options[o.id])
  const allChosen =
    productOptions.length > 0 && missing.length === 0

  const ctaLabel = !allChosen && !isSimple
    ? `Select ${missing[0]?.title || "Options"}`
    : !inStock
      ? "Out of Stock"
      : "Add to Bag"

  const colorSwatches = ((product.metadata as any)?.color_swatches ||
    []) as { name: string; hex: string }[]

  const onCtaClick = () => {
    if (!allChosen && !isSimple) {
      open()
      return
    }
    handleAddToCart()
  }

  return (
    <>
      <div
        className={clx("lg:hidden inset-x-0 bottom-0 fixed z-50", {
          "pointer-events-none": !show,
        })}
      >
        <Transition
          as={Fragment}
          show={show}
          enter="ease-silk duration-500"
          enterFrom="opacity-0 translate-y-3"
          enterTo="opacity-100 translate-y-0"
          leave="ease-silk duration-300"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-3"
        >
          <div
            className="bg-ink text-ivory px-4 py-4 flex items-center justify-between gap-3"
            data-testid="mobile-actions"
            style={{
              paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
              boxShadow: "0 -10px 30px -10px rgba(0,0,0,0.35)",
            }}
          >
            {/* Left: price + tiny label */}
            <div className="flex flex-col min-w-0">
              <span
                className="text-[0.55rem] tracking-[0.35em] uppercase text-gold-light"
                data-testid="mobile-title"
              >
                {allChosen ? "Total" : "From"}
              </span>
              {selectedPrice && (
                <span className="font-sans text-[1rem] tracking-[0.08em] text-ivory whitespace-nowrap">
                  {selectedPrice.price_type === "sale" && (
                    <span className="line-through mr-2 text-ivory/50 text-sm">
                      {selectedPrice.original_price}
                    </span>
                  )}
                  {selectedPrice.calculated_price}
                </span>
              )}
            </div>

            {/* Right: single big CTA — takes most of the bar */}
            <button
              onClick={onCtaClick}
              disabled={isAdding || (allChosen && (!inStock || !variant))}
              className={clx(
                "flex-1 max-w-[60%] h-12 font-sans text-[0.7rem] tracking-[0.25em] uppercase",
                "transition-all duration-500 ease-silk",
                "disabled:opacity-50",
                allChosen && inStock && variant
                  ? "bg-gold text-ink hover:bg-gold-light"
                  : "bg-ivory text-ink"
              )}
              data-testid="mobile-cart-button"
            >
              {isAdding ? "…" : ctaLabel}
            </button>
          </div>
        </Transition>
      </div>

      {/* Bottom-sheet picker for choosing Size / Color when CTA is tapped early */}
      <Transition appear show={state} as={Fragment}>
        <Dialog as="div" className="relative z-[75]" onClose={close}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed bottom-0 inset-x-0 z-[80]">
            <Transition.Child
              as={Fragment}
              enter="ease-silk duration-400"
              enterFrom="translate-y-full"
              enterTo="translate-y-0"
              leave="ease-silk duration-300"
              leaveFrom="translate-y-0"
              leaveTo="translate-y-full"
            >
              <Dialog.Panel
                className="w-full bg-ivory rounded-t-2xl overflow-hidden flex flex-col max-h-[85vh]"
                data-testid="mobile-actions-modal"
              >
                {/* Header */}
                <div className="flex items-start justify-between px-6 pt-6 pb-2">
                  <div>
                    <span className="text-[0.6rem] tracking-[0.3em] uppercase text-gold">
                      Choose
                    </span>
                    <h3 className="font-serif font-light text-ink text-2xl mt-1">
                      {product.title}
                    </h3>
                  </div>
                  <button
                    onClick={close}
                    aria-label="Close"
                    className="w-10 h-10 rounded-full border border-ink/15 text-ink flex justify-center items-center hover:bg-cream transition-colors"
                    data-testid="close-modal-button"
                  >
                    <X />
                  </button>
                </div>

                {/* Pickers */}
                <div className="px-6 py-6 overflow-y-auto flex flex-col gap-y-6">
                  {productOptions.map((option) => (
                    <OptionSelect
                      key={option.id}
                      option={option}
                      current={options[option.id]}
                      updateOption={updateOptions}
                      title={option.title ?? ""}
                      colorSwatches={colorSwatches}
                      disabled={optionsDisabled}
                    />
                  ))}
                </div>

                {/* Footer CTA */}
                <div
                  className="px-6 py-4 border-t border-gold/15"
                  style={{
                    paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
                  }}
                >
                  <Button
                    onClick={() => {
                      if (allChosen) {
                        handleAddToCart()
                        close()
                      }
                    }}
                    disabled={!allChosen || !inStock || isAdding}
                    variant="primary"
                    className="w-full"
                    isLoading={isAdding}
                  >
                    {!allChosen
                      ? `Select ${missing[0]?.title || "Options"}`
                      : !inStock
                        ? "Out of Stock"
                        : "Add to Bag"}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default MobileActions
