import Link from 'next/link'

const T = {
  bg: '#06060f',
  s1: '#0d0b1a',
  s2: '#13102a',
  border: 'rgba(255,255,255,0.07)',
  border2: 'rgba(139,92,246,0.25)',
  text: '#ede9fe',
  muted: 'rgba(255,255,255,0.38)',
  violet: '#8b5cf6',
  violet2: '#7c3aed',
  indigo: '#6366f1',
  green: '#4ade80',
}

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

export default function LandingPage() {
  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: 'Inter,system-ui,sans-serif', minHeight: '100vh' }}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        a{text-decoration:none}
        .nav{position:sticky;top:0;z-index:50;background:rgba(6,6,15,0.88);backdrop-filter:blur(16px);border-bottom:1px solid ${T.border};padding:0 24px;height:52px;display:flex;align-items:center;justify-content:space-between}
        .logo{font-size:17px;font-weight:900;letter-spacing:-0.5px;color:#ede9fe}
        .logo span{color:${T.violet}}
        .nav-links{display:flex;align-items:center;gap:12px}
        .nav-link{color:${T.muted};font-size:13px;transition:color 0.15s}
        .nav-link:hover{color:#fff}
        .btn-primary{background:${T.violet2};color:#fff;font-size:13px;font-weight:700;padding:8px 18px;border-radius:10px;border:none;cursor:pointer;transition:opacity 0.15s;display:inline-flex;align-items:center}
        .btn-primary:hover{opacity:0.85}
        .btn-ghost{background:rgba(255,255,255,0.06);border:1px solid ${T.border};color:rgba(255,255,255,0.6);font-size:13px;font-weight:600;padding:8px 18px;border-radius:10px;cursor:pointer;transition:all 0.15s;display:inline-flex;align-items:center}
        .btn-ghost:hover{color:#fff;background:rgba(255,255,255,0.1)}
        .w{max-width:1100px;margin:0 auto;padding:0 20px}
        .hero{padding:52px 20px 40px;text-align:center;max-width:820px;margin:0 auto}
        .badge{display:inline-flex;align-items:center;gap:6px;background:rgba(139,92,246,0.12);border:1px solid rgba(139,92,246,0.25);border-radius:100px;padding:5px 14px;font-size:11px;font-weight:700;color:${T.violet};margin-bottom:20px;letter-spacing:0.3px}
        h1{font-size:clamp(28px,5vw,50px);font-weight:900;line-height:1.1;letter-spacing:-1px;margin-bottom:14px;color:#ede9fe}
        h1 span{background:linear-gradient(135deg,${T.violet},${T.indigo});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .sub{color:${T.muted};font-size:16px;line-height:1.6;margin-bottom:24px;max-width:560px;margin-left:auto;margin-right:auto}
        .hero-btns{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:8px}
        .btn-big{font-size:14px;font-weight:800;padding:13px 28px;border-radius:12px}
        .micro{font-size:11px;color:rgba(255,255,255,0.3);margin-top:8px}
        .pills{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:24px}
        .pill{background:${T.s1};border:1px solid ${T.border};border-radius:100px;padding:5px 12px;font-size:11px;color:rgba(255,255,255,0.5);font-weight:500}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:${T.border};border:1px solid ${T.border};border-radius:14px;overflow:hidden;margin:0 20px 44px}
        .stat{background:${T.s1};padding:18px 16px;text-align:center}
        .stat-n{font-size:22px;font-weight:900;color:${T.violet};letter-spacing:-0.5px}
        .stat-l{font-size:11px;color:${T.muted};margin-top:2px}
        .sh{display:flex;align-items:center;gap:10px;margin-bottom:18px}
        .sh-bar{width:3px;height:18px;border-radius:2px;background:${T.violet}}
        .sh-label{font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${T.violet}}
        h2{font-size:clamp(20px,3vw,26px);font-weight:900;letter-spacing:-0.5px;margin-bottom:6px;color:#ede9fe}
        .steps-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .step{background:${T.s1};border:1px solid ${T.border};border-radius:14px;padding:20px 18px}
        .step-n{font-size:28px;font-weight:900;color:rgba(139,92,246,0.25);letter-spacing:-1px}
        .step h3{font-size:14px;font-weight:800;color:#ede9fe;margin:6px 0 4px}
        .step p{font-size:12px;color:${T.muted};line-height:1.5}
        .feat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
        .feat{background:${T.s1};border:1px solid ${T.border};border-radius:12px;padding:16px;transition:border-color 0.15s}
        .feat:hover{border-color:rgba(139,92,246,0.3)}
        .feat-icon{font-size:20px;margin-bottom:8px}
        .feat h3{font-size:12px;font-weight:800;color:#ede9fe;margin-bottom:4px}
        .feat p{font-size:11px;color:${T.muted};line-height:1.5}
        .table-wrap{background:${T.s1};border:1px solid ${T.border};border-radius:14px;overflow:hidden}
        .table-head{display:grid;grid-template-columns:1fr 80px 100px 90px;background:rgba(255,255,255,0.03);padding:10px 16px;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:${T.muted}}
        .table-row{display:grid;grid-template-columns:1fr 80px 100px 90px;padding:10px 16px;font-size:12px;border-top:1px solid ${T.border}}
        .table-row:nth-child(odd){background:rgba(255,255,255,0.01)}
        .tc{text-align:center}
        .tc-v{text-align:center;color:${T.violet};font-weight:700}
        .plan-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .plan{background:${T.s1};border:1px solid ${T.border};border-radius:16px;padding:28px}
        .plan.pro{background:linear-gradient(135deg,${T.violet2},${T.indigo});border-color:transparent}
        .plan-price{font-size:30px;font-weight:900;letter-spacing:-1px;margin:6px 0 16px}
        .plan-price span{font-size:14px;font-weight:400;opacity:0.5}
        .plan-feat{font-size:12px;margin-bottom:8px;display:flex;align-items:center;gap:8px}
        .plan-btn{display:block;width:100%;text-align:center;padding:12px;border-radius:12px;font-size:13px;font-weight:800;margin-top:20px;transition:opacity 0.15s}
        .plan-btn:hover{opacity:0.85}
        .plan-btn-free{background:rgba(255,255,255,0.06);border:1px solid ${T.border};color:rgba(255,255,255,0.7)}
        .plan-btn-pro{background:rgba(255,255,255,0.9);color:${T.violet2}}
        .popular{position:absolute;top:-10px;right:20px;background:${T.green};color:#000;font-size:10px;font-weight:800;padding:3px 10px;border-radius:100px}
        .faq{border:1px solid ${T.border};border-radius:12px;overflow:hidden;margin-bottom:8px}
        .faq summary{padding:14px 18px;font-size:13px;font-weight:700;cursor:pointer;display:flex;justify-content:space-between;list-style:none;color:#ede9fe}
        .faq p{padding:0 18px 14px;font-size:12px;color:${T.muted};line-height:1.7}
        .cta-box{background:linear-gradient(135deg,rgba(139,92,246,0.12),rgba(99,102,241,0.08));border:1px solid rgba(139,92,246,0.2);border-radius:20px;padding:48px 32px;text-align:center}
        footer{border-top:1px solid ${T.border};padding:24px 20px;text-align:center;font-size:11px;color:${T.muted}}
        footer a{color:${T.muted};transition:color 0.15s}
        footer a:hover{color:#fff}
        section{padding:0 20px;margin-bottom:52px}
        @media(max-width:840px){
          .stats{grid-template-columns:repeat(2,1fr)}
          .steps-grid{grid-template-columns:repeat(2,1fr)}
          .feat-grid{grid-template-columns:repeat(2,1fr)}
          .plan-grid{grid-template-columns:1fr}
          .table-head,.table-row{grid-template-columns:1fr 60px 80px 70px;font-size:10px;padding:8px 12px}
        }
        @media(max-width:480px){
          .nav-links .nav-link{display:none}
          .stats{grid-template-columns:repeat(2,1fr)}
          .feat-grid{grid-template-columns:1fr 1fr}
          .steps-grid{grid-template-columns:1fr 1fr}
          .hero{padding:36px 16px 28px}
          .table-head .tc:nth-child(2),.table-row .tc:nth-child(2){display:none}
          .table-head,.table-row{grid-template-columns:1fr 80px 70px}
        }
      `}</style>

      {/* Nav */}
      <nav className="nav">
        <span className="logo">Deal<span>Flow</span></span>
        <div className="nav-links">
          <Link href="/generate" className="nav-link">Quick Invoice</Link>
          <Link href="/login" className="nav-link">Log in</Link>
          <Link href="/login" className="btn-primary" style={{ fontSize: 12, padding: '7px 14px', borderRadius: 9 }}>Get started free →</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="badge">✦ The platform Xero & FreshBooks never built</div>
        <h1>Scope it. Prove it.<br /><span>Get paid.</span></h1>
        <p className="sub">One shared workspace — AI proposals, signed scope, milestone proofs, change orders, Stripe payments. No more invoice disputes.</p>
        <div className="hero-btns">
          <Link href="/login" className="btn-primary btn-big">Start free — 3 deals included →</Link>
          <a href="#how-it-works" className="btn-ghost btn-big">See how it works</a>
        </div>
        <Link href="/create" style={{ fontSize: 12, color: T.muted, display: 'inline-block', marginTop: 10 }}>Create free invoice →</Link>
        <p className="micro">No credit card · No password · Free forever for 3 deals</p>
        <div className="pills">
          {['✅ Scope disputes eliminated','📎 Milestone proof uploads','💬 WhatsApp alerts','🛡️ Dispute evidence trail','🤖 AI proposals'].map(p => (
            <span key={p} className="pill">{p}</span>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="w">
        <div className="stats">
          {[['10k+','Deals managed'],['$2M+','Invoiced'],['0','Dispute losses'],['4.9★','Rating']].map(([n,l]) => (
            <div key={l} className="stat"><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <section id="how-it-works">
        <div className="w">
          <div className="sh"><div className="sh-bar"/><div className="sh-label">How it works</div></div>
          <h2>From lead to paid in 4 steps</h2>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>Under 10 minutes to set up your first deal.</p>
          <div className="steps-grid">
            {STEPS.map(s => (
              <div key={s.n} className="step">
                <div className="step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section>
        <div className="w">
          <div className="sh"><div className="sh-bar"/><div className="sh-label">Features</div></div>
          <h2>Everything vendors and clients need</h2>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>All industries. Any project size.</p>
          <div className="feat-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feat">
                <div className="feat-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section>
        <div className="w" style={{ maxWidth: 760 }}>
          <div className="sh"><div className="sh-bar"/><div className="sh-label">vs competitors</div></div>
          <h2>Why not just use Xero or FreshBooks?</h2>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>They handle invoices. We handle the entire deal.</p>
          <div className="table-wrap">
            <div className="table-head">
              <span>Feature</span>
              <span className="tc">Xero</span>
              <span className="tc">FreshBooks</span>
              <span className="tc" style={{ color: T.violet }}>DealFlow</span>
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.feature} className="table-row">
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>{row.feature}</span>
                <span className="tc">{row.xero ? '✅' : '❌'}</span>
                <span className="tc">{row.freshbooks === 'basic' ? '⚠️' : row.freshbooks ? '✅' : '❌'}</span>
                <span className="tc-v">✅</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section>
        <div className="w" style={{ maxWidth: 680 }}>
          <div className="sh"><div className="sh-bar"/><div className="sh-label">Pricing</div></div>
          <h2>Simple pricing</h2>
          <p style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>Start free. Upgrade when you need more.</p>
          <div className="plan-grid">
            <div className="plan">
              <div style={{ fontSize: 13, fontWeight: 900, color: '#ede9fe' }}>Free</div>
              <div className="plan-price">$0 <span>forever</span></div>
              {['3 active deals','Scope + milestone tracking','Online payments','Deal comms thread'].map(f => (
                <div key={f} className="plan-feat"><span style={{ color: T.violet }}>✓</span><span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>{f}</span></div>
              ))}
              <Link href="/login" className="plan-btn plan-btn-free">Start free →</Link>
            </div>
            <div className="plan pro" style={{ position: 'relative' }}>
              <div className="popular">Popular</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>Pro</div>
              <div className="plan-price" style={{ color: '#fff' }}>$12 <span style={{ color: 'rgba(255,255,255,0.6)' }}>/ month</span></div>
              {['Unlimited deals','WhatsApp notifications','Custom invoice branding','AI proposal drafting','Dispute evidence trail','Priority support'].map(f => (
                <div key={f} className="plan-feat"><span style={{ color: 'rgba(255,255,255,0.7)' }}>✓</span><span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>{f}</span></div>
              ))}
              <Link href="/login" className="plan-btn plan-btn-pro">Start Pro →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <div className="w" style={{ maxWidth: 680 }}>
          <div className="sh"><div className="sh-bar"/><div className="sh-label">FAQ</div></div>
          <h2>Frequently asked questions</h2>
          <div style={{ marginTop: 20 }}>
            {[
              { q: 'What is DealFlow?', a: 'DealFlow covers the full project lifecycle — AI proposals, scope agreements, milestone tracking, change orders, and Stripe payments. Unlike Xero or FreshBooks, it starts before the invoice.' },
              { q: 'Who uses DealFlow?', a: 'Any vendor working on projects: freelancers, agencies, contractors, consultants, home service providers, developers. Clients get their own portal.' },
              { q: 'How does scope agreement work?', a: 'Vendor creates scope line items. Client reviews and approves. Scope locks — extra work requires a signed change order. Eliminates "that wasn\'t included" disputes.' },
              { q: 'Does the client need to sign up?', a: 'Yes — clients create a free account via invite link. Both parties get a shared deal workspace.' },
              { q: 'How does payment work?', a: 'DealFlow generates a Stripe payment link per invoice. Client pays in browser. No Stripe account needed on their side.' },
            ].map(({ q, a }) => (
              <details key={q} className="faq">
                <summary>{q} <span style={{ color: T.muted, fontSize: 14 }}>↓</span></summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="w" style={{ maxWidth: 680 }}>
          <div className="cta-box">
            <h2 style={{ marginBottom: 10 }}>Stop losing deals to scope disputes</h2>
            <p style={{ fontSize: 14, color: T.muted, marginBottom: 24 }}>Start with 3 free deals. No credit card. No password.</p>
            <Link href="/login" className="btn-primary btn-big">Create your first deal →</Link>
          </div>
        </div>
      </section>

      <footer>
        <div style={{ fontWeight: 900, color: '#ede9fe', fontSize: 14, marginBottom: 6 }}>Deal<span style={{ color: T.violet }}>Flow</span></div>
        <p>Vendor-client platform — proposals, milestones, payments.</p>
        <p style={{ marginTop: 4 }}>© {new Date().getFullYear()} DealFlow · <a href="/privacy">Privacy</a> · <a href="/terms">Terms</a></p>
      </footer>
    </div>
  )
}
