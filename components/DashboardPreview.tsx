'use client'
import { useEffect, useRef, useState } from 'react'

const PREVIEW_FEATURES = [
  { icon: '📊', label: 'Revenue overview', desc: 'Monthly/annual charts' },
  { icon: '⚡', label: 'Active deals', desc: 'Status + milestone progress' },
  { icon: '🔔', label: 'WhatsApp alerts', desc: 'Payment reminders auto-sent' },
  { icon: '📄', label: 'Custom branding', desc: 'Your logo on every invoice' },
]

export default function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 10
    const y = -((e.clientX - rect.left) / rect.width - 0.5) * 10
    setTilt({ x, y })
  }

  return (
    <section className="mx-auto max-w-4xl px-5 py-14">
      <p className="mb-2 text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--accent, #059669)' }}>
        Pro dashboard
      </p>
      <h2 className="mb-2 text-[clamp(20px,3vw,28px)] font-black tracking-tight text-slate-900">
        See everything. Chase nothing.
      </h2>
      <p className="mb-8 text-[14px] text-slate-500">Upgrade to Pro to unlock your full dashboard.</p>

      <div
        ref={ref}
        onMouseMove={onMouseMove}
        onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        className="rounded-2xl border bg-white p-6 shadow-xl cursor-default"
        style={{
          borderColor: 'var(--border, #a7f3d0)',
          transform: visible
            ? `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : 'perspective(800px) rotateX(6deg)',
          transition: 'transform 400ms cubic-bezier(0.23, 1, 0.32, 1), opacity 400ms',
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Browser chrome */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400" />
          <div className="h-3 w-3 rounded-full bg-amber-400" />
          <div className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="ml-3 text-[11px] text-slate-400">invoicemint.cloud/dashboard</span>
        </div>

        {/* Empty state */}
        <div className="mb-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
          <div className="mb-2 text-2xl">📄</div>
          <p className="text-[14px] font-bold text-slate-700">Create your first invoice</p>
          <p className="mt-1 text-[12px] text-slate-400">
            Revenue, deals, and payment status will appear here
          </p>
        </div>

        {/* Feature hints */}
        <div className="grid grid-cols-2 gap-3">
          {PREVIEW_FEATURES.map(f => (
            <div key={f.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="mb-1 text-lg">{f.icon}</div>
              <div className="text-[12px] font-bold text-slate-700">{f.label}</div>
              <div className="text-[11px] text-slate-400">{f.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <span className="text-[12px] text-slate-400">Unlock full dashboard with Pro — $9/mo</span>
        </div>
      </div>
    </section>
  )
}
