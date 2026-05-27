import Link from 'next/link'
import HeroSection from '@/components/HeroSection'

const FEATURES = [
  { icon: '📋', title: 'AI-Drafted Proposals', desc: 'Describe in plain text. AI writes full scope and line items.' },
  { icon: '✍️', title: 'Scope Agreement', desc: 'Both sides sign. Scope locks. No "I thought it was included."' },
  { icon: '🏁', title: 'Milestone Tracking', desc: 'Upload proof per milestone. Client approves. Invoice unlocks.' },
  { icon: '🔄', title: 'Change Orders', desc: 'Extra work gets a formal order. Both approve. Evidence stays.' },
  { icon: '💬', title: 'Deal Comms', desc: 'Every revision and approval in one thread — linked to the deal.' },
  { icon: '💳', title: 'Stripe Payments', desc: 'Payment link per invoice. Client pays in browser. Instant.' },
  { icon: '📱', title: 'WhatsApp Alerts', desc: 'Scope approved, payment received — straight to WhatsApp.' },
  { icon: '🛡️', title: 'Dispute Evidence', desc: 'Signed scope + milestones + message trail — bulletproof.' },
]

const STEPS = [
  { n: '01', title: 'Create a deal', desc: 'Add title, brief, client email. AI drafts the proposal.' },
  { n: '02', title: 'Client approves', desc: 'Client reviews line items via link, signs scope.' },
  { n: '03', title: 'Track milestones', desc: 'Upload proof. Client approves each milestone.' },
  { n: '04', title: 'Invoice & get paid', desc: 'Auto-invoice from milestones. Stripe handles payment.' },
]

const COMPARE = [
  { feature: 'Scope agreement (both sign)', xero: false, freshbooks: false },
  { feature: 'Milestone proof uploads', xero: false, freshbooks: false },
  { feature: 'Change order tracking', xero: false, freshbooks: false },
  { feature: 'Per-deal threaded comms', xero: false, freshbooks: 'basic' },
  { feature: 'WhatsApp notifications', xero: false, freshbooks: false },
  { feature: 'Client portal (no login)', xero: false, freshbooks: false },
  { feature: 'AI proposal drafting', xero: false, freshbooks: false },
  { feature: 'Dispute evidence trail', xero: false, freshbooks: false },
]

const FREE_FEATURES = ['3 active deals', 'Scope + milestone tracking', 'Online payments', 'Deal comms thread']
const PRO_FEATURES = ['Unlimited deals', 'WhatsApp notifications', 'Custom invoice branding', 'AI proposal drafting', 'Dispute evidence trail', 'Priority support']

const FAQ = [
  { q: 'What is InvoiceMint?', a: 'InvoiceMint covers the full project lifecycle — AI proposals, scope agreements, milestone tracking, change orders, and Stripe payments. Unlike Xero or FreshBooks, it starts before the invoice.' },
  { q: 'Who uses InvoiceMint?', a: 'Any vendor working on projects: freelancers, agencies, contractors, consultants, home service providers, developers. Clients get their own portal.' },
  { q: 'How does scope agreement work?', a: 'Vendor creates scope line items. Client reviews and approves. Scope locks — extra work requires a signed change order. Eliminates "that wasn\'t included" disputes.' },
  { q: 'Does the client need to sign up?', a: 'Yes — clients create a free account via invite link. Both parties get a shared deal workspace.' },
  { q: 'How does payment work?', a: 'InvoiceMint generates a Stripe payment link per invoice. Client pays in browser. No Stripe account needed on their side.' },
]

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="h-4 w-0.5 rounded-full bg-violet-500" />
      <span className="text-[11px] font-black uppercase tracking-[1.5px] text-violet-400">{children}</span>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#06060f] text-[#ede9fe]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 flex h-[52px] items-center justify-between border-b border-white/[0.07] bg-[#06060f]/88 px-6 backdrop-blur-2xl">
        <span className="text-[17px] font-black tracking-[-0.5px] text-[#ede9fe]">
          Invoice<span className="text-violet-400">Mint</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/generate" className="text-[13px] text-white/40 transition-colors hover:text-white hidden sm:block">
            Quick Invoice
          </Link>
          <Link href="/login" className="text-[13px] text-white/40 transition-colors hover:text-white hidden sm:block">
            Log in
          </Link>
          <Link
            href="/login"
            className="rounded-[9px] bg-violet-700 px-3.5 py-1.5 text-[12px] font-bold text-white transition-all duration-150 hover:bg-violet-600 active:scale-[0.97]"
          >
            Get started free →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <HeroSection />

      {/* Trust bar */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-4">
          {[['✅', 'No signup required'], ['🔒', 'Secure & encrypted'], ['⚡', 'Instant results'], ['🆓', 'Free to start']].map(([icon, label]) => (
            <div key={label} className="bg-[#0d0b1a] py-4 text-center">
              <div className="text-xl">{icon}</div>
              <div className="mt-1 text-[11px] text-white/40">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto mb-16 max-w-6xl px-4 sm:px-6">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="mb-1 text-[clamp(20px,3vw,26px)] font-black tracking-[-0.5px] text-[#ede9fe]">From lead to paid in 4 steps</h2>
        <p className="mb-6 text-[13px] text-white/40">Under 10 minutes to set up your first deal.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEPS.map(s => (
            <div key={s.n} className="rounded-2xl border border-white/[0.07] bg-[#0d0b1a] p-5">
              <div className="mb-2 text-[28px] font-black leading-none tracking-[-1px] text-violet-500/20">{s.n}</div>
              <h3 className="mb-1.5 text-[13px] font-bold text-[#ede9fe]">{s.title}</h3>
              <p className="text-[11px] leading-relaxed text-white/40">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto mb-16 max-w-6xl px-4 sm:px-6">
        <SectionLabel>Features</SectionLabel>
        <h2 className="mb-1 text-[clamp(20px,3vw,26px)] font-black tracking-[-0.5px] text-[#ede9fe]">Everything vendors and clients need</h2>
        <p className="mb-6 text-[13px] text-white/40">All industries. Any project size.</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="rounded-xl border border-white/[0.07] bg-[#0d0b1a] p-4 transition-colors duration-150 hover:border-violet-500/20"
            >
              <div className="mb-2 text-xl">{f.icon}</div>
              <h3 className="mb-1 text-[12px] font-bold text-[#ede9fe]">{f.title}</h3>
              <p className="text-[11px] leading-relaxed text-white/40">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="mx-auto mb-16 max-w-3xl px-4 sm:px-6">
        <SectionLabel>vs competitors</SectionLabel>
        <h2 className="mb-1 text-[clamp(20px,3vw,26px)] font-black tracking-[-0.5px] text-[#ede9fe]">Why not just use Xero or FreshBooks?</h2>
        <p className="mb-6 text-[13px] text-white/40">They handle invoices. We handle the entire deal.</p>
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d0b1a]">
          <div className="grid grid-cols-[1fr_80px_100px_90px] border-b border-white/[0.07] bg-white/[0.03] px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-white/30">
            <span>Feature</span>
            <span className="text-center">Xero</span>
            <span className="text-center">FreshBooks</span>
            <span className="text-center text-violet-400">InvoiceMint</span>
          </div>
          {COMPARE.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-[1fr_80px_100px_90px] border-t border-white/[0.06] px-4 py-2.5 text-[11px] ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}
            >
              <span className="text-white/60">{row.feature}</span>
              <span className="text-center">{row.xero ? '✅' : '❌'}</span>
              <span className="text-center">{row.freshbooks === 'basic' ? '⚠️' : row.freshbooks ? '✅' : '❌'}</span>
              <span className="text-center font-bold text-violet-400">✅</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto mb-16 max-w-2xl px-4 sm:px-6">
        <SectionLabel>Pricing</SectionLabel>
        <h2 className="mb-1 text-[clamp(20px,3vw,26px)] font-black tracking-[-0.5px] text-[#ede9fe]">Simple pricing</h2>
        <p className="mb-6 text-[13px] text-white/40">Start free. Upgrade when you need more.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Free */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#0d0b1a] p-7">
            <div className="mb-1 text-[13px] font-black text-[#ede9fe]">Free</div>
            <div className="mb-5 text-[30px] font-black tracking-[-1px] text-[#ede9fe]">
              $0 <span className="text-[14px] font-normal text-white/30">forever</span>
            </div>
            {FREE_FEATURES.map(f => (
              <div key={f} className="mb-2 flex items-center gap-2.5 text-[12px] text-white/60">
                <span className="text-violet-400">✓</span> {f}
              </div>
            ))}
            <Link
              href="/login"
              className="mt-5 block rounded-xl border border-white/[0.08] bg-white/[0.05] py-3 text-center text-[13px] font-bold text-white/60 transition-all duration-150 hover:border-white/20 hover:text-white active:scale-[0.97]"
            >
              Start free →
            </Link>
          </div>
          {/* Pro */}
          <div className="relative rounded-2xl bg-gradient-to-br from-violet-700 to-indigo-600 p-7">
            <div className="absolute -top-3 right-5 rounded-full bg-green-400 px-3 py-0.5 text-[10px] font-black text-black">
              Popular
            </div>
            <div className="mb-1 text-[13px] font-black text-white">Pro</div>
            <div className="mb-5 text-[30px] font-black tracking-[-1px] text-white">
              $12 <span className="text-[14px] font-normal text-white/50">/ month</span>
            </div>
            {PRO_FEATURES.map(f => (
              <div key={f} className="mb-2 flex items-center gap-2.5 text-[12px] text-white/80">
                <span className="text-white/60">✓</span> {f}
              </div>
            ))}
            <Link
              href="/login"
              className="mt-5 block rounded-xl bg-white/90 py-3 text-center text-[13px] font-black text-violet-700 transition-all duration-150 hover:bg-white active:scale-[0.97]"
            >
              Start Pro →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mb-16 max-w-2xl px-4 sm:px-6">
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="mb-6 text-[clamp(20px,3vw,26px)] font-black tracking-[-0.5px] text-[#ede9fe]">Frequently asked questions</h2>
        <div className="space-y-2">
          {FAQ.map(({ q, a }) => (
            <details
              key={q}
              className="group overflow-hidden rounded-xl border border-white/[0.07] bg-[#0d0b1a]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[13px] font-bold text-[#ede9fe]">
                {q}
                <span className="text-white/30 text-sm group-open:rotate-180 transition-transform duration-200">↓</span>
              </summary>
              <p className="px-5 pb-4 text-[12px] leading-relaxed text-white/50">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mb-16 max-w-2xl px-4 sm:px-6">
        <div className="rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-500/[0.06] p-12 text-center">
          <h2 className="mb-3 text-[clamp(20px,3vw,28px)] font-black tracking-[-0.5px] text-[#ede9fe]">
            Stop losing deals to scope disputes
          </h2>
          <p className="mb-7 text-[14px] text-white/40">Start with 3 free deals. No credit card. No password.</p>
          <Link
            href="/login"
            className="inline-flex items-center rounded-xl bg-violet-600 px-8 py-3.5 text-[14px] font-black text-white transition-all duration-150 hover:bg-violet-500 active:scale-[0.97]"
          >
            Create your first deal →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.07] px-5 py-6 text-center text-[11px] text-white/30">
        <div className="mb-1.5 text-[14px] font-black text-[#ede9fe]">
          Invoice<span className="text-violet-400">Mint</span>
        </div>
        <p>Vendor-client platform — proposals, milestones, payments.</p>
        <p className="mt-1">
          © {new Date().getFullYear()} InvoiceMint ·{' '}
          <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link> ·{' '}
          <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
        </p>
      </footer>
    </div>
  )
}
