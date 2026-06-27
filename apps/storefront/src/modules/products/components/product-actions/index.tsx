"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@modules/common/components/ui"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      // Nudge the FIRST unfilled option into focus (named on the button).
      const firstUnfilled = (product.options || []).find(
        (o) => !options[o.id]
      )
      if (firstUnfilled) {
        // Each OptionSelect has its own [data-testid="product-options"];
        // find them in DOM order and pick the index of firstUnfilled.
        const pickers = Array.from(
          actionsRef.current?.querySelectorAll<HTMLElement>(
            '[data-testid="product-options"]'
          ) || []
        )
        const idx = (product.options || []).indexOf(firstUnfilled)
        const target = pickers[idx] || pickers[0]
        target?.scrollIntoView({ behavior: "smooth", block: "center" })
        target?.classList.add("ring-1", "ring-gold", "ring-offset-4")
        setTimeout(
          () =>
            target?.classList.remove(
              "ring-1",
              "ring-gold",
              "ring-offset-4"
            ),
          900
        )
      }
      return null
    }

    setIsAdding(true)

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    setIsAdding(false)
  }

  const colorSwatches = ((product.metadata as any)?.color_swatches ||
    []) as { name: string; hex: string }[]

  return (
    <>
      <div className="flex flex-col gap-y-8" ref={actionsRef}>
        <ProductPrice product={product} variant={selectedVariant} />

        {(product.variants?.length ?? 0) > 1 && (
          <div className="flex flex-col gap-y-6">
            {(product.options || []).map((option) => {
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    updateOption={setOptionValue}
                    title={option.title ?? ""}
                    colorSwatches={colorSwatches}
                    data-testid="product-options"
                    disabled={!!disabled || isAdding}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Add to Bag — names the missing option so the user knows exactly
            what's left to pick. Stays clickable until a valid OOS variant. */}
        {(() => {
          const productOptions = product.options || []
          const missingOptions = productOptions.filter((o) => !options[o.id])
          const allOptionsChosen =
            productOptions.length > 0 && missingOptions.length === 0
          let ctaLabel = "Add to Bag"
          if (!allOptionsChosen && missingOptions.length > 0) {
            ctaLabel = `Select ${missingOptions[0].title}`
          } else if (!isValidVariant) {
            ctaLabel = "Unavailable"
          } else if (!inStock) {
            ctaLabel = "Out of Stock"
          }
          const ctaDisabled =
            !!disabled ||
            isAdding ||
            (allOptionsChosen && (!inStock || !isValidVariant))
          return (
            <Button
              onClick={handleAddToCart}
              disabled={ctaDisabled}
              variant="primary"
              className="w-full magnetic"
              isLoading={isAdding}
              data-testid="add-product-button"
            >
              {ctaLabel}
            </Button>
          )
        })()}

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
