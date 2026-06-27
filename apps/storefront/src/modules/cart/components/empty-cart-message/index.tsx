import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Ornament } from "@modules/common/components/noors"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-24 px-2 flex flex-col items-center text-center max-w-xl mx-auto"
      data-testid="empty-cart-message"
    >
      <span className="section-label">An Empty Bag</span>
      <h2
        className="font-serif font-light text-ink mt-6"
        style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}
      >
        Nothing chosen, yet.
      </h2>
      <Ornament />
      <p className="font-serif italic font-light text-smoke leading-[1.7]">
        Begin curating the season. Each piece is conceived in our Parisian
        atelier — discover the new collection.
      </p>
      <LocalizedClientLink href="/store" className="btn btn--outline mt-8">
        Explore Collection
      </LocalizedClientLink>
    </div>
  )
}

export default EmptyCartMessage
