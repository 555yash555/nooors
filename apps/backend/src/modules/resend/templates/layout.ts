const COLORS = {
  ivory: "#fbf8f3",
  bone: "#f4f0ea",
  cream: "#ede6da",
  ink: "#1a1814",
  smoke: "#6b655c",
  gold: "#b89968",
  footer: "#0f0e0b",
}

const SERIF = "Georgia, 'Times New Roman', serif"
const SANS =
  "'Helvetica Neue', Helvetica, Arial, -apple-system, BlinkMacSystemFont, sans-serif"

type LayoutOptions = {
  preheader: string
  heading: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
}

export function renderLayout({
  preheader,
  heading,
  bodyHtml,
  ctaLabel,
  ctaUrl,
}: LayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Elora by Harnoor</title>
</head>
<body style="margin:0; padding:0; background-color:${COLORS.bone}; font-family:${SANS};">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bone}; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px; background-color:${COLORS.ivory}; border:1px solid ${COLORS.cream};">
          <tr>
            <td style="padding:36px 40px 24px; text-align:center; border-bottom:1px solid ${COLORS.cream};">
              <div style="font-family:${SERIF}; font-style:italic; font-size:28px; color:${COLORS.ink}; letter-spacing:0.5px;">elora</div>
              <div style="font-family:${SANS}; font-size:10px; letter-spacing:3px; color:${COLORS.gold}; text-transform:uppercase; margin-top:4px;">By Harnoor</div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="font-family:${SERIF}; font-weight:400; font-size:26px; color:${COLORS.ink}; margin:0 0 20px;">${heading}</h1>
              <div style="font-family:${SANS}; font-size:15px; line-height:1.6; color:${COLORS.smoke};">
                ${bodyHtml}
              </div>
              ${
                ctaLabel && ctaUrl
                  ? `<div style="margin-top:32px;">
                <a href="${ctaUrl}" style="display:inline-block; background-color:${COLORS.ink}; color:${COLORS.ivory}; text-decoration:none; font-family:${SANS}; font-size:12px; letter-spacing:2px; text-transform:uppercase; padding:14px 32px;">${ctaLabel}</a>
              </div>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="background-color:${COLORS.footer}; padding:28px 40px; text-align:center;">
              <div style="font-family:${SERIF}; font-style:italic; font-size:16px; color:${COLORS.gold};">elora by harnoor</div>
              <div style="font-family:${SANS}; font-size:11px; color:#8b857a; margin-top:8px;">This is an automated message — please do not reply directly to this email.</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function formatMoney(amount: unknown, currencyCode: string): string {
  // Medusa's computed money fields (order.total, item.total, ...) are
  // BigNumberValue — sometimes a plain number, sometimes a BigNumber-like
  // object. Number(...) handles both instead of silently producing NaN.
  const numericAmount = Number(amount ?? 0)

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(Number.isFinite(numericAmount) ? numericAmount : 0)
}
