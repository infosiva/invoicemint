'use client'
import { useEffect, useState } from 'react'

interface Stats { invoicesGenerated: number; dealsCreated: number; paymentsProcessed: number }

export default function LiveStatsBar() {
  const [stats, setStats] = useState<Stats>({ invoicesGenerated: 0, dealsCreated: 0, paymentsProcessed: 0 })

  useEffect(() => {
    fetch('/api/session-stats').then(r => r.json()).then(setStats).catch(() => {})
    const t = setInterval(() => {
      fetch('/api/session-stats').then(r => r.json()).then(setStats).catch(() => {})
    }, 30000)
    return () => clearInterval(t)
  }, [])

  if (stats.invoicesGenerated === 0 && stats.dealsCreated === 0 && stats.paymentsProcessed === 0) return null

  const items = [
    { label: 'Invoices generated', value: stats.invoicesGenerated },
    { label: 'Deals created', value: stats.dealsCreated },
    { label: 'Payments processed', value: stats.paymentsProcessed },
  ].filter(i => i.value > 0)

  return (
    <div className="border-y py-3 px-5" style={{ background: 'var(--surface-2, #ecfdf5)', borderColor: 'var(--border, #a7f3d0)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-8 flex-wrap">
        {items.map(item => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-[18px] font-black tabular-nums" style={{ color: 'var(--accent, #059669)' }}>
              {item.value.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">{item.label} this session</span>
          </div>
        ))}
      </div>
    </div>
  )
}
