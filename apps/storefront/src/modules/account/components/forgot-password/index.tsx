import { requestPasswordReset } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(requestPasswordReset, null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="forgot-password-page"
    >
      <span className="section-label mb-6">Account Recovery</span>
      <h1
        className="font-serif font-light text-ink mb-6"
        style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
      >
        Forgot password?
      </h1>
      <p className="text-center font-serif italic font-light text-smoke mb-8">
        Enter your email and we'll send you a link to reset your password.
      </p>

      {message?.state === "success" ? (
        <div
          className="w-full mb-6 text-center text-base-regular text-ui-fg-base bg-ui-bg-subtle border border-ui-border-base rounded-rounded p-4"
          data-testid="forgot-password-success-message"
        >
          If an account exists for that email, a reset link is on its way.
        </div>
      ) : (
        <form className="w-full" action={formAction}>
          <div className="flex flex-col w-full gap-y-2">
            <Input
              label="Email"
              name="email"
              type="email"
              title="Enter a valid email address."
              autoComplete="email"
              required
              data-testid="forgot-password-email-input"
            />
          </div>
          <SubmitButton
            data-testid="forgot-password-submit-button"
            className="w-full mt-6"
          >
            Send reset link
          </SubmitButton>
        </form>
      )}

      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
          data-testid="back-to-sign-in-button"
        >
          Back to sign in
        </button>
      </span>
    </div>
  )
}

export default ForgotPassword
