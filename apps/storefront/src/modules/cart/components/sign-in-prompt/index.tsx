import { Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="flex items-center justify-between gap-6 py-6 border-y border-gold/15">
      <div>
        <h2 className="font-serif font-light text-ink text-xl">
          Already a Elora client?
        </h2>
        <p className="font-serif italic font-light text-smoke mt-1 text-sm">
          Sign in for faster checkout and your wardrobe history.
        </p>
      </div>
      <LocalizedClientLink href="/account">
        <Button
          variant="secondary"
          data-testid="sign-in-button"
          className="shrink-0"
        >
          Sign In
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default SignInPrompt
