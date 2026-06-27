import { HttpTypes } from "@medusajs/types"

import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
}

const Item = ({ item, currencyCode }: ItemProps) => {
  return (
    <li
      className="flex items-center gap-6 py-6"
      data-testid="product-row"
    >
      <div className="w-24 shrink-0">
        <Thumbnail thumbnail={item.thumbnail} size="square" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-serif text-ink text-lg leading-tight"
          data-testid="product-name"
        >
          {item.product_title}
        </p>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </div>

      <div className="text-right shrink-0 flex flex-col items-end font-sans text-sm">
        <span className="text-smoke whitespace-nowrap">
          <span data-testid="product-quantity">{item.quantity}</span>×{" "}
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
        <span className="text-ink text-base mt-1 whitespace-nowrap">
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </div>
    </li>
  )
}

export default Item
