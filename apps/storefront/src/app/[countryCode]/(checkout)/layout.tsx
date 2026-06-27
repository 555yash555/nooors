import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-bone relative min-h-screen">
      {/* Minimal Elora checkout header */}
      <div className="h-20 border-b border-gold/15 bg-ivory/80 backdrop-blur-sm sticky top-0 z-30">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="flex items-center gap-2 text-[0.7rem] tracking-[0.25em] uppercase text-smoke hover:text-ink transition-colors"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={14} />
            <span className="hidden small:inline">Back to bag</span>
            <span className="small:hidden">Back</span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="flex flex-col items-center leading-none"
            data-testid="store-link"
          >
            <span className="font-script text-[2rem] leading-[0.85] text-ink">
              elora
            </span>
            <span className="text-[0.5rem] tracking-[0.4em] uppercase text-smoke mt-0.5">
              by Harnoor
            </span>
          </LocalizedClientLink>
          {/* Spacer so logo stays centered */}
          <span className="w-[80px]" aria-hidden="true" />
        </nav>
      </div>

      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
    </div>
  )
}
