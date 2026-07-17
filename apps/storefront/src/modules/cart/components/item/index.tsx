"use client"

import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

/**
 * Elora Cart line item.
 * Mobile: stacked card (thumb | name & meta | qty + price).
 * Desktop (sm+): horizontal row matching the column headers.
 */
const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  const maxQuantity = item.variant?.manage_inventory ? 10 : 10

  return (
    <div
      className="flex gap-4 py-5 border-b border-gold/10 last:border-0"
      data-testid="product-row"
    >
      {/* Thumbnail */}
      <LocalizedClientLink
        href={`/products/${item.product_handle}`}
        className="shrink-0 w-20 sm:w-24"
      >
        <Thumbnail
          thumbnail={item.thumbnail}
          images={item.variant?.product?.images}
          size="square"
        />
      </LocalizedClientLink>

      {/* Right side — title/meta + qty/price */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Title + variant — title forced to its own line so variant
            never wedges into a wrap. */}
        <div className="min-w-0 flex-1">
          <LocalizedClientLink
            href={`/products/${item.product_handle}`}
            className="block font-serif text-ink text-base sm:text-lg leading-tight hover:text-gold transition-colors"
            data-testid="product-title"
          >
            {item.product_title}
          </LocalizedClientLink>
          <div className="block">
            <LineItemOptions
              variant={item.variant}
              data-testid="product-variant"
            />
          </div>

          {/* Mobile-only unit price line */}
          {type === "full" && (
            <div className="sm:hidden mt-2 flex items-baseline gap-1 font-sans text-xs text-smoke">
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
              <span>each</span>
            </div>
          )}
        </div>

        {/* QTY + delete (full mode only) */}
        {type === "full" && (
          <div className="flex items-center gap-2 self-start">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              onChange={(value) =>
                changeQuantity(parseInt(value.target.value))
              }
              className="w-14 h-10 px-2"
              data-testid="product-select-button"
            >
              {Array.from(
                { length: Math.min(maxQuantity, 10) },
                (_, i) => (
                  <option value={i + 1} key={i}>
                    {i + 1}
                  </option>
                )
              )}
            </CartItemSelect>
            {updating && <Spinner />}
          </div>
        )}

        {/* Desktop unit price column */}
        {type === "full" && (
          <div className="hidden sm:block font-sans text-sm text-smoke whitespace-nowrap self-start min-w-[100px] text-right">
            <LineItemUnitPrice
              item={item}
              style="tight"
              currencyCode={currencyCode}
            />
          </div>
        )}

        {/* Total */}
        <div className="text-right font-sans text-base text-ink whitespace-nowrap self-start sm:min-w-[120px]">
          {type === "preview" && (
            <span className="block text-xs text-smoke">
              {item.quantity}×{" "}
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </div>
      </div>

      {error && (
        <div className="absolute mt-32">
          <ErrorMessage error={error} data-testid="product-error-message" />
        </div>
      )}
    </div>
  )
}

export default Item
