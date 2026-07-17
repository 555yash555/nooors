"use client"

import { useActionState } from "react"
import { useSearchParams } from "next/navigation"
import { resetPassword } from "@lib/data/customer"
import { Button } from "@modules/common/components/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const ResetPassword = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [message, formAction] = useActionState(resetPassword, null)

  if (!token) {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center text-center gap-y-4"
        data-testid="reset-password-page"
      >
        <span className="section-label mb-2">Account Recovery</span>
        <h1
          className="font-serif font-light text-ink"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          Invalid link
        </h1>
        <p className="font-serif italic font-light text-smoke">
          This reset link is missing its token. Request a new one from the
          sign-in page.
        </p>
        <LocalizedClientLink href="/account">
          <Button variant="secondary">Go to sign in</Button>
        </LocalizedClientLink>
      </div>
    )
  }

  if (message?.state === "success") {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center text-center gap-y-4"
        data-testid="reset-password-success"
      >
        <span className="section-label mb-2">Account Recovery</span>
        <h1
          className="font-serif font-light text-ink"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          Password updated
        </h1>
        <p className="font-serif italic font-light text-smoke">
          Your password has been reset. You can now sign in with your new
          password.
        </p>
        <LocalizedClientLink href="/account">
          <Button variant="primary">Go to sign in</Button>
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="reset-password-page"
    >
      <span className="section-label mb-6">Account Recovery</span>
      <h1
        className="font-serif font-light text-ink mb-6"
        style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
      >
        Set a new password
      </h1>
      <form className="w-full" action={formAction}>
        <input type="hidden" name="token" value={token} />
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="New password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            data-testid="reset-password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="reset-password-error-message"
        />
        <SubmitButton data-testid="reset-password-submit-button" className="w-full mt-6">
          Reset password
        </SubmitButton>
      </form>
    </div>
  )
}

export default ResetPassword
