# invoicemint

InvoiceMint — Free AI Invoice & Quote Generator with voice input and PDF export

## Tech stack
Next.js, React, TypeScript, Tailwind CSS, Stripe, Prisma

## Run locally
```bash
git clone https://github.com/infosiva/invoicemint.git && cd invoicemint
npm install
cp .env.example .env.local   # names only, fill in your own values
npm run dev                    # http://localhost:3000
```

## Scripts
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Environment variables
Names only; never commit real values. Everything is optional unless the feature needs it.

**AI providers (free-first chain; any one is enough):** `GEMINI_API_KEY`, `GROQ_API_KEY`

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL`
- `DATABASE_URL`
- `GEMINI_MODEL`
- `GNEWS_API_KEY`
- `GROQ_MODEL`
- `NEXT_PUBLIC_ADSENSE_ID`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `PROMO_CODES`
- `RESEND_API_KEY`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Deploy
Vercel (`vercel --prod`). Set the variables above in the project settings.

## Status & open items
See `HANDOFF.md` if present; otherwise open an issue.
