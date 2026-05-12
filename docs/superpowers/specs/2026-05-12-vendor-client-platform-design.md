# Vendor-Client Platform — Design Spec
**Date:** 2026-05-12
**Project:** invoice-ai (InvoiceMint → rebrand to platform)
**Status:** Approved for implementation

---

## Problem

Xero and FreshBooks start at the invoice. The dispute always happens before the invoice — scope creep, unclear deliverables, "that wasn't included." By the time someone clicks "pay invoice," trust is already broken. No existing tool covers the full Lead → Scope → Milestone → Invoice → Payment loop with both sides on the same platform.

---

## Solution

A unified vendor-client platform where both parties share one deal workspace. AI drafts proposals. Both sides sign scope. Milestones have proof uploads. Change orders are auto-generated. WhatsApp notifications keep both sides in sync. Invoice generates from approved milestones. Stripe handles payment.

---

## Users

| Role | Description |
|------|-------------|
| Vendor | Freelancer, agency, contractor, service provider. Creates deals, invites clients. |
| Client | Any buyer. Invited via email link. Creates account on first accept. |

Both roles use magic link email auth (no passwords). Both can use any industry — design, construction, software, consulting, home services, etc.

---

## Deal Lifecycle

```
Draft → Proposal Sent → Scope Agreed → In Progress → Invoice Sent → Paid
                                                                  ↓
                                                             Disputed (evidence trail shown)
```

---

## Architecture

**Stack:** Next.js 15 App Router, Postgres (Vercel Neon), Prisma ORM, Stripe, Twilio WhatsApp API, AI fallback chain (Groq → Gemini → Anthropic).

**Auth:** Magic link email (Resend). Both vendor and client use same auth system. No OAuth.

### Routes

```
/                       — marketing landing page
/login                  — magic link login (vendor + client)
/dashboard              — vendor home: all deals, stats
/deal/new               — create new deal
/deal/[id]              — deal workspace (vendor + client both land here)
/deal/[id]/scope        — scope / proposal tab
/deal/[id]/milestones   — milestone tracker
/deal/[id]/invoice      — invoice + payment link
/deal/[id]/messages     — threaded deal comms
/client/[token]         — client invite landing (onboarding)
/settings               — vendor profile, WhatsApp opt-in, branding
```

---

## Data Model

```sql
users
  id, email, name, role (vendor|client), wa_number, created_at

deals
  id, vendor_id, client_id, title, description, status
  (draft|proposal_sent|scope_agreed|in_progress|invoice_sent|paid|disputed)
  created_at, updated_at

scope_items
  id, deal_id, description, quantity, unit_price, total
  approved_at, approved_by (user_id)

milestones
  id, deal_id, title, description, due_date
  status (pending|vendor_complete|client_approved|rejected)
  proof_url, proof_note, completed_at, approved_at

change_orders
  id, deal_id, description, extra_amount
  requested_by (user_id), approved_at, approved_by

invoices
  id, deal_id, invoice_number, total, tax_amount
  stripe_payment_link, stripe_session_id
  sent_at, paid_at, due_date

messages
  id, deal_id, sender_id, body, attachment_url, created_at

invite_tokens
  id, deal_id, email, token, accepted_at, expires_at
```

---

## Feature Breakdown

### 1. Lead Capture & Deal Creation
- Vendor creates deal: title, client email, brief description
- AI drafts initial proposal from brief (Groq first, fallback chain)
- System sends invite email to client with magic link

### 2. Scope Agreement
- Vendor adds line items (description, qty, unit price)
- AI can draft scope from voice or text description
- Client reviews scope items, can comment per item or approve all
- Both parties see "Scope Agreed" status once approved
- Scope is locked after agreement — changes go through Change Orders

### 3. Change Orders
- Either party can raise a change order (extra work, price adjustment)
- Other party must approve before scope updates
- All change orders stored — form the dispute evidence trail

### 4. Milestone Tracking
- Vendor creates milestones with due dates
- Vendor marks complete + uploads proof (photo, file, URL)
- Client approves or rejects each milestone with note
- Invoice unlocks only when milestones are approved (configurable: all or partial)

### 5. Threaded Deal Communications
- Per-deal message thread visible to both parties
- Messages can reference a milestone or scope item
- Attachment support (file upload to Vercel Blob)
- No email chains — all negotiation in platform

### 6. Invoice & Payment
- Invoice auto-generates from approved scope items + milestones
- Vendor can add/edit line items before sending
- Stripe payment link generated per invoice
- Partial payment support (deposit + balance)
- Client pays inline — no Stripe account needed client-side

### 7. WhatsApp Notifications (Twilio)
- Vendor opt-in in settings (wa_number required)
- Client opt-in when accepting invite
- Triggers:
  - Client approves scope → vendor WA alert
  - Milestone approved → vendor WA alert
  - Invoice paid → vendor WA alert
  - New message → both parties WA alert (if opted in)
  - Payment overdue → client WA reminder

### 8. Dispute Resolution
- If client disputes invoice, platform shows:
  - Signed scope (approval timestamp + approver)
  - Approved milestones with proof uploads
  - Full change order history
  - Full message thread
- Evidence is immutable — cannot be deleted after scope is agreed

### 9. AI Features
- Proposal drafting from brief or voice
- Scope line item suggestion from proposal text
- Payment terms auto-suggest based on deal size + client type
- Late payment reminder copy generation

---

## Unique Differentiators vs Xero / FreshBooks

| Feature | Xero | FreshBooks | This platform |
|---------|------|-----------|---------------|
| Scope agreement (both sign) | ❌ | ❌ | ✅ |
| Milestone proof upload | ❌ | ❌ | ✅ |
| Change order tracking | ❌ | ❌ | ✅ |
| Per-deal threaded comms | ❌ | basic | ✅ |
| WhatsApp notifications | ❌ | ❌ | ✅ Twilio |
| Client portal (magic link) | ❌ | ❌ | ✅ |
| AI proposal drafting | ❌ | ❌ | ✅ |
| Dispute evidence trail | ❌ | ❌ | ✅ immutable |
| Invoice from milestones | ❌ | ❌ | ✅ |

---

## Error Handling

- Auth failures: magic link expired → resend flow
- Stripe webhook failures: idempotent processing, retry queue
- WhatsApp delivery failure: silent fail, log to db, no user-facing error
- AI generation failure: fallback chain, then graceful "try again" UI
- File upload failure: Vercel Blob error → user notified, upload retried client-side

---

## Freemium Model

| Tier | Limit |
|------|-------|
| Free | 3 active deals, 1 milestone proof per deal, no WhatsApp |
| Pro ($12/mo) | Unlimited deals, milestones, WhatsApp, custom branding on invoice |

---

## Out of Scope (v1)

- Multi-user vendor teams (one vendor per account)
- Recurring invoices / subscriptions
- Tax calculation / accounting integrations
- Mobile app (web-responsive only)
- In-app video calls

---

## Implementation Order

1. Auth (magic link, both roles)
2. Deal CRUD + invite flow
3. Scope items + approval
4. Milestones + proof upload
5. Threaded messages
6. Invoice generation + Stripe payment link
7. WhatsApp notifications (Twilio)
8. Dispute evidence view
9. AI proposal drafting
10. Freemium gate + Stripe subscription
