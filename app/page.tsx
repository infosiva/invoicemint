'use client'

import { useState } from 'react'
import Link from 'next/link'

const STEPS = [
  { icon: '📋', label: 'Create deal', sub: 'AI drafts proposal' },
  { icon: '✍️', label: 'Client approves', sub: 'Scope locks on sign' },
  { icon: '🏁', label: 'Track milestones', sub: 'Upload proof, get approved' },
  { icon: '💳', label: 'Get paid', sub: 'Stripe, instant transfer' },
]

const TABS = ['Scope', 'Milestones', 'Payments', 'Dispute'] as const
type Tab = typeof TABS[number]

const TAB_CONTENT: Record<Tab, { heading: string; body: string; bullets: string[] }> = {
  Scope: {
    heading: 'Lock scope before work starts',
    body: 'Describe the project in plain text. AI drafts full scope with line items. Both sides sign. Scope is locked — extra work requires a signed change order.',
    bullets: ['AI-drafted proposals', 'Mutual sign-off', 'Change order workflow', 'No "I thought it was included"'],
  },
  Milestones: {
    heading: 'Evidence-based milestone approvals',
    body: 'Upload proof for each milestone — screenshots, files, demo links. Client approves per milestone. Next invoice unlocks automatically.',
    bullets: ['Per-milestone proof upload', 'Client approval flow', 'Auto-invoice on approval', 'Full audit trail'],
  },
  Payments: {
    heading: 'Stripe payments, zero friction',
    body: 'InvoiceMint generates a Stripe payment link per invoice. Client pays in browser — no Stripe account needed on their side. Instant transfer.',
    bullets: ['Stripe-powered', 'No client Stripe needed', 'WhatsApp payment alerts', 'Invoice branding (Pro)'],
  },
  Dispute: {
    heading: 'Bulletproof dispute evidence',
    body: 'Signed scope + milestone uploads + full message thread = airtight evidence if a client disputes. Every interaction is timestamped and linked to the deal.',
    bullets: ['Signed scope on record', 'Timestamped milestones', 'Full comms thread', 'Export PDF evidence pack'],
  },
}

const FREE_FEATURES = ['3 active deals', 'Scope + milestone tracking', 'Online payments', 'Deal comms thread']
const PRO_FEATURES = ['Unlimited deals', 'WhatsApp notifications', 'Custom invoice branding', 'AI proposal drafting', 'Dispute evidence trail', 'Priority support']

function DealCardMockup() {
  return (
    <div className="w-full max-w-[360px] rounded-2xl border border-white/[0.08] bg-[#0d0b1a] p-5 shadow-2xl">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[12px] font-bold text-white/60">Brand Redesign</span>
        <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-[10px] font-black text-green-400">Active</span>
      </div>
      {/* Scope items */}
      <div className="mb-3 space-y-1.5">
        {[
          { label: 'Logo design', price: '$800', done: true },
          { label: 'Brand guidelines', price: '$600', done: true },
          { label: 'Website mockup', price: '$1,200', done: false },
        ].map(item => (
          <div key={item.label} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[9px] ${item.done ? 'border-green-500 bg-green-500/20 text-green-400' : 'border-white/20'}`}>
                {item.done ? '✓' : ''}
              </span>
              <span className="text-[11px] text-white/70">{item.label}</span>
            </div>
            <span className="text-[11px] font-bold text-white/50">{item.price}</span>
          </div>
        ))}
      </div>
      {/* Milestone progress */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[10px] text-white/30">
          <span>Milestone progress</span><span className="font-bold text-violet-400">2 / 3</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10">
          <div className="h-1.5 w-[66%] rounded-full bg-violet-500" />
        </div>
      </div>
      {/* Payment status */}
      <div className="flex items-center justify-between rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2">
        <span className="text-[11px] text-white/60">Payment due</span>
        <span className="text-[12px] font-black text-violet-300">$1,400</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Scope')

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 flex h-[52px] items-center justify-between border-b border-white/[0.07] bg-[#0a0a0a]/90 px-5 backdrop-blur-xl">
        <span className="text-[16px] font-black tracking-tight text-[#ede9fe]">
          Invoice<span className="text-violet-400">Mint</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/generate" className="hidden text-[12px] text-white/40 hover:text-white transition-colors sm:block">
            Quick Invoice
          </Link>
          <Link href="/login" className="hidden text-[12px] text-white/40 hover:text-white transition-colors sm:block">
            Log in
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-violet-700 px-3.5 py-1.5 text-[12px] font-bold text-white transition-all duration-150 hover:bg-violet-600 active:scale-[0.97]"
          >
            Get started free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 pt-14 pb-10 lg:grid-cols-2 lg:gap-12 lg:pt-16">
        {/* Left */}
        <div className="flex flex-col justify-center">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            <span className="text-[11px] font-semibold text-green-300">AI invoice generator — free to start</span>
          </div>
          <h1 className="mb-3 text-[clamp(28px,4.5vw,48px)] font-black leading-[1.05] tracking-tight text-[#ede9fe]">
            Create invoices.<br />
            <span className="text-violet-400">Get paid faster.</span><br />
            No disputes.
          </h1>
          <p className="mb-6 text-[14px] leading-relaxed text-white/50">
            AI drafts professional invoices in seconds, tracks milestones, locks scope with client sign-off, and accepts Stripe payments — all in one workspace.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-violet-600 px-7 py-3 text-[14px] font-black text-white transition-all duration-150 hover:bg-violet-500 active:scale-[0.97]"
            >
              Start free →
            </Link>
            <Link
              href="/generate"
              className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-7 py-3 text-[14px] font-bold text-white/60 transition-all duration-150 hover:border-white/20 hover:text-white active:scale-[0.97]"
            >
              Quick invoice
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center justify-center lg:justify-end">
          <DealCardMockup />
        </div>
      </section>

      {/* ── 4-STEP FLOW ── */}
      <div className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 py-0 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3 px-4 py-4">
              <span className="text-xl">{s.icon}</span>
              <div>
                <div className="text-[12px] font-bold text-white/80">{s.label}</div>
                <div className="text-[10px] text-white/35">{s.sub}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="ml-auto hidden text-white/15 sm:block">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── TABBED FEATURES ── */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <p className="mb-4 text-[11px] font-black uppercase tracking-widest text-violet-400">Features</p>
        {/* Tab buttons */}
        <div className="mb-6 flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 w-fit">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-1.5 text-[12px] font-bold transition-all duration-150 ${
                activeTab === tab
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Tab content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col justify-center">
            <h3 className="mb-2 text-[clamp(18px,2.5vw,24px)] font-black tracking-tight text-[#ede9fe]">
              {TAB_CONTENT[activeTab].heading}
            </h3>
            <p className="mb-4 text-[13px] leading-relaxed text-white/50">
              {TAB_CONTENT[activeTab].body}
            </p>
            <div className="space-y-2">
              {TAB_CONTENT[activeTab].bullets.map(b => (
                <div key={b} className="flex items-center gap-2 text-[12px] text-white/60">
                  <span className="text-violet-400">✓</span> {b}
                </div>
              ))}
            </div>
          </div>
          {/* UI mockup card placeholder — consistent with active tab */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[360px] rounded-2xl border border-white/[0.08] bg-[#0d0b1a] p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-violet-500" />
                <span className="text-[11px] font-bold text-white/50">{activeTab} view</span>
              </div>
              <div className="space-y-2">
                {TAB_CONTENT[activeTab].bullets.map((b, i) => (
                  <div key={b} className="flex items-center gap-3 rounded-lg bg-white/[0.04] px-3 py-2.5">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-[9px] font-black text-violet-400">
                      {i + 1}
                    </span>
                    <span className="text-[12px] text-white/60">{b}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/10 p-3 text-[11px] text-violet-300">
                All {activeTab.toLowerCase()} data is timestamped and cryptographically signed.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="mx-auto max-w-3xl px-5 pb-10">
        <p className="mb-4 text-[11px] font-black uppercase tracking-widest text-violet-400">Pricing</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d0b1a] p-6">
            <div className="mb-1 text-[13px] font-black text-[#ede9fe]">Free</div>
            <div className="mb-4 text-[32px] font-black tracking-tight text-[#ede9fe]">
              $0 <span className="text-[14px] font-normal text-white/30">forever</span>
            </div>
            <div className="space-y-2">
              {FREE_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2 text-[12px] text-white/60">
                  <span className="text-violet-400">✓</span> {f}
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="mt-5 block rounded-xl border border-white/[0.08] bg-white/[0.05] py-2.5 text-center text-[13px] font-bold text-white/60 transition-all duration-150 hover:border-white/20 hover:text-white active:scale-[0.97]"
            >
              Start free →
            </Link>
          </div>
          {/* Pro */}
          <div className="relative rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-600 p-6">
            <div className="absolute -top-3 right-5 rounded-full bg-green-400 px-3 py-0.5 text-[10px] font-black text-black">
              Popular
            </div>
            <div className="mb-1 text-[13px] font-black text-white">Pro</div>
            <div className="mb-4 text-[32px] font-black tracking-tight text-white">
              $9 <span className="text-[14px] font-normal text-white/50">/ month</span>
            </div>
            <div className="space-y-2">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2 text-[12px] text-white/80">
                  <span className="text-white/60">✓</span> {f}
                </div>
              ))}
            </div>
            <Link
              href="/login"
              className="mt-5 block rounded-xl bg-white/90 py-2.5 text-center text-[13px] font-black text-violet-700 transition-all duration-150 hover:bg-white active:scale-[0.97]"
            >
              Start Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.07] px-5 py-5 text-center text-[11px] text-white/30">
        <span className="mr-3 font-black text-[#ede9fe]">Invoice<span className="text-violet-400">Mint</span></span>
        © {new Date().getFullYear()} ·{' '}
        <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link> ·{' '}
        <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
      </footer>
    </div>
  )
}
