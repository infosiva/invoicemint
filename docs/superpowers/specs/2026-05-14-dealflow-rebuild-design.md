# DealFlow Rebuild Design Spec
**Date:** 2026-05-14

## Overview

Rebuild DealFlow/InvoiceMint as the only invoice platform that is **voice-first, dead simple for beginners, and fully powerful for pros**. Three independent sub-projects, each shippable standalone.

**Core differentiator:** No competitor combines voice-first invoice creation + real-time vendor-client scope agreement + dispute-proof milestone trail. We own all three.

---

## Market Gap Analysis

| Tool | Strength | Missing |
|------|----------|---------|
| FreshBooks | Clean UI, time tracking | No client collaboration |
| HoneyBook | Client portals, proposals | No voice, $36/mo, US-centric |
| Bonsai | Contracts + invoices | No client-side workspace |
| Wave | Free invoicing | No AI, no voice, no collaboration |
| Dubsado | Workflows + scheduling | Steep learning curve |

**What none offer:** Voice-first invoice creation + shared vendor-client workspace + scope locking.

---

## Sub-project 1: Voice Invoice Creator (`/create`)

### Goal
Anyone — guest or logged-in user — can speak or type an invoice into existence in under 30 seconds and send a payment link.

### User Flow
1. Land on `/create` — mic button front and center, text input below
2. Speak or type: *"Charge Sarah $2,500 for logo design, 3 revisions included, due in 2 weeks"*
3. Groq `llama-3.3-70b` parses into structured invoice: client name, line items, amounts, due date
4. Editable preview card appears — user tweaks anything
5. One click → Stripe Payment Link generated + PDF download available
6. Guest mode: no account required. Email captured at send step as freemium gate.

### Voice Parsing Examples (must handle all)
- `"Charge Mark $3k for 3 weeks of dev work, 20% deposit due now"` → 2 line items + deposit milestone
- `"4 days at $800/day, minus 10% discount"` → qty + unit price + discount row
- `"Website redesign $5000, 50% upfront, 50% on launch"` → 2 milestones

### Components
- `app/create/page.tsx` — main page (client component)
- `app/create/VoiceInput.tsx` — Web Speech API wrapper, mic button, transcript state
- `app/create/InvoiceParser.ts` — calls Groq API, returns structured `ParsedInvoice` type
- `app/create/InvoiceEditor.tsx` — editable line items + totals card
- `app/api/parse-invoice/route.ts` — server-side Groq call (keeps API key safe)
- `app/api/stripe/payment-link/route.ts` — creates Stripe Payment Link, returns URL

### ParsedInvoice type
```typescript
type ParsedInvoice = {
  clientName: string
  clientEmail: string
  lineItems: { description: string; qty: number; unitPrice: number }[]
  discount?: { type: 'percent' | 'fixed'; value: number }
  dueDate: string // ISO
  notes?: string
  milestones?: { label: string; percent: number }[]
}
```

### Freemium gate
- Create + preview: free, no account
- Send payment link: requires email (captured inline, no password — magic link sent)
- Track payment status: requires full account (nudge shown after send)

### Tech
- Voice: `window.SpeechRecognition` (Web Speech API, browser-native, free)
- Parsing: Groq `llama-3.3-70b-versatile` (free tier, fast)
- PDF: existing `InvoicePDF` + `@react-pdf/renderer`
- Payment: Stripe Payment Links API (`stripe.paymentLinks.create`)

---

## Sub-project 2: Simplified Deal Flow Wizard

### Goal
Replace the tab-based deal UI with a guided 4-step wizard. First-timers are hand-held. Power users can toggle full detail mode. Voice input available at every step.

### Wizard Steps

**Step 1 — Job details**
- Fields: title, client email, brief description
- Voice: *"Website redesign for Mark at Acme Corp"* → auto-fills all three fields
- Validation: client email required before advancing

**Step 2 — Scope**
- Simple mode (default): Description + Total only (hides qty/unit price)
- Power mode: full table with qty, unit price, subtotal
- AI assist button: *"Add 3 rounds of revisions at $500 each"* → appends row(s)
- Voice: mic on every row's description field
- Toggle remembered per user in localStorage

**Step 3 — Milestones**
- Prompted question: *"When do you want to get paid?"*
- Quick options: Single payment / 50-50 split / Custom
- Voice: *"Half upfront, half on delivery"* → creates 2 milestones automatically
- Custom: add milestone manually with name + percent + due date

**Step 4 — Send to client**
- Preview of what client will see (read-only client portal preview)
- Status: DRAFT → PENDING_CLIENT on send
- Action: "Send & request approval" → emails client with `/client/[token]` link

### Components
- `app/deal/new/page.tsx` — replaced with wizard shell
- `app/deal/new/WizardStep1.tsx` — job details
- `app/deal/new/WizardStep2.tsx` — scope with AI assist
- `app/deal/new/WizardStep3.tsx` — milestones
- `app/deal/new/WizardStep4.tsx` — preview + send
- `app/deal/new/WizardProgress.tsx` — progress bar (step 1/4 indicator)
- `app/api/scope-assist/route.ts` — Groq call to parse scope description into line items

### Simple/Power toggle
- Default: Simple (qty + unit price hidden, total only)
- Power: full table
- Stored in `localStorage('dealflow_mode')` — persists across sessions
- Toggle button top-right of Step 2

### Voice at every step
- Each text input has a mic icon button
- Clicking starts Web Speech recognition, fills that field only
- Step-level "voice fill all" button on Step 1: fills title + email + description from one utterance

---

## Sub-project 3: Client Portal Redesign

### Goal
Client receives a link, lands on a single-purpose page: "Here's what you're paying for — approve it and pay." No navigation, no account, no confusion.

### Page Layout (top to bottom)

1. **Hero summary** — vendor name + logo (if set), job title, total amount, due date. Clean, above the fold.

2. **What's included** — scope items as plain English list. No "qty × unit price" table. Format: *"Logo design — $1,200"*

3. **Milestone timeline** — visual stepper: *"Pay $1,000 now → Pay $1,000 on delivery"*. Not a data table.

4. **Primary CTA** — "Approve & Pay $X →" (deposit amount if milestone, total if single). Stripe embedded checkout (no redirect).

5. **Message thread** — collapsed below the fold. Client can ask questions inline. Vendor gets notified.

### Key decisions
- No account ever required for client. Token in URL is the session credential.
- "Approve scope" and "pay deposit" are the **same button** — removes two-step friction.
- Stripe embedded checkout (`stripe.confirmPayment`) — client never leaves the page.
- Mobile-first layout — majority of clients open links on phone.
- If client has already approved + paid, page shows deal status tracker instead of CTA.

### Components
- `app/client/[token]/page.tsx` — full rebuild (currently minimal)
- `app/client/[token]/ClientPayment.tsx` — Stripe Elements embedded checkout (client component)
- `app/client/[token]/MessageThread.tsx` — collapsible thread
- `app/api/client/[token]/approve/route.ts` — sets deal status to SCOPE_AGREED
- `app/api/client/[token]/message/route.ts` — adds message to thread

---

## Build Order

1. **Sub-project 1** (Voice Invoice Creator) — standalone, no DB changes, ships fastest. Acquisition hook.
2. **Sub-project 3** (Client Portal) — improves existing flow immediately, high conversion impact.
3. **Sub-project 2** (Deal Wizard) — biggest rebuild, but foundation (DB schema) unchanged.

## Schema changes required
- None for Sub-project 1 (guest invoices not persisted initially)
- None for Sub-project 3 (uses existing deal + message schema)
- Sub-project 2: add `wizardStep` field to Deal (optional, for resume-wizard UX) — `Int? @default(1)`

## Env vars needed
- `GROQ_API_KEY` — already set (voice parsing + scope assist)
- `STRIPE_SECRET_KEY` — already set
- `STRIPE_PUBLISHABLE_KEY` — needed client-side for Stripe Elements (add to Vercel env)
- `RESEND_API_KEY` — already set (client notification emails)
