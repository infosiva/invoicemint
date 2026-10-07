'use client'

import Link from 'next/link'
import { Logo } from '@/components/Logo'
import InvoiceDemo from '@/components/InvoiceDemo'
import LiveStatsBar from '@/components/LiveStatsBar'
import PlanPreview from '@/components/PlanPreview'
import DashboardPreview from '@/components/DashboardPreview'
import TrendingTopics from '@/components/TrendingTopics'
import { MagneticButton } from "@infosiva/shared-ui/modern";

const STEPS = [
  { n: '1', label: 'Describe the project', sub: 'Plain text, AI structures it' },
  { n: '2', label: 'Client approves scope', sub: 'Sign-off locks the deal' },
  { n: '3', label: 'Track milestones', sub: 'Upload proof, get approved' },
  { n: '4', label: 'Get paid', sub: 'Client pays by card via Stripe' },
]

const FEATURE_PILLS = [
  'AI drafts in seconds',
  'Scope lock-in',
  'Milestone tracking',
]

export default function LandingPage() {
  return (
    <div className="aurora min-h-screen text-slate-900">
      {/* Sticky navbar */}
      <nav
        className="sticky top-0 z-50 flex h-[52px] items-center justify-between px-5 border-b backdrop-blur-xl"
        style={{
          background: 'rgba(255,251,235,0.85)',
          borderColor: 'var(--border, #f1dca0)',
        }}
      >
        <Link href="/" aria-label="InvoiceMint home" className="tap flex items-center gap-2">
          <Logo />
        </Link>
        <div className="flex items-center gap-3">
          <a href="#pricing" className="tap hidden text-[13px] text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex">
            Pricing
          </a>
          <Link href="/login" className="tap hidden text-[13px] text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex">
            Log in
          </Link>
          <Link
            href="/generate"
            className="press tap inline-flex rounded-lg px-3.5 text-[13px] font-bold text-white"
            style={{
              background: 'var(--accent, #a16207)',
              transition: 'background-color 150ms, transform 100ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-2, #854d0e)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent, #a16207)')}
          >
            Get started free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="rise mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 pb-12 pt-10 lg:grid-cols-[5fr_6fr] lg:gap-12 lg:pt-16">
        {/* Left */}
        <div className="flex flex-col justify-center">
          {/* Badge */}
          <div
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 border"
            style={{ background: 'var(--surface-2, #fef6dc)', borderColor: 'var(--border, #f1dca0)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent, #a16207)' }} />
            <span className="text-[11px] font-semibold" style={{ color: 'var(--accent, #a16207)' }}>
              AI invoicing — free to start
            </span>
          </div>

          {/* H1 — visible on first paint, no opacity:0 */}
          <h1 className="mb-4 text-[clamp(30px,4.5vw,50px)] font-black leading-[1.05] tracking-tight text-slate-900">
            Invoice clients.<br />
            <span style={{ color: 'var(--accent, #a16207)' }}>Get paid on time.</span>
          </h1>

          <p className="mb-6 max-w-[420px] text-[15px] leading-relaxed text-slate-600">
            AI drafts your invoice in seconds. Lock scope, track milestones, accept Stripe payments — no disputes, no chasing.
          </p>

          {/* Feature pills */}
          <div className="mb-7 flex flex-wrap gap-2">
            {FEATURE_PILLS.map(pill => (
              <span
                key={pill}
                className="rounded-full px-3 py-1 text-[11px] font-semibold border"
                style={{
                  background: 'var(--surface-2, #fef6dc)',
                  borderColor: 'var(--border, #f1dca0)',
                  color: 'var(--accent-2, #854d0e)',
                }}
              >
                {pill}
              </span>
            ))}
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/generate" style={{ display: 'inline-flex' }}>
            <MagneticButton
              className="rounded-xl px-6 py-3 text-[14px] font-black text-white shadow-lg"
              style={{
                background: 'var(--accent, #a16207)',
                boxShadow: '0 4px 14px rgba(161,98,7,0.35)',
                transition: 'background-color 150ms, transform 100ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-2, #854d0e)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent, #a16207)')}
            >
              Create your first invoice →
            </MagneticButton>
            </Link>
            <p className="text-[12px] text-slate-600">Try it live — no sign-up needed</p>
          </div>
        </div>

        {/* Right — inline invoice demo (zero auth) */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[520px]">
            <InvoiceDemo />
          </div>
        </div>
      </section>

      {/* ── 4-STEP FLOW ── */}
      <div className="border-y bg-white/70 backdrop-blur" style={{ borderColor: 'var(--border, #f1dca0)' }}>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3 px-4 py-5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
                style={{ background: 'var(--accent, #a16207)' }}
              >
                {s.n}
              </span>
              <div>
                <div className="text-[12px] font-bold text-slate-800">{s.label}</div>
                <div className="text-[10px] text-slate-600">{s.sub}</div>
              </div>
              {i < STEPS.length - 1 && (
                <div className="ml-auto hidden text-slate-300 sm:block">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <LiveStatsBar />
      <TrendingTopics />
      <div id="pricing"><PlanPreview /></div>
      <DashboardPreview />

      {/* ── FOOTER ── */}
      <footer className="border-t bg-white/70 px-5 py-6 text-center text-[12px] text-slate-600" style={{ borderColor: 'var(--border, #f1dca0)' }}>
        <span className="mr-3 font-black text-slate-900">
          Invoice<span style={{ color: 'var(--accent, #a16207)' }}>Mint</span>
        </span>
        © {new Date().getFullYear()} ·{' '}
        <Link href="/privacy" className="tap inline-flex px-2 transition-colors hover:text-slate-900">Privacy</Link> ·{' '}
        <Link href="/terms" className="tap inline-flex px-2 transition-colors hover:text-slate-900">Terms</Link>
      </footer>
    </div>
  )
}
