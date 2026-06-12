'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// Invoice panel data — cycling animation
const INVOICES = [
  { client: 'Priya Sharma Design', amount: '$2,400', status: 'Paid', due: 'Jun 1' },
  { client: 'Northside Agency', amount: '$850', status: 'Pending', due: 'Jun 14' },
  { client: 'BuildRight Ltd', amount: '$5,100', status: 'Overdue', due: 'May 28' },
  { client: 'Lens & Light Studio', amount: '$1,200', status: 'Paid', due: 'Jun 3' },
]

const STATUS_STYLES: Record<string, string> = {
  Paid: 'bg-teal-50 text-teal-700 border border-teal-200',
  Pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  Overdue: 'bg-red-50 text-red-600 border border-red-200',
}

const STEPS = [
  { n: '1', label: 'Describe the project', sub: 'Plain text, AI structures it' },
  { n: '2', label: 'Client approves scope', sub: 'Sign-off locks the deal' },
  { n: '3', label: 'Track milestones', sub: 'Upload proof, get approved' },
  { n: '4', label: 'Get paid', sub: 'Stripe, instant transfer' },
]

const FREE_FEATURES = ['3 active deals', 'Scope + milestone tracking', 'Online payments', 'Deal comms thread']
const PRO_FEATURES = ['Unlimited deals', 'WhatsApp alerts', 'Custom invoice branding', 'AI proposal drafting', 'Dispute evidence trail', 'Priority support']

function AnimatedInvoicePanel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActive(a => (a + 1) % INVOICES.length), 2200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="w-full max-w-[380px] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[12px] font-black uppercase tracking-widest text-slate-400">Invoices</span>
        <span className="rounded-full bg-teal-600 px-2.5 py-0.5 text-[10px] font-black text-white">Live</span>
      </div>

      {/* Invoice list */}
      <div className="space-y-2">
        {INVOICES.map((inv, i) => (
          <div
            key={inv.client}
            className="flex items-center justify-between rounded-xl border px-3.5 py-2.5 transition-all duration-300"
            style={{
              borderColor: i === active ? '#0f766e' : '#e2e8f0',
              backgroundColor: i === active ? '#f0fdfa' : '#f8fafc',
              transform: i === active ? 'scale(1.015)' : 'scale(1)',
            }}
          >
            <div>
              <div className="text-[12px] font-bold text-slate-800">{inv.client}</div>
              <div className="text-[10px] text-slate-400">Due {inv.due}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[13px] font-black text-slate-800">{inv.amount}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${STATUS_STYLES[inv.status]}`}>
                {inv.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-teal-600 px-4 py-2.5">
        <span className="text-[11px] font-semibold text-teal-100">Total outstanding</span>
        <span className="text-[15px] font-black text-white">$5,950</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Sticky navbar */}
      <nav className="sticky top-0 z-50 flex h-[52px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl">
        <span className="text-[16px] font-black tracking-tight text-slate-900">
          Invoice<span className="text-teal-600">Mint</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/generate" className="hidden text-[12px] text-slate-500 transition-colors hover:text-slate-900 sm:block">
            Quick Invoice
          </Link>
          <Link href="/login" className="hidden text-[12px] text-slate-500 transition-colors hover:text-slate-900 sm:block">
            Log in
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-teal-600 px-3.5 py-1.5 text-[12px] font-bold text-white transition-colors duration-150 hover:bg-teal-700 active:scale-[0.97]"
            style={{ transition: 'background-color 150ms, transform 100ms' }}
          >
            Get started free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 pb-12 pt-14 lg:grid-cols-2 lg:gap-16 lg:pt-20">
        {/* Left */}
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            <span className="text-[11px] font-semibold text-teal-700">AI invoicing — free to start</span>
          </div>
          <h1 className="mb-4 text-[clamp(30px,4.5vw,50px)] font-black leading-[1.05] tracking-tight text-slate-900">
            Invoice clients.<br />
            <span className="text-teal-600">Get paid on time.</span>
          </h1>
          <p className="mb-7 max-w-[420px] text-[15px] leading-relaxed text-slate-500">
            AI drafts your invoice in seconds. Lock scope, track milestones, accept Stripe payments — no disputes.
          </p>
          <Link
            href="/login"
            className="inline-flex w-fit items-center rounded-xl bg-teal-600 px-8 py-3.5 text-[14px] font-black text-white transition-colors duration-150 hover:bg-teal-700 active:scale-[0.97]"
            style={{ transition: 'background-color 150ms, transform 100ms' }}
          >
            Create your first invoice →
          </Link>
          <p className="mt-3 text-[11px] text-slate-400">Free forever · No credit card needed</p>
        </div>

        {/* Right — animated invoice panel */}
        <div className="flex items-center justify-center lg:justify-end">
          <AnimatedInvoicePanel />
        </div>
      </section>

      {/* ── 4-STEP FLOW ── */}
      <div className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3 px-4 py-5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[11px] font-black text-white">
                {s.n}
              </span>
              <div>
                <div className="text-[12px] font-bold text-slate-800">{s.label}</div>
                <div className="text-[10px] text-slate-400">{s.sub}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="ml-auto hidden text-slate-300 sm:block">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ── */}
      <section className="mx-auto max-w-3xl px-5 py-14">
        <p className="mb-2 text-[11px] font-black uppercase tracking-widest text-teal-600">Pricing</p>
        <h2 className="mb-8 text-[clamp(20px,3vw,28px)] font-black tracking-tight text-slate-900">Simple, honest pricing</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-1 text-[13px] font-black text-slate-800">Free</div>
            <div className="mb-5 text-[32px] font-black tracking-tight text-slate-900">
              $0 <span className="text-[14px] font-normal text-slate-400">forever</span>
            </div>
            <div className="space-y-2.5">
              {FREE_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2.5 text-[13px] text-slate-600">
                  <span className="text-teal-600">✓</span> {f}
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="mt-6 block rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-[13px] font-bold text-slate-700 transition-colors duration-150 hover:bg-slate-100 active:scale-[0.97]"
              style={{ transition: 'background-color 150ms, transform 100ms' }}
            >
              Start free →
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border border-teal-600 bg-teal-600 p-6 text-white shadow-lg shadow-teal-200">
            <div className="absolute -top-3 right-5 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black text-slate-900">
              Popular
            </div>
            <div className="mb-1 text-[13px] font-black">Pro</div>
            <div className="mb-5 text-[32px] font-black tracking-tight">
              $9 <span className="text-[14px] font-normal text-teal-200">/ month</span>
            </div>
            <div className="space-y-2.5">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2.5 text-[13px] text-teal-50">
                  <span className="text-teal-200">✓</span> {f}
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="mt-6 block rounded-xl bg-white py-2.5 text-center text-[13px] font-black text-teal-700 transition-colors duration-150 hover:bg-teal-50 active:scale-[0.97]"
              style={{ transition: 'background-color 150ms, transform 100ms' }}
            >
              Start Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white px-5 py-5 text-center text-[11px] text-slate-400">
        <span className="mr-3 font-black text-slate-900">Invoice<span className="text-teal-600">Mint</span></span>
        © {new Date().getFullYear()} ·{' '}
        <Link href="/privacy" className="transition-colors hover:text-slate-700">Privacy</Link> ·{' '}
        <Link href="/terms" className="transition-colors hover:text-slate-700">Terms</Link>
      </footer>
    </div>
  )
}
