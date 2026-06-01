'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import HeroDemoPanel from './HeroDemoPanel'
import type { ContentOverrides } from '@/lib/content'

const STEPS = [
  { n: '01', label: 'Create deal' },
  { n: '02', label: 'Client signs' },
  { n: '03', label: 'Milestone proof' },
  { n: '04', label: 'Get paid' },
]

const SOCIAL_PROOF = ['No credit card required', 'Takes 60 seconds', 'Used by 500+ freelancers']

interface Props {
  overrides: ContentOverrides
}

const ease = [0.23, 1, 0.32, 1] as const

export default function HeroClient({ overrides }: Props) {
  const headline = overrides.headline ?? 'Send invoices in 60 seconds. Get paid faster.'
  const subheadline = overrides.subheadline ?? 'DealFlow uses AI to draft invoices, chase payments, and manage your client pipeline — so you can focus on the work, not the admin.'
  const cta = overrides.cta ?? 'Create your first invoice free →'
  const tagline = overrides.tagline ?? 'Faster than Wave · Smarter than HoneyBook'

  return (
    <section className="relative w-full overflow-hidden">
      {/* Bg glows */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div className="absolute -top-[15%] -left-[8%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_70%)] blur-[80px]" />
        <div className="absolute -bottom-[10%] -right-[6%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.10)_0%,transparent_70%)] blur-[90px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6">
        {/* Numbered steps — visible above fold, compact */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease }}
          className="mb-8 flex items-center justify-center gap-0 overflow-x-auto"
        >
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center">
              <div className="flex items-center gap-1.5 px-3 py-1.5">
                <span className="text-[10px] font-black text-violet-500/50">{s.n}</span>
                <span className="text-[11px] font-semibold text-white/50 whitespace-nowrap">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="text-white/20 text-xs">→</span>
              )}
            </div>
          ))}
        </motion.div>

        {/* Split layout */}
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/25 bg-violet-500/10 px-3.5 py-1.5">
              <span className="text-violet-400">✦</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">{tagline}</span>
            </div>

            {/* Headline */}
            <h1 className="mb-4 text-[clamp(28px,4.5vw,48px)] font-black leading-[1.08] tracking-[-1.5px] text-[#ede9fe]">
              {headline.includes('Get paid faster') ? (
                <>
                  Send invoices in 60 seconds.<br />
                  <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Get paid faster.</span>
                </>
              ) : headline}
            </h1>

            {/* Sub */}
            <p className="mb-7 text-[15px] leading-[1.65] text-white/50 max-w-[480px]">
              {subheadline}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mb-5">
              <Link
                href="/login"
                className="inline-flex items-center rounded-xl bg-violet-600 px-6 py-3 text-[13px] font-bold text-white transition-all duration-150 hover:bg-violet-500 active:scale-[0.97]"
              >
                {cta}
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center rounded-xl border border-white/10 bg-white/[0.05] px-6 py-3 text-[13px] font-semibold text-white/60 transition-all duration-150 hover:border-white/20 hover:text-white active:scale-[0.97]"
              >
                See how it works
              </a>
            </div>

            {/* Social proof pills */}
            <div className="mt-5 flex flex-wrap gap-2">
              {SOCIAL_PROOF.map(p => (
                <span
                  key={p}
                  className="rounded-full border border-violet-500/20 bg-violet-500/[0.06] px-3 py-1 text-[11px] font-medium text-violet-300/70"
                >
                  {p}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Right — demo panel (desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease }}
            className="hidden lg:block"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 backdrop-blur-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                  <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                </div>
                <div className="flex-1 rounded bg-white/[0.04] px-3 py-1 text-[10px] text-white/25">invoicemint.app/deals/acme-brand-refresh</div>
              </div>
              <HeroDemoPanel />
            </div>
          </motion.div>
        </div>

        {/* Mobile demo strip — swipeable 4-card snap */}
        <div className="mt-8 lg:hidden">
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { icon: '🤖', label: 'AI Proposal', color: 'border-violet-500/20 bg-violet-500/5', text: 'Describe project. AI writes full scope and line items instantly.' },
              { icon: '✍️', label: 'Client Signs', color: 'border-emerald-500/20 bg-emerald-500/5', text: 'Share link. Client reviews and signs. Scope locks immediately.' },
              { icon: '🏁', label: 'Proof Upload', color: 'border-blue-500/20 bg-blue-500/5', text: 'Upload milestone deliverable. Client approves. Invoice unlocks.' },
              { icon: '💳', label: 'Paid via Stripe', color: 'border-amber-500/20 bg-amber-500/5', text: 'Auto-invoice from milestones. Client pays in browser. Instant.' },
            ].map(c => (
              <div
                key={c.label}
                className={`min-w-[240px] snap-center rounded-xl border p-4 ${c.color}`}
              >
                <div className="mb-2 text-2xl">{c.icon}</div>
                <div className="mb-1 text-[12px] font-bold text-white/80">{c.label}</div>
                <div className="text-[11px] leading-relaxed text-white/40">{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
