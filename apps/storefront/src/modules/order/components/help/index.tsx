import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Help = () => {
  return (
    <div className="max-w-xl mx-auto">
      <span className="text-[0.6rem] tracking-[0.3em] uppercase text-gold">
        Atelier Services
      </span>
      <h3 className="font-serif font-light text-ink text-2xl mt-3">
        Need a hand?
      </h3>
      <p className="font-serif italic font-light text-smoke mt-2 mb-6 leading-relaxed">
        Our client services team in Paris is available for sizing,
        alterations, and bespoke requests.
      </p>
      <div className="flex items-center justify-center gap-6 text-[0.7rem] tracking-[0.25em] uppercase">
        <LocalizedClientLink
          href="/contact"
          className="text-ink hover:text-gold transition-colors border-b border-gold pb-1"
        >
          Contact Atelier
        </LocalizedClientLink>
        <LocalizedClientLink
          href="/contact"
          className="text-ink hover:text-gold transition-colors border-b border-gold pb-1"
        >
          Returns & Exchanges
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default Help
