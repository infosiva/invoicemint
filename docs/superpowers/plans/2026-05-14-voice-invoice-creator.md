# Voice Invoice Creator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/create` — a voice-first invoice page where anyone (guest or logged-in) can speak or type an invoice into existence in under 30 seconds and send a Stripe payment link.

**Architecture:** Single client-side page at `app/create/page.tsx` with three focused child components (VoiceInput, InvoiceEditor, SendSheet). Voice transcription uses browser-native Web Speech API. Parsing is a server-side API route calling Groq `llama-3.3-70b-versatile` (free). PDF uses the existing `InvoicePDF` component. Stripe Payment Link created via a new API route. Guest mode — no auth required; email captured inline at send step.

**Tech Stack:** Next.js 15 App Router, Web Speech API (`window.SpeechRecognition`), Groq SDK (`groq-sdk` already installed), existing `@react-pdf/renderer` + `InvoicePDF` component, Stripe Payment Links API (`stripe` already installed), Resend for send-confirmation email.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `app/create/page.tsx` | CREATE | Page shell — orchestrates state, renders 3 components |
| `app/create/VoiceInput.tsx` | CREATE | Mic button, Web Speech API, transcript → calls onParsed |
| `app/create/InvoiceEditor.tsx` | CREATE | Editable line items table + totals + client/vendor fields |
| `app/create/SendSheet.tsx` | CREATE | Email capture + send button + post-send state |
| `app/api/parse-invoice/route.ts` | CREATE | Server-side Groq call — text → ParsedInvoice JSON |
| `app/api/stripe/payment-link/route.ts` | CREATE | Creates Stripe Payment Link, returns URL |
| `app/api/parse-speech/route.ts` | MODIFY | Switch from Anthropic to Groq, return full ParsedInvoice shape |

---

## Task 1: ParsedInvoice type + Groq parse-invoice API route

**Files:**
- Create: `app/api/parse-invoice/route.ts`

- [ ] **Step 1: Create the API route**

```typescript
// app/api/parse-invoice/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export type ParsedInvoice = {
  clientName: string
  clientEmail: string
  vendorName: string
  lineItems: { description: string; qty: number; unitPrice: number }[]
  discount?: { type: 'percent' | 'fixed'; value: number }
  dueDate: string
  notes: string
  milestones?: { label: string; percent: number }[]
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM = `You are an invoice parser. Extract invoice details from natural language.
Return ONLY valid JSON matching this exact shape — no markdown, no explanation:
{
  "clientName": "string",
  "clientEmail": "string (empty if not mentioned)",
  "vendorName": "string (empty if not mentioned)",
  "lineItems": [{ "description": "string", "qty": number, "unitPrice": number }],
  "discount": { "type": "percent|fixed", "value": number } or null,
  "dueDate": "YYYY-MM-DD (infer from relative terms like 'in 2 weeks'; empty if none)",
  "notes": "string (empty if none)",
  "milestones": [{ "label": "string", "percent": number }] or null
}

Examples:
- "Charge Mark $3k for dev work, 20% deposit" → lineItems:[{description:"Dev work",qty:1,unitPrice:3000}], milestones:[{label:"Deposit",percent:20},{label:"Balance",percent:80}]
- "4 days at $800/day minus 10% discount" → lineItems:[{description:"Day rate",qty:4,unitPrice:800}], discount:{type:"percent",value:10}
- "Logo design $1500, 3 revisions $150 each" → lineItems:[{description:"Logo design",qty:1,unitPrice:1500},{description:"Revision",qty:3,unitPrice:150}]`

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text?.trim()) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 })
  }
  try {
    const today = new Date().toISOString().split('T')[0]
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 400,
      messages: [
        { role: 'system', content: SYSTEM + `\nToday is ${today}.` },
        { role: 'user', content: text },
      ],
    })
    const raw = completion.choices[0]?.message?.content ?? '{}'
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')
    const parsed: ParsedInvoice = JSON.parse(match[0])
    return NextResponse.json({ invoice: parsed })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Parse failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
```

- [ ] **Step 2: Test the route manually**

```bash
cd /Users/sivaprakasam/projects/agents/invoice-ai
npm run dev
```

In a second terminal:
```bash
curl -X POST http://localhost:3000/api/parse-invoice \
  -H "Content-Type: application/json" \
  -d '{"text":"Charge Sarah $2500 for logo design, 3 revisions included, due in 2 weeks"}'
```

Expected: JSON with `lineItems` array, `clientName: "Sarah"`, `dueDate` 14 days from today.

- [ ] **Step 3: Commit**

```bash
git add app/api/parse-invoice/route.ts
git commit -m "feat: add Groq-powered parse-invoice API route"
```

---

## Task 2: Stripe Payment Link API route

**Files:**
- Create: `app/api/stripe/payment-link/route.ts`

- [ ] **Step 1: Create the route**

```typescript
// app/api/stripe/payment-link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { ParsedInvoice } from '@/app/api/parse-invoice/route'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { invoice, senderEmail }: { invoice: ParsedInvoice; senderEmail: string } = await req.json()

  // Calculate total
  const subtotal = invoice.lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const discountAmount = invoice.discount
    ? invoice.discount.type === 'percent'
      ? subtotal * (invoice.discount.value / 100)
      : invoice.discount.value
    : 0
  const total = Math.round((subtotal - discountAmount) * 100) // cents

  if (total < 50) {
    return NextResponse.json({ error: 'Amount too small (minimum $0.50)' }, { status: 400 })
  }

  // Build line item name
  const lineItemName = invoice.lineItems.length === 1
    ? invoice.lineItems[0].description
    : `Invoice: ${invoice.lineItems.map(i => i.description).join(', ')}`

  try {
    // Create a price inline
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: total,
      product_data: {
        name: lineItemName.slice(0, 255),
      },
    })

    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{ price: price.id, quantity: 1 }],
      after_completion: {
        type: 'hosted_confirmation',
        hosted_confirmation: { custom_message: 'Payment received. Thank you!' },
      },
      metadata: {
        clientEmail: invoice.clientEmail,
        senderEmail,
        dueDate: invoice.dueDate,
      },
    })

    return NextResponse.json({ url: paymentLink.url, id: paymentLink.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Stripe error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
```

- [ ] **Step 2: Test the route**

```bash
curl -X POST http://localhost:3000/api/stripe/payment-link \
  -H "Content-Type: application/json" \
  -d '{
    "invoice": {
      "clientName": "Sarah",
      "clientEmail": "sarah@example.com",
      "vendorName": "Test Vendor",
      "lineItems": [{"description": "Logo design", "qty": 1, "unitPrice": 2500}],
      "dueDate": "2026-06-01",
      "notes": ""
    },
    "senderEmail": "vendor@example.com"
  }'
```

Expected: `{ "url": "https://buy.stripe.com/...", "id": "plink_..." }`

- [ ] **Step 3: Commit**

```bash
git add app/api/stripe/payment-link/route.ts
git commit -m "feat: add Stripe Payment Link generation route"
```

---

## Task 3: VoiceInput component

**Files:**
- Create: `app/create/VoiceInput.tsx`

- [ ] **Step 1: Create the component**

```typescript
// app/create/VoiceInput.tsx
'use client'

import { useState, useRef, useCallback } from 'react'

interface Props {
  onTranscript: (text: string) => void
  onParsing: (loading: boolean) => void
}

export default function VoiceInput({ onTranscript, onParsing }: Props) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [text, setText] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
    if (!SR) {
      alert('Voice input is not supported in this browser. Try Chrome or Edge.')
      return
    }
    const recognition = new SR()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results).map(r => r[0].transcript).join('')
      setTranscript(t)
      if (e.results[0].isFinal) {
        setText(t)
        setTranscript('')
      }
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setListening(false)
  }, [])

  const handleSubmit = useCallback(async () => {
    const input = text.trim()
    if (!input) return
    onParsing(true)
    onTranscript(input)
    setText('')
  }, [text, onTranscript, onParsing])

  return (
    <div className="space-y-4">
      {/* Mic button */}
      <div className="flex justify-center">
        <button
          onClick={listening ? stopListening : startListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            listening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/40'
              : 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/30'
          }`}
          aria-label={listening ? 'Stop listening' : 'Start voice input'}
        >
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 3a1 1 0 0 1 2 0v8a1 1 0 0 1-2 0V4zM7 10a5 5 0 0 0 10 0h2a7 7 0 0 1-6 6.93V20h3v2H8v-2h3v-3.07A7 7 0 0 1 5 10h2z"/>
          </svg>
        </button>
      </div>

      {/* Live transcript */}
      {(listening || transcript) && (
        <p className="text-center text-slate-400 text-sm italic animate-pulse min-h-[1.5rem]">
          {transcript || 'Listening…'}
        </p>
      )}

      {/* Text input fallback */}
      <div className="relative">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
          placeholder={'Try: "Charge Sarah $2,500 for logo design, 3 revisions, due in 2 weeks"'}
          rows={3}
          className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm placeholder-slate-500 resize-none focus:outline-none focus:border-violet-500 transition-colors"
        />
        <p className="absolute bottom-3 right-4 text-slate-600 text-xs">⌘↵ to parse</p>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl transition-colors text-sm"
      >
        Parse Invoice →
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd /Users/sivaprakasam/projects/agents/invoice-ai
~/.nvm/versions/node/v22.22.1/bin/npx tsc --noEmit 2>&1 | grep "VoiceInput"
```

Expected: no output (no errors for this file).

- [ ] **Step 3: Commit**

```bash
git add app/create/VoiceInput.tsx
git commit -m "feat: add VoiceInput component with Web Speech API"
```

---

## Task 4: InvoiceEditor component

**Files:**
- Create: `app/create/InvoiceEditor.tsx`

- [ ] **Step 1: Create the component**

```typescript
// app/create/InvoiceEditor.tsx
'use client'

import { useCallback } from 'react'
import type { ParsedInvoice } from '@/app/api/parse-invoice/route'

interface Props {
  invoice: ParsedInvoice
  onChange: (invoice: ParsedInvoice) => void
}

function calcTotal(invoice: ParsedInvoice): number {
  const sub = invoice.lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  if (!invoice.discount) return sub
  return invoice.discount.type === 'percent'
    ? sub * (1 - invoice.discount.value / 100)
    : sub - invoice.discount.value
}

export default function InvoiceEditor({ invoice, onChange }: Props) {
  const updateItem = useCallback((idx: number, field: keyof ParsedInvoice['lineItems'][0], value: string) => {
    const items = invoice.lineItems.map((item, i) =>
      i === idx
        ? { ...item, [field]: field === 'description' ? value : parseFloat(value) || 0 }
        : item
    )
    onChange({ ...invoice, lineItems: items })
  }, [invoice, onChange])

  const addItem = useCallback(() => {
    onChange({ ...invoice, lineItems: [...invoice.lineItems, { description: '', qty: 1, unitPrice: 0 }] })
  }, [invoice, onChange])

  const removeItem = useCallback((idx: number) => {
    onChange({ ...invoice, lineItems: invoice.lineItems.filter((_, i) => i !== idx) })
  }, [invoice, onChange])

  const total = calcTotal(invoice)

  return (
    <div className="space-y-6">
      {/* Client / Vendor */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Client name</label>
          <input
            value={invoice.clientName}
            onChange={e => onChange({ ...invoice, clientName: e.target.value })}
            placeholder="Sarah Chen"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Client email</label>
          <input
            value={invoice.clientEmail}
            onChange={e => onChange({ ...invoice, clientEmail: e.target.value })}
            placeholder="sarah@company.com"
            type="email"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Your name / company</label>
          <input
            value={invoice.vendorName}
            onChange={e => onChange({ ...invoice, vendorName: e.target.value })}
            placeholder="Acme Studio"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Due date</label>
          <input
            value={invoice.dueDate}
            onChange={e => onChange({ ...invoice, dueDate: e.target.value })}
            type="date"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Line items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Line items</label>
          <button onClick={addItem} className="text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">+ Add item</button>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-slate-500 border-b border-slate-800">
            <span className="col-span-6">Description</span>
            <span className="col-span-2 text-right">Qty</span>
            <span className="col-span-2 text-right">Price</span>
            <span className="col-span-2 text-right">Total</span>
          </div>
          {invoice.lineItems.map((item, i) => (
            <div key={i} className="grid grid-cols-12 px-4 py-2 gap-2 items-center border-b border-slate-800/50 last:border-0 group">
              <input
                value={item.description}
                onChange={e => updateItem(i, 'description', e.target.value)}
                placeholder="Description"
                className="col-span-6 bg-transparent text-white text-sm focus:outline-none focus:bg-slate-800 rounded px-1 py-0.5 transition-colors placeholder-slate-600"
              />
              <input
                value={item.qty}
                onChange={e => updateItem(i, 'qty', e.target.value)}
                type="number"
                min="0"
                className="col-span-2 bg-transparent text-slate-300 text-sm text-right focus:outline-none focus:bg-slate-800 rounded px-1 py-0.5 transition-colors w-full"
              />
              <input
                value={item.unitPrice}
                onChange={e => updateItem(i, 'unitPrice', e.target.value)}
                type="number"
                min="0"
                className="col-span-2 bg-transparent text-slate-300 text-sm text-right focus:outline-none focus:bg-slate-800 rounded px-1 py-0.5 transition-colors w-full"
              />
              <div className="col-span-2 flex items-center justify-end gap-1">
                <span className="text-white text-sm font-semibold">${(item.qty * item.unitPrice).toLocaleString()}</span>
                <button
                  onClick={() => removeItem(i)}
                  className="text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-1 text-xs"
                  aria-label="Remove item"
                >✕</button>
              </div>
            </div>
          ))}
          {/* Total row */}
          <div className="grid grid-cols-12 px-4 py-3 border-t border-slate-700 bg-slate-800/30">
            <span className="col-span-10 text-right text-slate-400 text-sm font-semibold">
              {invoice.discount
                ? `Total (after ${invoice.discount.value}${invoice.discount.type === 'percent' ? '%' : '$'} discount)`
                : 'Total'}
            </span>
            <span className="col-span-2 text-right text-white font-black text-base">${total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Notes (optional)</label>
        <textarea
          value={invoice.notes}
          onChange={e => onChange({ ...invoice, notes: e.target.value })}
          placeholder="Payment terms, project details…"
          rows={2}
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
~/.nvm/versions/node/v22.22.1/bin/npx tsc --noEmit 2>&1 | grep "InvoiceEditor"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/create/InvoiceEditor.tsx
git commit -m "feat: add InvoiceEditor component — editable line items + totals"
```

---

## Task 5: SendSheet component

**Files:**
- Create: `app/create/SendSheet.tsx`

- [ ] **Step 1: Create the component**

```typescript
// app/create/SendSheet.tsx
'use client'

import { useState } from 'react'
import type { ParsedInvoice } from '@/app/api/parse-invoice/route'

interface Props {
  invoice: ParsedInvoice
}

type State = 'idle' | 'loading' | 'done' | 'error'

export default function SendSheet({ invoice }: Props) {
  const [email, setEmail] = useState(invoice.clientEmail)
  const [senderEmail, setSenderEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [paymentUrl, setPaymentUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSend() {
    if (!email || !email.includes('@')) {
      setErrorMsg('Client email is required to send.')
      return
    }
    setState('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/stripe/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice: { ...invoice, clientEmail: email }, senderEmail }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Failed')
      setPaymentUrl(data.url)
      setState('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong')
      setState('error')
    }
  }

  if (state === 'done') {
    return (
      <div className="space-y-4 text-center">
        <div className="w-14 h-14 bg-green-600/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-7 h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-white font-bold">Payment link ready</p>
          <p className="text-slate-400 text-sm mt-1">Share this with your client to collect payment.</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-left">
          <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wide">Payment link</p>
          <p className="text-violet-400 text-sm break-all font-mono">{paymentUrl}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigator.clipboard.writeText(paymentUrl)}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Copy link
          </button>
          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors text-center"
          >
            Preview →
          </a>
        </div>
        <p className="text-slate-600 text-xs">
          <a href="/login" className="text-violet-400 hover:underline">Create an account</a> to track payment status and manage deals.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Send payment link to</label>
        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="client@company.com"
          type="email"
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mb-1.5">Your email (optional — for receipt)</label>
        <input
          value={senderEmail}
          onChange={e => setSenderEmail(e.target.value)}
          placeholder="you@yourbusiness.com"
          type="email"
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
        />
      </div>
      {errorMsg && (
        <p className="text-red-400 text-sm bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3">{errorMsg}</p>
      )}
      <button
        onClick={handleSend}
        disabled={state === 'loading' || !email}
        className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-colors text-sm"
      >
        {state === 'loading' ? 'Creating payment link…' : 'Generate payment link →'}
      </button>
      <p className="text-slate-600 text-xs text-center">Powered by Stripe. No account required to pay.</p>
    </div>
  )
}
```

- [ ] **Step 2: Type-check**

```bash
~/.nvm/versions/node/v22.22.1/bin/npx tsc --noEmit 2>&1 | grep "SendSheet"
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/create/SendSheet.tsx
git commit -m "feat: add SendSheet component — Stripe payment link generation"
```

---

## Task 6: Main `/create` page — wire everything together

**Files:**
- Create: `app/create/page.tsx`

- [ ] **Step 1: Create the page**

```typescript
// app/create/page.tsx
'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import VoiceInput from './VoiceInput'
import InvoiceEditor from './InvoiceEditor'
import SendSheet from './SendSheet'
import type { ParsedInvoice } from '@/app/api/parse-invoice/route'

const PDFPreview = dynamic(() => import('../components/PDFPreview'), { ssr: false })

const EMPTY: ParsedInvoice = {
  clientName: '',
  clientEmail: '',
  vendorName: '',
  lineItems: [],
  dueDate: '',
  notes: '',
}

type Stage = 'input' | 'edit' | 'send'

export default function CreatePage() {
  const [invoice, setInvoice] = useState<ParsedInvoice>(EMPTY)
  const [stage, setStage] = useState<Stage>('input')
  const [parsing, setParsing] = useState(false)
  const [parseError, setParseError] = useState('')

  const handleTranscript = useCallback(async (text: string) => {
    setParsing(true)
    setParseError('')
    try {
      const res = await fetch('/api/parse-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setInvoice(data.invoice)
      setStage('edit')
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Could not parse — try again')
    } finally {
      setParsing(false)
    }
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-black tracking-tight">
            Deal<span className="text-violet-400">Flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link>
            <Link href="/login" className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">Sign in</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white mb-2">Create an invoice</h1>
          <p className="text-slate-400">Speak it or type it — we&apos;ll handle the rest.</p>
        </div>

        {/* Stage: input */}
        {stage === 'input' && (
          <div className="max-w-xl mx-auto">
            {parsing ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400 text-sm">Parsing your invoice…</p>
              </div>
            ) : (
              <>
                <VoiceInput onTranscript={handleTranscript} onParsing={setParsing} />
                {parseError && (
                  <p className="text-red-400 text-sm text-center mt-4 bg-red-900/20 border border-red-800/40 rounded-xl px-4 py-3">{parseError}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* Stage: edit */}
        {stage === 'edit' && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-white">Review & edit</h2>
                <button onClick={() => setStage('input')} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Start over</button>
              </div>
              <InvoiceEditor invoice={invoice} onChange={setInvoice} />
              <button
                onClick={() => setStage('send')}
                disabled={invoice.lineItems.length === 0}
                className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl transition-colors text-sm"
              >
                Looks good — send it →
              </button>
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Preview</p>
              <PDFPreview
                service={invoice.lineItems[0]?.description ?? ''}
                clientType="individual"
                amount={String(invoice.lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0))}
                tone="formal"
                details={invoice.notes}
                docType="invoice"
                yourName={invoice.vendorName}
                yourCompany=""
                yourEmail=""
                yourPhone=""
                clientName={invoice.clientName}
                clientCompany=""
                invoiceNumber={`INV-${Date.now().toString().slice(-6)}`}
                dueDate={invoice.dueDate}
                logoUrl=""
                accentColor="#8b5cf6"
                footerNote=""
                generatedText=""
              />
            </div>
          </div>
        )}

        {/* Stage: send */}
        {stage === 'send' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-white">Send invoice</h2>
              <button onClick={() => setStage('edit')} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Back to edit</button>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm">
              <p className="text-slate-400">Sending to: <span className="text-white font-semibold">{invoice.clientName || 'client'}</span></p>
              <p className="text-slate-400 mt-1">Total: <span className="text-white font-black">${invoice.lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0).toLocaleString()}</span></p>
            </div>
            <SendSheet invoice={invoice} />
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Check PDFPreview props match existing component**

```bash
head -20 /Users/sivaprakasam/projects/agents/invoice-ai/app/components/PDFPreview.tsx
```

Verify the props passed to `<PDFPreview>` in the page match the component's interface. If there are mismatches, update the props in `app/create/page.tsx` to match.

- [ ] **Step 3: Type-check the whole app**

```bash
~/.nvm/versions/node/v22.22.1/bin/npx tsc --noEmit 2>&1
```

Fix any errors before continuing.

- [ ] **Step 4: Smoke test in browser**

```
1. Open http://localhost:3000/create
2. Type: "Charge Mark $3000 for 3 weeks of dev work, 20% deposit"
3. Click "Parse Invoice →"
4. Verify: InvoiceEditor shows correct line items and client name
5. Edit one line item — verify total updates
6. Click "Looks good — send it →"
7. Verify SendSheet renders with client email pre-filled
```

- [ ] **Step 5: Commit**

```bash
git add app/create/page.tsx
git commit -m "feat: add /create page — voice-first invoice creator, 3-stage flow"
```

---

## Task 7: Add `/create` to the nav + landing page CTA

**Files:**
- Modify: `app/dashboard/layout.tsx` (already has nav)
- Modify: `app/page.tsx` (landing page CTA)

- [ ] **Step 1: Add "Create Invoice" CTA to landing page hero**

Open `app/page.tsx`. Find the primary hero CTA button (currently links to `/login` or `/dashboard`). Add a second CTA link alongside it:

```tsx
{/* Add this alongside the existing primary CTA in the hero section */}
<a
  href="/create"
  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl text-base transition-colors shadow-lg shadow-violet-500/25"
>
  Create free invoice →
</a>
```

- [ ] **Step 2: Verify nav link in dashboard layout**

The dashboard layout already has a "Quick Invoice" link pointing to `/generate`. Update it to point to `/create`:

In `app/dashboard/layout.tsx`, find:
```tsx
<Link href="/generate" className="text-slate-400 hover:text-white text-sm font-medium transition-colors hidden sm:block">
  Quick Invoice
</Link>
```

Change to:
```tsx
<Link href="/create" className="text-slate-400 hover:text-white text-sm font-medium transition-colors hidden sm:block">
  Quick Invoice
</Link>
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx app/dashboard/layout.tsx
git commit -m "feat: link /create from landing page CTA and dashboard nav"
```

---

## Task 8: Deploy and verify

- [ ] **Step 1: Final type-check**

```bash
~/.nvm/versions/node/v22.22.1/bin/npx tsc --noEmit 2>&1
```

Expected: no errors.

- [ ] **Step 2: Push to main**

```bash
git push origin main
```

Vercel auto-deploys on push. Watch the deployment at vercel.com/dashboard.

- [ ] **Step 3: Smoke test on production**

```
1. Visit https://[your-vercel-url]/create
2. Type: "Charge Sarah $2,500 for logo design, 3 revisions, due in 2 weeks"
3. Click Parse — verify line items appear
4. Click send — verify Stripe payment link generates
5. Open the payment link — verify Stripe checkout shows correct amount
```

- [ ] **Step 4: Test voice input (Chrome only)**

```
1. Open /create in Chrome
2. Click the mic button
3. Speak: "Invoice John Smith for $500 website consulting"
4. Verify transcript appears, then auto-submits for parsing
5. Verify InvoiceEditor populates correctly
```

---

## Self-Review

**Spec coverage check:**
- ✅ Guest mode — no auth on `/create`
- ✅ Voice input — Web Speech API in VoiceInput.tsx
- ✅ Text fallback — textarea in VoiceInput.tsx
- ✅ Groq parsing — Task 1 API route with full examples
- ✅ Editable preview — InvoiceEditor.tsx with line items + totals
- ✅ Discount handling — calcTotal in InvoiceEditor, sent to payment-link route
- ✅ Stripe Payment Link — Task 2 route
- ✅ Email capture at send — SendSheet senderEmail field
- ✅ PDF preview — PDFPreview dynamic import in edit stage
- ✅ Freemium nudge — "Create an account" link in SendSheet done state
- ✅ Complex parse examples — SYSTEM prompt in Task 1 covers all 3 spec examples
- ✅ ParsedInvoice type — defined in Task 1, imported in Tasks 4, 5, 6

**Type consistency check:**
- `ParsedInvoice` defined in `app/api/parse-invoice/route.ts` — imported via `@/app/api/parse-invoice/route` in InvoiceEditor, SendSheet, and page
- `calcTotal(invoice: ParsedInvoice): number` — used only in InvoiceEditor, not exported (no name conflicts)
- `PDFPreview` props: Task 6 Step 2 explicitly requires verifying props match before committing
