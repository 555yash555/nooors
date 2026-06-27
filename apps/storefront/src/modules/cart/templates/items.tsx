import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      {/* Desktop column headers — hidden on mobile since items are stacked */}
      <div className="hidden sm:flex gap-4 pb-3 border-b border-gold/20 text-[0.65rem] tracking-[0.25em] uppercase text-smoke">
        <div className="w-24 shrink-0">Piece</div>
        <div className="flex-1" />
        <div className="min-w-[100px] text-right">Qty</div>
        <div className="hidden md:block min-w-[100px] text-right">Price</div>
        <div className="min-w-[120px] text-right">Total</div>
      </div>

      <div>
        {items
          ? items
              .sort((a, b) =>
                (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
              )
              .map((item) => (
                <Item
                  key={item.id}
                  item={item}
                  currencyCode={cart?.currency_code}
                />
              ))
          : repeat(5).map((i) => <SkeletonLineItem key={i} />)}
      </div>
    </div>
  )
}

export default ItemsTemplate
