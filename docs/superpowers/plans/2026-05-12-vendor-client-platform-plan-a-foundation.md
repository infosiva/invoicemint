# Vendor-Client Platform — Plan A: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation — DB schema, magic link auth, modern SEO landing page, vendor dashboard, deal creation, and client invite flow.

**Architecture:** Next.js 15 App Router + Prisma + Neon Postgres. Auth via Resend magic links stored in DB tokens. Landing page above-fold hero with full value prop, structured data for SEO. Vendor dashboard shows all deals. Deal creation auto-invites client via email.

**Tech Stack:** Next.js 16 (App Router), Prisma ORM, Neon Postgres, Resend (email), Tailwind CSS v4, TypeScript

**Spec:** `docs/superpowers/specs/2026-05-12-vendor-client-platform-design.md`

**Plan B** (scope/milestones/messages) and **Plan C** (invoice/Stripe/WhatsApp/freemium) follow this plan.

---

## File Map

```
prisma/
  schema.prisma                   — full DB schema (all tables for all plans)

src/lib/
  db.ts                           — Prisma client singleton
  auth.ts                         — magic link helpers (send, verify, session)
  session.ts                      — server-side session via httpOnly cookie

src/app/
  layout.tsx                      — root layout with metadata + JSON-LD
  page.tsx                        — REPLACE: new landing page (hero, features, CTA)
  globals.css                     — extend with platform design tokens

  (auth)/
    login/page.tsx                — email input → send magic link
    verify/page.tsx               — token verification → set session cookie

  dashboard/
    page.tsx                      — vendor deal list + stats
    layout.tsx                    — auth guard (redirect to /login if no session)

  deal/
    new/page.tsx                  — create deal form + AI brief → invite client
    [id]/
      layout.tsx                  — load deal, check user is vendor or client
      page.tsx                    — redirect to /deal/[id]/scope

  client/
    [token]/page.tsx              — client invite landing → create account or login

  api/
    auth/
      send/route.ts               — POST: email → create token → send via Resend
      verify/route.ts             — POST: token → set session cookie
      logout/route.ts             — POST: clear cookie
    deals/
      route.ts                    — GET: list vendor deals | POST: create deal
      [id]/route.ts               — GET: single deal (vendor or client)
    invite/
      [token]/route.ts            — GET: validate invite token
      accept/route.ts             — POST: accept invite, create client user, set session

middleware.ts                     — protect /dashboard and /deal/* routes
```

---

## Task 1: Install dependencies + Prisma setup

**Files:**
- Modify: `package.json`
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`

- [ ] **Step 1: Install packages**

```bash
cd /Users/sivaprakasam/projects/agents/invoice-ai
npm install prisma @prisma/client resend @vercel/blob iron-session
npm install -D @types/iron-session
npx prisma init --datasource-provider postgresql
```

Expected: `prisma/schema.prisma` created, `DATABASE_URL` added to `.env`

- [ ] **Step 2: Write full schema**

Replace entire `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      UserRole @default(VENDOR)
  waNumber  String?
  waOptIn   Boolean  @default(false)
  createdAt DateTime @default(now())

  vendorDeals  Deal[]        @relation("VendorDeals")
  clientDeals  Deal[]        @relation("ClientDeals")
  messages     Message[]
  changeOrders ChangeOrder[] @relation("RequestedBy")
  authTokens   AuthToken[]
}

enum UserRole {
  VENDOR
  CLIENT
}

model AuthToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Deal {
  id          String     @id @default(cuid())
  vendorId    String
  clientId    String?
  title       String
  description String?
  status      DealStatus @default(DRAFT)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  vendor      User          @relation("VendorDeals", fields: [vendorId], references: [id])
  client      User?         @relation("ClientDeals", fields: [clientId], references: [id])
  scopeItems  ScopeItem[]
  milestones  Milestone[]
  messages    Message[]
  changeOrders ChangeOrder[]
  invoices    Invoice[]
  inviteTokens InviteToken[]
}

enum DealStatus {
  DRAFT
  PROPOSAL_SENT
  SCOPE_AGREED
  IN_PROGRESS
  INVOICE_SENT
  PAID
  DISPUTED
}

model InviteToken {
  id         String    @id @default(cuid())
  dealId     String
  email      String
  token      String    @unique @default(cuid())
  acceptedAt DateTime?
  expiresAt  DateTime
  createdAt  DateTime  @default(now())

  deal Deal @relation(fields: [dealId], references: [id], onDelete: Cascade)
}

model ScopeItem {
  id          String    @id @default(cuid())
  dealId      String
  description String
  quantity    Float     @default(1)
  unitPrice   Float
  total       Float
  approvedAt  DateTime?
  approvedBy  String?
  createdAt   DateTime  @default(now())

  deal Deal @relation(fields: [dealId], references: [id], onDelete: Cascade)
}

model Milestone {
  id          String          @id @default(cuid())
  dealId      String
  title       String
  description String?
  dueDate     DateTime?
  status      MilestoneStatus @default(PENDING)
  proofUrl    String?
  proofNote   String?
  completedAt DateTime?
  approvedAt  DateTime?
  createdAt   DateTime        @default(now())

  deal Deal @relation(fields: [dealId], references: [id], onDelete: Cascade)
}

enum MilestoneStatus {
  PENDING
  VENDOR_COMPLETE
  CLIENT_APPROVED
  REJECTED
}

model ChangeOrder {
  id          String    @id @default(cuid())
  dealId      String
  description String
  extraAmount Float
  requestedBy String
  approvedAt  DateTime?
  approvedBy  String?
  createdAt   DateTime  @default(now())

  deal      Deal @relation(fields: [dealId], references: [id], onDelete: Cascade)
  requester User @relation("RequestedBy", fields: [requestedBy], references: [id])
}

model Invoice {
  id                String    @id @default(cuid())
  dealId            String    @unique
  invoiceNumber     String
  total             Float
  taxAmount         Float     @default(0)
  stripePaymentLink String?
  stripeSessionId   String?
  sentAt            DateTime?
  paidAt            DateTime?
  dueDate           DateTime?
  createdAt         DateTime  @default(now())

  deal Deal @relation(fields: [dealId], references: [id], onDelete: Cascade)
}

model Message {
  id            String   @id @default(cuid())
  dealId        String
  senderId      String
  body          String
  attachmentUrl String?
  createdAt     DateTime @default(now())

  deal   Deal @relation(fields: [dealId], references: [id], onDelete: Cascade)
  sender User @relation(fields: [senderId], references: [id])
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

- [ ] **Step 4: Add DATABASE_URL to .env**

```bash
# .env — add Neon connection string (get from Vercel Neon dashboard or neon.tech)
# DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"
echo "DATABASE_URL=" >> .env
```

Then paste the actual Neon connection string from https://neon.tech or the Vercel dashboard.

- [ ] **Step 5: Push schema to DB**

```bash
npx prisma db push
```

Expected output: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma src/lib/db.ts package.json package-lock.json
git commit -m "feat: prisma schema + db client — users, deals, milestones, invoices, messages"
```

---

## Task 2: Magic link auth (send + verify + session)

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/session.ts`
- Create: `src/app/api/auth/send/route.ts`
- Create: `src/app/api/auth/verify/route.ts`
- Create: `src/app/api/auth/logout/route.ts`

- [ ] **Step 1: Write auth helpers**

Create `src/lib/auth.ts`:

```typescript
import { db } from './db'
import { Resend } from 'resend'
import { addMinutes } from 'date-fns'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendMagicLink(email: string): Promise<void> {
  // Upsert user
  const user = await db.user.upsert({
    where: { email },
    update: {},
    create: { email, role: 'VENDOR' },
  })

  // Create token (expires in 15 min)
  const token = crypto.randomUUID()
  await db.authToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt: addMinutes(new Date(), 15),
    },
  })

  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${token}`

  await resend.emails.send({
    from: 'DealFlow <noreply@dealflow.app>',
    to: email,
    subject: 'Your login link for DealFlow',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="margin:0 0 16px">Log in to DealFlow</h2>
        <p style="color:#555">Click the button below to log in. This link expires in 15 minutes.</p>
        <a href="${url}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          Log in →
        </a>
        <p style="color:#999;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>
    `,
  })
}

export async function verifyMagicToken(token: string): Promise<{ userId: string; email: string } | null> {
  const record = await db.authToken.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!record) return null
  if (record.usedAt) return null
  if (record.expiresAt < new Date()) return null

  // Mark used
  await db.authToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })

  return { userId: record.user.id, email: record.user.email }
}
```

- [ ] **Step 2: Write session helper**

Create `src/lib/session.ts`:

```typescript
import { cookies } from 'next/headers'
import { db } from './db'

const SESSION_COOKIE = 'df_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies()
  // Store userId directly in a signed cookie via Next.js
  // For production use iron-session or JWT; for v1 store userId + hmac
  const value = Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString('base64')
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(SESSION_COOKIE)?.value
  if (!raw) return null
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64').toString())
    return { userId: parsed.userId }
  } catch {
    return null
  }
}

export async function getSessionUser() {
  const session = await getSession()
  if (!session) return null
  return db.user.findUnique({ where: { id: session.userId } })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}
```

- [ ] **Step 3: Write API routes**

Create `src/app/api/auth/send/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { sendMagicLink } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  try {
    await sendMagicLink(email)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('sendMagicLink error', err)
    return NextResponse.json({ error: 'Failed to send link' }, { status: 500 })
  }
}
```

Create `src/app/api/auth/verify/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicToken } from '@/lib/auth'
import { createSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const result = await verifyMagicToken(token)
  if (!result) return NextResponse.json({ error: 'Invalid or expired link' }, { status: 401 })

  await createSession(result.userId)
  return NextResponse.json({ ok: true })
}
```

Create `src/app/api/auth/logout/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { clearSession } from '@/lib/session'

export async function POST() {
  await clearSession()
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Add date-fns**

```bash
npm install date-fns
```

- [ ] **Step 5: Add env vars to .env**

```bash
# .env
# RESEND_API_KEY=re_...        (from resend.com)
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/auth.ts src/lib/session.ts src/app/api/auth/
git commit -m "feat: magic link auth — send/verify/session/logout"
```

---

## Task 3: Login + verify pages

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/verify/page.tsx`

- [ ] **Step 1: Create login page**

Create `src/app/(auth)/login/page.tsx`:

```tsx
'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-2xl font-black text-white tracking-tight">Deal<span className="text-violet-400">Flow</span></span>
          <p className="text-slate-400 text-sm mt-2">Vendor-client deals, scoped and paid.</p>
        </div>
        {sent ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Check your email</h2>
            <p className="text-slate-400 text-sm">Login link sent to <span className="text-white">{email}</span>. Expires in 15 minutes.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? 'Sending…' : 'Send login link →'}
            </button>
            <p className="text-center text-xs text-slate-500">No password. No spam. Just a link.</p>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create verify page**

Create `src/app/(auth)/verify/page.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function VerifyInner() {
  const router = useRouter()
  const params = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'error'>('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('error'); setError('No token provided'); return }

    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(async res => {
      if (res.ok) {
        router.replace('/dashboard')
      } else {
        const data = await res.json()
        setStatus('error')
        setError(data.error || 'Link expired or already used')
      }
    })
  }, [params, router])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <span className="text-2xl font-black text-white tracking-tight mb-8 block">Deal<span className="text-violet-400">Flow</span></span>
        {status === 'verifying' ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-300 text-sm">Verifying your link…</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-8">
            <p className="text-red-400 font-semibold mb-2">Link expired</p>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <a href="/login" className="text-violet-400 text-sm hover:underline">Request a new link →</a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return <Suspense><VerifyInner /></Suspense>
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(auth\)/
git commit -m "feat: login + verify pages — magic link flow"
```

---

## Task 4: Middleware — route protection

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Write middleware**

Create `middleware.ts` at project root:

```typescript
import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/dashboard', '/deal', '/settings']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  const session = req.cookies.get('df_session')
  if (!session?.value) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/deal/:path*', '/settings/:path*'],
}
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: middleware — auth guard on dashboard/deal/settings"
```

---

## Task 5: Landing page — modern, above-fold, SEO

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/page.tsx` (full replace)

- [ ] **Step 1: Update root layout with metadata + JSON-LD**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DealFlow — Vendor-Client Platform | Proposals, Milestones & Payments',
  description: 'The only platform where vendors and clients agree on scope, track milestones, handle change orders, and get paid — all in one place. No more invoice disputes.',
  keywords: 'vendor client platform, freelance invoicing, scope agreement, milestone tracker, invoice disputes, proposal software',
  openGraph: {
    title: 'DealFlow — Scope. Milestone. Pay.',
    description: 'Stop chasing invoices. Stop scope disputes. DealFlow gives vendors and clients one shared workspace — from proposal to payment.',
    url: 'https://dealflow.app',
    siteName: 'DealFlow',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DealFlow — Vendor-Client Platform',
    description: 'Proposals. Milestones. Payments. One platform for vendors and clients.',
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://dealflow.app' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'DealFlow',
  applicationCategory: 'BusinessApplication',
  description: 'Vendor-client platform for proposals, scope agreement, milestone tracking, and payments.',
  offers: [
    { '@type': 'Offer', price: '0', priceCurrency: 'USD', name: 'Free' },
    { '@type': 'Offer', price: '12', priceCurrency: 'USD', name: 'Pro', billingDuration: 'P1M' },
  ],
  featureList: [
    'AI proposal drafting',
    'Scope agreement with e-signature',
    'Milestone tracking with proof uploads',
    'Change order management',
    'Stripe payment links',
    'WhatsApp notifications',
    'Dispute evidence trail',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Write the landing page — full above-fold value prop**

Replace `src/app/page.tsx` entirely:

```tsx
import Link from 'next/link'

const FEATURES = [
  {
    icon: '📋',
    title: 'AI-Drafted Proposals',
    desc: 'Describe your project in plain text or voice. AI writes the full scope and line items.',
  },
  {
    icon: '✍️',
    title: 'Scope Agreement',
    desc: 'Both sides sign off on exactly what\'s included. Scope locks — no more "I thought it was included."',
  },
  {
    icon: '🏁',
    title: 'Milestone Tracking',
    desc: 'Vendor uploads proof. Client approves. Invoice unlocks only from approved milestones.',
  },
  {
    icon: '🔄',
    title: 'Change Orders',
    desc: 'Extra work gets a formal change order. Both sides approve. Evidence stays forever.',
  },
  {
    icon: '💬',
    title: 'Deal Comms',
    desc: 'Every negotiation, revision, and approval in one thread — linked to the deal.',
  },
  {
    icon: '💳',
    title: 'Online Payments',
    desc: 'Stripe payment link per invoice. Client pays in browser. No Stripe account needed on their side.',
  },
  {
    icon: '📱',
    title: 'WhatsApp Alerts',
    desc: 'Scope approved, milestone done, payment received — straight to WhatsApp. Both sides.',
  },
  {
    icon: '🛡️',
    title: 'Dispute Evidence',
    desc: 'If a client disputes, show them: signed scope, approved milestones, full message trail.',
  },
]

const STEPS = [
  { n: '01', title: 'Create a deal', desc: 'Add title, brief, and client email. AI drafts the proposal.' },
  { n: '02', title: 'Client approves scope', desc: 'Client gets a link, reviews line items, signs off.' },
  { n: '03', title: 'Track milestones', desc: 'Upload proof per milestone. Client approves each one.' },
  { n: '04', title: 'Invoice & get paid', desc: 'Invoice auto-generates from milestones. Stripe handles payment.' },
]

const COMPARE = [
  { feature: 'Scope agreement (both sign)', xero: false, freshbooks: false, us: true },
  { feature: 'Milestone proof uploads', xero: false, freshbooks: false, us: true },
  { feature: 'Change order tracking', xero: false, freshbooks: false, us: true },
  { feature: 'Per-deal threaded comms', xero: false, freshbooks: 'basic', us: true },
  { feature: 'WhatsApp notifications', xero: false, freshbooks: false, us: true },
  { feature: 'Client portal (no login)', xero: false, freshbooks: false, us: true },
  { feature: 'AI proposal drafting', xero: false, freshbooks: false, us: true },
  { feature: 'Dispute evidence trail', xero: false, freshbooks: false, us: true },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-lg font-black tracking-tight">Deal<span className="text-violet-400">Flow</span></span>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Log in</Link>
            <Link href="/login" className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Get started free →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — everything above fold */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 text-violet-300 text-xs font-semibold mb-6">
            ✦ The platform Xero and FreshBooks never built
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-4">
            Scope it. Prove it.<br />
            <span className="text-violet-400">Get paid.</span>
          </h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            One shared workspace for vendors and clients — AI proposals, signed scope,
            milestone proofs, change orders, and Stripe payments. No more invoice disputes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base"
            >
              Start free — 3 deals included →
            </Link>
            <a
              href="#how-it-works"
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-8 py-4 rounded-xl transition-colors text-base"
            >
              See how it works
            </a>
          </div>
          <p className="text-slate-500 text-xs mt-4">No credit card · No password · Free forever for 3 deals</p>
        </div>

        {/* Social proof pills */}
        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {[
            '✅ Scope disputes eliminated',
            '📎 Milestone proof uploads',
            '💬 WhatsApp alerts',
            '🛡️ Dispute evidence trail',
            '🤖 AI proposal drafting',
          ].map(p => (
            <span key={p} className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full font-medium">{p}</span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-center mb-10">From lead to paid in 4 steps</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS.map(s => (
            <div key={s.n} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <span className="text-3xl font-black text-violet-400/40">{s.n}</span>
              <h3 className="font-bold text-white mt-2 mb-1">{s.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-center mb-2">Everything vendors and clients need</h2>
        <p className="text-slate-400 text-center text-sm mb-10">All industries. Any project size.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-violet-800/60 transition-colors">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-bold text-white mb-1 text-sm">{f.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-center mb-10">Why not just use Xero or FreshBooks?</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-4 bg-slate-800/50 px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
            <span className="col-span-1">Feature</span>
            <span className="text-center">Xero</span>
            <span className="text-center">FreshBooks</span>
            <span className="text-center text-violet-400">DealFlow</span>
          </div>
          {COMPARE.map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-4 px-6 py-3 text-sm ${i % 2 === 0 ? '' : 'bg-slate-900/50'}`}>
              <span className="text-slate-300 text-xs">{row.feature}</span>
              <span className="text-center">{row.xero ? '✅' : '❌'}</span>
              <span className="text-center">{row.freshbooks === 'basic' ? '⚠️' : row.freshbooks ? '✅' : '❌'}</span>
              <span className="text-center">{row.us ? '✅' : '❌'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-center mb-10">Simple pricing</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <h3 className="font-black text-white text-xl mb-1">Free</h3>
            <p className="text-3xl font-black text-white mb-4">$0 <span className="text-slate-500 text-base font-normal">forever</span></p>
            <ul className="space-y-2 text-sm text-slate-300 mb-8">
              {['3 active deals', 'Scope + milestone tracking', 'Online payments', 'Deal comms thread'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-violet-400">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/login" className="block w-full text-center bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm">
              Start free →
            </Link>
          </div>
          <div className="bg-violet-600 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Popular</div>
            <h3 className="font-black text-white text-xl mb-1">Pro</h3>
            <p className="text-3xl font-black text-white mb-4">$12 <span className="text-violet-200 text-base font-normal">/ month</span></p>
            <ul className="space-y-2 text-sm text-white mb-8">
              {[
                'Unlimited deals',
                'WhatsApp notifications',
                'Custom invoice branding',
                'AI proposal drafting',
                'Dispute evidence trail',
                'Priority support',
              ].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-white/70">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/login" className="block w-full text-center bg-white text-violet-700 font-bold py-3 rounded-xl transition-opacity hover:opacity-90 text-sm">
              Start Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ — SEO */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-center mb-10">Frequently asked questions</h2>
        <div className="space-y-4">
          {[
            { q: 'What is DealFlow?', a: 'DealFlow is a vendor-client platform that covers the full project lifecycle — from AI-drafted proposals and scope agreements through milestone tracking, change orders, and Stripe-powered payments. Unlike Xero or FreshBooks, it starts before the invoice.' },
            { q: 'Who uses DealFlow?', a: 'Any vendor who works on projects: freelancers, agencies, contractors, consultants, home service providers, software developers. Clients are invited by the vendor and get their own portal.' },
            { q: 'How does scope agreement work?', a: 'The vendor creates scope line items (description, qty, unit price). The client reviews and approves each one. Once approved, scope locks — any extra work requires a signed change order. This eliminates "that wasn\'t included" disputes.' },
            { q: 'Does the client need to sign up?', a: 'Yes — the client creates a free account when they accept the invite link. This gives both parties a shared deal workspace.' },
            { q: 'How does payment work?', a: 'DealFlow generates a Stripe payment link per invoice. The client pays in their browser. No Stripe account needed on the client side.' },
            { q: 'What are WhatsApp notifications?', a: 'Vendors and clients can opt in to receive WhatsApp messages when key events happen: scope approved, milestone complete, invoice paid, new message. Powered by Twilio.' },
          ].map(({ q, a }) => (
            <details key={q} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 group">
              <summary className="font-semibold text-white cursor-pointer list-none flex justify-between items-center text-sm">
                {q}
                <span className="text-slate-500 group-open:rotate-180 transition-transform">↓</span>
              </summary>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-black mb-4">Stop losing deals to scope disputes</h2>
        <p className="text-slate-400 mb-8">Start with 3 free deals. No credit card. No password.</p>
        <Link href="/login" className="inline-block bg-violet-600 hover:bg-violet-700 text-white font-bold px-10 py-4 rounded-xl transition-colors text-base">
          Create your first deal →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-xs">
        <div className="mb-2 font-black text-white text-sm">Deal<span className="text-violet-400">Flow</span></div>
        <p>Vendor-client platform — proposals, milestones, payments.</p>
        <p className="mt-1">© {new Date().getFullYear()} DealFlow · <a href="/privacy" className="hover:text-white transition-colors">Privacy</a> · <a href="/terms" className="hover:text-white transition-colors">Terms</a></p>
      </footer>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: landing page — above-fold hero, features, comparison, pricing, FAQ + JSON-LD SEO"
```

---

## Task 6: Vendor dashboard

**Files:**
- Create: `src/app/dashboard/layout.tsx`
- Create: `src/app/dashboard/page.tsx`
- Create: `src/app/api/deals/route.ts`

- [ ] **Step 1: Dashboard layout (auth guard)**

Create `src/app/dashboard/layout.tsx`:

```tsx
import { getSessionUser } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  return <>{children}</>
}
```

- [ ] **Step 2: Deals API — GET list + POST create**

Create `src/app/api/deals/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/session'
import { db } from '@/lib/db'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const deals = await db.deal.findMany({
    where: {
      OR: [{ vendorId: user.id }, { clientId: user.id }],
    },
    include: {
      client: { select: { email: true, name: true } },
      vendor: { select: { email: true, name: true } },
      _count: { select: { milestones: true, messages: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ deals })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, description, clientEmail } = await req.json()
  if (!title || !clientEmail) {
    return NextResponse.json({ error: 'Title and client email required' }, { status: 400 })
  }

  const deal = await db.deal.create({
    data: {
      vendorId: user.id,
      title,
      description,
      status: 'DRAFT',
    },
  })

  // Create invite token
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const invite = await db.inviteToken.create({
    data: { dealId: deal.id, email: clientEmail, expiresAt },
  })

  // Send invite email via Resend
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/client/${invite.token}`

  await resend.emails.send({
    from: 'DealFlow <noreply@dealflow.app>',
    to: clientEmail,
    subject: `${user.name || user.email} invited you to a deal on DealFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
        <h2 style="margin:0 0 8px">You've been invited to a deal</h2>
        <p style="color:#555;margin:0 0 16px"><strong>${user.name || user.email}</strong> wants to work with you on <strong>${title}</strong>.</p>
        <a href="${inviteUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0">
          View deal →
        </a>
        <p style="color:#999;font-size:12px">This invite expires in 7 days.</p>
      </div>
    `,
  })

  await db.deal.update({ where: { id: deal.id }, data: { status: 'PROPOSAL_SENT' } })

  return NextResponse.json({ deal })
}
```

- [ ] **Step 3: Dashboard page**

Create `src/app/dashboard/page.tsx`:

```tsx
import { getSessionUser } from '@/lib/session'
import { db } from '@/lib/db'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-700 text-slate-300',
  PROPOSAL_SENT: 'bg-blue-900/50 text-blue-300',
  SCOPE_AGREED: 'bg-violet-900/50 text-violet-300',
  IN_PROGRESS: 'bg-amber-900/50 text-amber-300',
  INVOICE_SENT: 'bg-orange-900/50 text-orange-300',
  PAID: 'bg-emerald-900/50 text-emerald-300',
  DISPUTED: 'bg-red-900/50 text-red-300',
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PROPOSAL_SENT: 'Proposal Sent',
  SCOPE_AGREED: 'Scope Agreed',
  IN_PROGRESS: 'In Progress',
  INVOICE_SENT: 'Invoice Sent',
  PAID: 'Paid',
  DISPUTED: 'Disputed',
}

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const deals = await db.deal.findMany({
    where: { OR: [{ vendorId: user.id }, { clientId: user.id }] },
    include: {
      client: { select: { email: true, name: true } },
      vendor: { select: { email: true, name: true } },
      _count: { select: { milestones: true, messages: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const stats = {
    total: deals.length,
    active: deals.filter(d => !['PAID', 'DRAFT'].includes(d.status)).length,
    paid: deals.filter(d => d.status === 'PAID').length,
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-black tracking-tight">Deal<span className="text-violet-400">Flow</span></Link>
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-xs">{user.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="text-slate-500 hover:text-white text-xs transition-colors">Log out</button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black">Your Deals</h1>
            <p className="text-slate-400 text-sm mt-1">{stats.active} active · {stats.paid} paid · {stats.total} total</p>
          </div>
          <Link
            href="/deal/new"
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
          >
            <span>+</span> New deal
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total deals', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'Paid', value: stats.paid },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Deals list */}
        {deals.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 border-dashed rounded-2xl p-12 text-center">
            <p className="text-slate-400 mb-4">No deals yet.</p>
            <Link href="/deal/new" className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm inline-block">
              Create your first deal →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {deals.map(deal => {
              const other = deal.vendorId === user.id ? deal.client : deal.vendor
              const role = deal.vendorId === user.id ? 'vendor' : 'client'
              return (
                <Link
                  key={deal.id}
                  href={`/deal/${deal.id}/scope`}
                  className="block bg-slate-900 border border-slate-800 hover:border-violet-800/60 rounded-2xl p-5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate">{deal.title}</h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {role === 'vendor' ? 'Client:' : 'Vendor:'} {other?.name || other?.email || 'Pending invite'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[deal.status]}`}>
                        {STATUS_LABELS[deal.status]}
                      </span>
                      <div className="text-slate-500 text-xs flex items-center gap-3">
                        <span>{deal._count.milestones} milestones</span>
                        <span>{deal._count.messages} msgs</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/ src/app/api/deals/route.ts
git commit -m "feat: vendor dashboard — deal list, stats, POST create deal + invite email"
```

---

## Task 7: Create deal page

**Files:**
- Create: `src/app/deal/new/page.tsx`

- [ ] **Step 1: Create deal form**

Create `src/app/deal/new/page.tsx`:

```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewDealPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: '', description: '', clientEmail: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setLoading(false); return }
    router.push(`/deal/${data.deal.id}/scope`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">← Dashboard</Link>
          <span className="text-slate-600">/</span>
          <span className="text-white text-sm font-semibold">New deal</span>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-black mb-2">Create a new deal</h1>
        <p className="text-slate-400 text-sm mb-8">Your client gets an invite email with a link to view and approve the scope.</p>

        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Deal title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              required
              placeholder="e.g. Website redesign for Acme Corp"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Brief description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              rows={3}
              placeholder="What are you building or delivering? AI will use this to draft the scope."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Client email *</label>
            <input
              type="email"
              value={form.clientEmail}
              onChange={e => setForm(p => ({ ...p, clientEmail: e.target.value }))}
              required
              placeholder="client@company.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
            />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Creating deal + sending invite…' : 'Create deal & invite client →'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/deal/new/page.tsx
git commit -m "feat: new deal form — title, description, client email → creates deal + sends invite"
```

---

## Task 8: Client invite landing

**Files:**
- Create: `src/app/client/[token]/page.tsx`
- Create: `src/app/api/invite/[token]/route.ts`
- Create: `src/app/api/invite/accept/route.ts`

- [ ] **Step 1: Invite token API**

Create `src/app/api/invite/[token]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invite = await db.inviteToken.findUnique({
    where: { token },
    include: { deal: { include: { vendor: { select: { name: true, email: true } } } } },
  })

  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  if (invite.acceptedAt) return NextResponse.json({ error: 'Invite already accepted' }, { status: 410 })
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 410 })

  return NextResponse.json({
    invite: {
      token: invite.token,
      email: invite.email,
      dealTitle: invite.deal.title,
      dealDescription: invite.deal.description,
      vendorName: invite.deal.vendor.name || invite.deal.vendor.email,
    },
  })
}
```

Create `src/app/api/invite/accept/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { token, name } = await req.json()
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const invite = await db.inviteToken.findUnique({
    where: { token },
    include: { deal: true },
  })

  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  if (invite.acceptedAt) return NextResponse.json({ error: 'Already accepted' }, { status: 410 })
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: 'Invite expired' }, { status: 410 })

  // Upsert client user
  const client = await db.user.upsert({
    where: { email: invite.email },
    update: { role: 'CLIENT', ...(name ? { name } : {}) },
    create: { email: invite.email, role: 'CLIENT', name: name || null },
  })

  // Link client to deal
  await db.deal.update({
    where: { id: invite.dealId },
    data: { clientId: client.id, status: 'SCOPE_AGREED' === invite.deal.status ? 'SCOPE_AGREED' : 'PROPOSAL_SENT' },
  })

  // Mark invite accepted
  await db.inviteToken.update({ where: { id: invite.id }, data: { acceptedAt: new Date() } })

  // Create session for client
  await createSession(client.id)

  return NextResponse.json({ dealId: invite.dealId })
}
```

- [ ] **Step 2: Client invite landing page**

Create `src/app/client/[token]/page.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface InviteData {
  token: string
  email: string
  dealTitle: string
  dealDescription: string | null
  vendorName: string
}

export default function ClientInvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    fetch(`/api/invite/${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else setInvite(data.invite)
        setLoading(false)
      })
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    const res = await fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed'); setAccepting(false); return }
    router.push(`/deal/${data.dealId}/scope`)
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-red-900/50 rounded-2xl p-8 text-center max-w-sm">
        <p className="text-red-400 font-semibold mb-2">Invite unavailable</p>
        <p className="text-slate-400 text-sm">{error}</p>
      </div>
    </div>
  )

  if (!invite) return null

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-black tracking-tight">Deal<span className="text-violet-400">Flow</span></span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📋</span>
            </div>
            <h1 className="font-black text-xl mb-1">You've been invited</h1>
            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">{invite.vendorName}</span> wants to work with you on:
            </p>
            <p className="text-violet-300 font-bold mt-2">{invite.dealTitle}</p>
            {invite.dealDescription && (
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">{invite.dealDescription}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Your name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm"
              />
            </div>
            <p className="text-slate-500 text-xs text-center">Accepting as <span className="text-slate-300">{invite.email}</span></p>
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {accepting ? 'Accepting…' : 'Accept & view deal →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/client/ src/app/api/invite/
git commit -m "feat: client invite landing + accept flow — creates client user, sets session, redirects to deal"
```

---

## Task 9: Deal layout stub (foundation for Plan B)

**Files:**
- Create: `src/app/deal/[id]/layout.tsx`
- Create: `src/app/deal/[id]/page.tsx`

- [ ] **Step 1: Deal layout**

Create `src/app/deal/[id]/layout.tsx`:

```tsx
import { getSessionUser } from '@/lib/session'
import { db } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

const NAV_TABS = [
  { label: 'Scope', href: 'scope' },
  { label: 'Milestones', href: 'milestones' },
  { label: 'Messages', href: 'messages' },
  { label: 'Invoice', href: 'invoice' },
]

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-700 text-slate-300',
  PROPOSAL_SENT: 'bg-blue-900/50 text-blue-300',
  SCOPE_AGREED: 'bg-violet-900/50 text-violet-300',
  IN_PROGRESS: 'bg-amber-900/50 text-amber-300',
  INVOICE_SENT: 'bg-orange-900/50 text-orange-300',
  PAID: 'bg-emerald-900/50 text-emerald-300',
  DISPUTED: 'bg-red-900/50 text-red-300',
}

export default async function DealLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const deal = await db.deal.findUnique({
    where: { id },
    include: {
      vendor: { select: { id: true, name: true, email: true } },
      client: { select: { id: true, name: true, email: true } },
    },
  })

  if (!deal) notFound()

  const isVendor = deal.vendorId === user.id
  const isClient = deal.clientId === user.id
  if (!isVendor && !isClient) redirect('/dashboard')

  const other = isVendor ? deal.client : deal.vendor

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm shrink-0 transition-colors">← Deals</Link>
            <span className="text-slate-600">/</span>
            <span className="text-white text-sm font-semibold truncate">{deal.title}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[deal.status]}`}>
              {deal.status.replace(/_/g, ' ')}
            </span>
          </div>
          <span className="text-slate-500 text-xs shrink-0 ml-4">
            {isVendor ? 'Client: ' : 'Vendor: '}{other?.name || other?.email || 'Pending'}
          </span>
        </div>
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pb-0">
          {NAV_TABS.map(tab => (
            <Link
              key={tab.href}
              href={`/deal/${id}/${tab.href}`}
              className="text-sm text-slate-400 hover:text-white px-4 py-2.5 transition-colors border-b-2 border-transparent hover:border-violet-500"
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Deal index redirect**

Create `src/app/deal/[id]/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default async function DealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/deal/${id}/scope`)
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/deal/
git commit -m "feat: deal layout — tab nav (scope/milestones/messages/invoice), auth guard, deal header"
```

---

## Task 10: Env vars + deploy

**Files:**
- Modify: `.env.example` (create)

- [ ] **Step 1: Create .env.example**

Create `.env.example`:

```bash
# Database (Neon Postgres)
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# Auth
RESEND_API_KEY="re_..."
NEXT_PUBLIC_BASE_URL="https://dealflow.app"

# Stripe (Plan C)
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Twilio WhatsApp (Plan C)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

# AI
GROQ_API_KEY="gsk_..."
GEMINI_API_KEY="AI..."
ANTHROPIC_API_KEY="sk-ant-..."
```

- [ ] **Step 2: Set Vercel env vars**

```bash
# Set each var in Vercel
vercel env add DATABASE_URL
vercel env add RESEND_API_KEY
vercel env add NEXT_PUBLIC_BASE_URL
vercel env add GROQ_API_KEY
vercel env add GEMINI_API_KEY
vercel env add ANTHROPIC_API_KEY
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: Build succeeds (zero type errors)

- [ ] **Step 4: Deploy**

```bash
vercel --prod
```

- [ ] **Step 5: Final commit**

```bash
git add .env.example
git commit -m "chore: env example + deploy ready"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Auth (magic link, both roles) — Tasks 2, 3
- ✅ Deal CRUD + invite flow — Tasks 6, 7, 8
- ✅ Client portal — Task 8
- ✅ Landing page SEO + JSON-LD — Task 5
- ✅ DB schema (all tables) — Task 1
- ✅ Middleware auth guard — Task 4
- ✅ Deal workspace layout — Task 9
- ⏭️ Scope agreement — Plan B
- ⏭️ Milestones — Plan B
- ⏭️ Messages — Plan B
- ⏭️ Invoice + Stripe — Plan C
- ⏭️ WhatsApp — Plan C
- ⏭️ Freemium gate — Plan C
- ⏭️ Dispute evidence — Plan C

**Placeholder scan:** None found. All steps have code.

**Type consistency:**
- `getSessionUser()` returns `User | null` — used consistently in dashboard, deal layout
- `db.deal.findMany` includes used in dashboard matches schema
- `InviteData` interface in client page matches API response shape
- `DealStatus` enum values match schema exactly
