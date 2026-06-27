# NOOORS — Deployment

Free-tier stack:

| Layer | Service | Cost |
|---|---|---|
| Storefront | Vercel Hobby | $0 |
| Medusa backend | Render free | $0 |
| PostgreSQL | Neon free | $0 |
| Images | Cloudflare R2 (or backend `static/`) | $0 |
| Domain | `*.vercel.app` (free) | $0 |

Total: **$0/mo** for demo. Backend cold-starts after 15 min idle on Render free; pair with UptimeRobot (free) HTTP monitor every 14 min to keep awake.

## 1) Database — Neon (5 min)

1. https://neon.tech → sign up → create project
2. Copy the **connection string** (looks like `postgres://user:pass@ep-xxx.aws.neon.tech/neondb`)

## 2) Backend — Render (10 min)

1. https://render.com → New → Web Service → connect this GitHub repo
2. Settings:
   - **Root Directory**: `apps/backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free
3. Environment variables:
   ```
   DATABASE_URL=<neon connection string>
   JWT_SECRET=<openssl rand -base64 32>
   COOKIE_SECRET=<openssl rand -base64 32>
   STORE_CORS=https://nooors-storefront.vercel.app
   ADMIN_CORS=https://<your-render-url>.onrender.com
   AUTH_CORS=https://nooors-storefront.vercel.app,https://<your-render-url>.onrender.com
   MEDUSA_BACKEND_URL=https://<your-render-url>.onrender.com
   ```
4. Deploy (5-10 min build)

### After first deploy

In Render → Shell:
```bash
# Migrate
npx medusa db:migrate

# Create admin user
npx medusa user -e you@email.com -p yourpassword

# Seed catalog (India + INR + 6 NOOORS products)
npx medusa exec ./src/scripts/switch-to-india.ts
```

Then open `https://<render-url>.onrender.com/app`, sign in, create a publishable API key, link it to the default sales channel. Copy that key.

## 3) Storefront — Vercel (5 min)

1. https://vercel.com → Add New Project → import this GitHub repo
2. Settings:
   - **Root Directory**: `apps/storefront`
   - **Framework Preset**: Next.js (auto-detected)
3. Environment variables:
   ```
   NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://<render-url>.onrender.com
   NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<from admin>
   NEXT_PUBLIC_DEFAULT_REGION=in
   NEXT_PUBLIC_BASE_URL=https://nooors-storefront.vercel.app
   ```
4. Deploy

## 4) Keep backend awake — UptimeRobot (2 min)

1. https://uptimerobot.com → new monitor → HTTP(s) → URL = `https://<render-url>.onrender.com/health` → 14 min interval.

## 5) Verify

- Visit Vercel URL → home loads
- `/in/store` → 6 NOOORS products with INR prices
- Add to bag → checkout → place order → admin shows order

## When to upgrade

| Trigger | Move to | Cost |
|---|---|---|
| No cold-start needed | Render Starter | $7/mo |
| > 0.5 GB DB | Neon Launch | $19/mo |
| Custom domain | Already free on Vercel | $0 |
| Razorpay live | Add plugin + keys | $0 setup, ~2% per txn |
