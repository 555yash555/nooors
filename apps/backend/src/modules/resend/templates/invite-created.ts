import { renderLayout } from "./layout"

export function inviteCreatedEmail(
  acceptUrl: string
): { subject: string; html: string } {
  const bodyHtml = `
    <p>You've been invited to join the Elora admin team.</p>
    <p>Accept the invitation below to set your password and get access to the dashboard.</p>
    <p style="margin-top:20px; font-size:13px; color:#8b857a;">This link expires shortly for your security.</p>
  `

  return {
    subject: "You've been invited to Elora Admin",
    html: renderLayout({
      preheader: "You've been invited to join the Elora admin team.",
      heading: "You're invited",
      bodyHtml,
      ctaLabel: "Accept invitation",
      ctaUrl: acceptUrl,
    }),
  }
}
