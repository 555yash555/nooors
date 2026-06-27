"use client"

import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@modules/common/components/ui"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

/**
 * NOOORS preview list — items render as divs so no <table>/<tbody> wrapper.
 * Scrolls when more than 4 lines.
 */
const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart.items
  const hasOverflow = items && items.length > 4

  return (
    <div
      className={clx({
        "overflow-y-auto overflow-x-hidden no-scrollbar max-h-[420px]":
          hasOverflow,
      })}
      data-testid="items-table"
    >
      {items
        ? items
            .sort((a, b) =>
              (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
            )
            .map((item) => (
              <Item
                key={item.id}
                item={item}
                type="preview"
                currencyCode={cart.currency_code}
              />
            ))
        : repeat(5).map((i) => <SkeletonLineItem key={i} />)}
    </div>
  )
}

export default ItemsPreviewTemplate
