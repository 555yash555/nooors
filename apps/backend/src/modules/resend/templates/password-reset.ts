import { renderLayout } from "./layout"

export function passwordResetEmail(
  resetUrl: string,
  isAdmin: boolean
): { subject: string; html: string } {
  const bodyHtml = `
    <p>We received a request to reset the password for your ${
      isAdmin ? "Elora admin" : "Elora"
    } account.</p>
    <p>If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
    <p style="margin-top:20px; font-size:13px; color:#8b857a;">This link expires shortly for your security.</p>
  `

  return {
    subject: "Reset your Elora password",
    html: renderLayout({
      preheader: "Reset your Elora password.",
      heading: "Reset your password",
      bodyHtml,
      ctaLabel: "Reset password",
      ctaUrl: resetUrl,
    }),
  }
}
