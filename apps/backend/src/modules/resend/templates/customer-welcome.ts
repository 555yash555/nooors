import { renderLayout } from "./layout"

export function customerWelcomeEmail(
  firstName: string | null | undefined,
  storefrontUrl: string
): { subject: string; html: string } {
  const bodyHtml = `
    <p>${firstName ? `Dear ${firstName},` : "Welcome,"}</p>
    <p>Your account has been created. Explore the latest collection, save your favorites, and enjoy a faster checkout on your next visit.</p>
  `

  return {
    subject: "Welcome to Elora by Harnoor",
    html: renderLayout({
      preheader: "Welcome to Elora by Harnoor.",
      heading: "Welcome to Elora",
      bodyHtml,
      ctaLabel: "Start shopping",
      ctaUrl: storefrontUrl,
    }),
  }
}
