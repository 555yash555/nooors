import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="py-20 pt-32">
      <div className="content-container" data-testid="cart-container">
        <div className="text-center mb-16">
          <span className="section-label">Your Selection</span>
          <h1
            className="font-serif font-light text-ink mt-6"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              letterSpacing: "-0.02em",
            }}
          >
            The Bag
          </h1>
        </div>

        {cart?.items?.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-20">
            <div className="flex flex-col gap-y-6">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate cart={cart} />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 lg:sticky lg:top-32">
                {cart && cart.region && (
                  <div className="bg-cream/40 border border-gold/20 p-8">
                    <Summary cart={cart} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <EmptyCartMessage />
        )}
      </div>
    </div>
  )
}

export default CartTemplate
