'use client'

import Link from 'next/link'
import InvoiceDemo from '@/components/InvoiceDemo'
import LiveStatsBar from '@/components/LiveStatsBar'
import PlanPreview from '@/components/PlanPreview'
import DashboardPreview from '@/components/DashboardPreview'
import TrendingTopics from '@/components/TrendingTopics'

const STEPS = [
  { n: '1', label: 'Describe the project', sub: 'Plain text, AI structures it' },
  { n: '2', label: 'Client approves scope', sub: 'Sign-off locks the deal' },
  { n: '3', label: 'Track milestones', sub: 'Upload proof, get approved' },
  { n: '4', label: 'Get paid', sub: 'Stripe, instant transfer' },
]

const FEATURE_PILLS = [
  '⚡ AI drafts in seconds',
  '🔒 Scope lock-in',
  '📦 Milestone tracking',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen text-slate-900" style={{ background: 'var(--background, #f8fafc)' }}>
      {/* Sticky navbar */}
      <nav
        className="sticky top-0 z-50 flex h-[52px] items-center justify-between px-5 border-b backdrop-blur-xl"
        style={{
          background: 'rgba(248,250,252,0.9)',
          borderColor: 'var(--border, #a7f3d0)',
        }}
      >
        <span className="text-[16px] font-black tracking-tight text-slate-900">
          Invoice<span style={{ color: 'var(--accent, #059669)' }}>Mint</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/generate" className="hidden text-[12px] text-slate-500 transition-colors hover:text-slate-900 sm:block">
            Quick Invoice
          </Link>
          <Link href="/login" className="hidden text-[12px] text-slate-500 transition-colors hover:text-slate-900 sm:block">
            Log in
          </Link>
          <Link
            href="/generate"
            className="rounded-lg px-3.5 py-1.5 text-[12px] font-bold text-white"
            style={{
              background: 'var(--accent, #059669)',
              transition: 'background-color 150ms, transform 100ms',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-2, #047857)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent, #059669)')}
          >
            Get started free →
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-5 pb-12 pt-14 lg:grid-cols-2 lg:gap-16 lg:pt-20">
        {/* Left */}
        <div className="flex flex-col justify-center">
          {/* Badge */}
          <div
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 border"
            style={{ background: 'var(--surface-2, #ecfdf5)', borderColor: 'var(--border, #a7f3d0)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--accent, #059669)' }} />
            <span className="text-[11px] font-semibold" style={{ color: 'var(--accent, #059669)' }}>
              AI invoicing — free to start
            </span>
          </div>

          {/* H1 — visible on first paint, no opacity:0 */}
          <h1 className="mb-4 text-[clamp(30px,4.5vw,50px)] font-black leading-[1.05] tracking-tight text-slate-900">
            Invoice clients.<br />
            <span style={{ color: 'var(--accent, #059669)' }}>Get paid on time.</span>
          </h1>

          <p className="mb-6 max-w-[420px] text-[15px] leading-relaxed text-slate-500">
            AI drafts your invoice in seconds. Lock scope, track milestones, accept Stripe payments — no disputes, no chasing.
          </p>

          {/* Feature pills */}
          <div className="mb-7 flex flex-wrap gap-2">
            {FEATURE_PILLS.map(pill => (
              <span
                key={pill}
                className="rounded-full px-3 py-1 text-[11px] font-semibold border"
                style={{
                  background: 'var(--surface-2, #ecfdf5)',
                  borderColor: 'var(--border, #a7f3d0)',
                  color: 'var(--accent-2, #047857)',
                }}
              >
                {pill}
              </span>
            ))}
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/generate"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-[14px] font-black text-white shadow-lg"
              style={{
                background: 'var(--accent, #059669)',
                boxShadow: '0 4px 14px rgba(5,150,105,0.35)',
                transition: 'background-color 150ms, transform 100ms',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-2, #047857)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent, #059669)')}
            >
              Create your first invoice →
            </Link>
            <p className="text-[12px] text-slate-400">↗ Try it live on the right — no sign-up needed</p>
          </div>
        </div>

        {/* Right — inline invoice demo (zero auth) */}
        <div className="flex items-center justify-center lg:justify-end">
          <div className="w-full max-w-[420px]">
            <InvoiceDemo />
          </div>
        </div>
      </section>

      {/* ── 4-STEP FLOW ── */}
      <div className="border-y bg-white" style={{ borderColor: '#e2e8f0' }}>
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.label} className="flex items-center gap-3 px-4 py-5">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
                style={{ background: 'var(--accent, #059669)' }}
              >
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

      <LiveStatsBar />
      <TrendingTopics />
      <PlanPreview />
      <DashboardPreview />

      {/* ── FOOTER ── */}
      <footer className="border-t bg-white px-5 py-5 text-center text-[11px] text-slate-400" style={{ borderColor: '#e2e8f0' }}>
        <span className="mr-3 font-black text-slate-900">
          Invoice<span style={{ color: 'var(--accent, #059669)' }}>Mint</span>
        </span>
        © {new Date().getFullYear()} ·{' '}
        <Link href="/privacy" className="transition-colors hover:text-slate-700">Privacy</Link> ·{' '}
        <Link href="/terms" className="transition-colors hover:text-slate-700">Terms</Link>
      </footer>
    </div>
  )
}
