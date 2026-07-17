import LoginTemplate from "@modules/account/templates/login-template"

// The @login parallel slot only has a page for the bare /account path.
// Without this default, a direct/hard navigation to any nested account
// route (e.g. /account/orders from an email link) 404s, since Next.js
// requires every parallel slot to resolve on a fresh page load — even
// though the dashboard/login layout only ever renders one of them.
export default function LoginDefault() {
  return <LoginTemplate />
}
