'use client'
import { useState } from 'react'
import Link from 'next/link'

const FREE_FEATURES = ['3 active deals', 'Scope + milestone tracking', 'Online payments', 'Deal comms thread']
const PRO_FEATURES = ['Unlimited deals', 'WhatsApp alerts', 'Custom invoice branding', 'AI proposal drafting', 'Dispute evidence trail', 'Priority support']

export default function PlanPreview() {
  const [promoCode, setPromoCode] = useState('')
  const [promoState, setPromoState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [promoMessage, setPromoMessage] = useState('')

  async function applyPromo() {
    if (!promoCode.trim()) return
    setPromoState('loading')
    try {
      const res = await fetch('/api/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      })
      const data = await res.json()
      if (data.valid) {
        setPromoState('success')
        setPromoMessage(`Pro unlocked for ${data.daysUnlocked} days!`)
      } else {
        setPromoState('error')
        setPromoMessage(data.message || 'Invalid code')
      }
    } catch {
      setPromoState('error')
      setPromoMessage('Something went wrong')
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-14">
      <p className="mb-2 text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--accent, #059669)' }}>
        Pricing
      </p>
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
                <span style={{ color: 'var(--accent, #059669)' }}>✓</span> {f}
              </div>
            ))}
          </div>
          <Link
            href="/login"
            className="mt-6 block rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-center text-[13px] font-bold text-slate-700 hover:bg-slate-100 active:scale-[0.97]"
            style={{ transition: 'background-color 150ms, transform 100ms' }}
          >
            Start free →
          </Link>
        </div>

        {/* Pro */}
        <div
          className="relative rounded-2xl p-6 text-white shadow-lg"
          style={{ background: 'var(--accent, #059669)', boxShadow: '0 8px 30px rgba(5,150,105,0.25)' }}
        >
          <div className="absolute -top-3 right-5 rounded-full bg-amber-400 px-3 py-0.5 text-[10px] font-black text-slate-900">
            Most popular
          </div>
          <div className="mb-1 text-[13px] font-black">Pro</div>
          <div className="mb-5 text-[32px] font-black tracking-tight">
            $9 <span className="text-[14px] font-normal opacity-70">/ month</span>
          </div>
          <div className="space-y-2.5">
            {PRO_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-2.5 text-[13px] opacity-90">
                <span className="opacity-80">✓</span> {f}
              </div>
            ))}
          </div>
          <Link
            href="/login"
            className="mt-6 block rounded-xl bg-white py-2.5 text-center text-[13px] font-black active:scale-[0.97]"
            style={{ color: 'var(--accent-2, #047857)', transition: 'background-color 150ms, transform 100ms' }}
          >
            Start Pro →
          </Link>
        </div>
      </div>

      {/* Promo code */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-[12px] text-slate-400">Have a promo code?</p>
        <div className="flex gap-2">
          <input
            value={promoCode}
            onChange={e => setPromoCode(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && applyPromo()}
            placeholder="Enter code"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-[13px] outline-none focus:border-emerald-400"
            style={{ width: 140 }}
          />
          <button
            onClick={applyPromo}
            disabled={promoState === 'loading'}
            className="rounded-lg px-3 py-1.5 text-[13px] font-bold text-white active:scale-[0.97]"
            style={{ background: 'var(--accent, #059669)', transition: 'opacity 150ms, transform 100ms' }}
          >
            {promoState === 'loading' ? '…' : 'Apply'}
          </button>
        </div>
        {promoMessage && (
          <p className={`text-[12px] font-semibold ${promoState === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
            {promoMessage}
          </p>
        )}
      </div>
    </section>
  )
}
