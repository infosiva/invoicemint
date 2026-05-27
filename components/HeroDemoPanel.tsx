'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const STEPS = [
  {
    label: 'AI Proposal',
    icon: '🤖',
    color: 'from-violet-500/20 to-violet-600/10',
    border: 'border-violet-500/30',
    content: (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-violet-300 text-[11px] font-bold uppercase tracking-wider">Generating proposal…</span>
        </div>
        {['Brand identity refresh', 'Logo design × 3 concepts', 'Style guide document', 'Revision rounds × 2'].map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center justify-between bg-white/[0.04] rounded-lg px-3 py-2"
          >
            <span className="text-white/70 text-[11px]">{item}</span>
            <span className="text-violet-300 text-[11px] font-bold">
              {['$800', '$1,200', '$400', 'incl.'][i]}
            </span>
          </motion.div>
        ))}
        <div className="flex justify-between pt-2 border-t border-white/10">
          <span className="text-white/40 text-[11px]">Total</span>
          <span className="text-white font-bold text-sm">$2,400</span>
        </div>
      </div>
    ),
  },
  {
    label: 'Client Signs',
    icon: '✍️',
    color: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/30',
    content: (
      <div className="space-y-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5 flex items-center gap-2">
          <span className="text-emerald-400 text-lg">✅</span>
          <div>
            <p className="text-emerald-300 text-[11px] font-bold">Scope signed by client</p>
            <p className="text-white/40 text-[10px]">sarah@acme.com · just now</p>
          </div>
        </div>
        <div className="bg-white/[0.03] rounded-lg px-3 py-2 text-[11px] text-white/50 italic border border-white/[0.06]">
          "Approved — looks great, let&apos;s get started!"
        </div>
        <div className="flex gap-2">
          {['Scope locked', 'Both parties signed', 'Legally binding'].map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">{t}</span>
          ))}
        </div>
      </div>
    ),
  },
  {
    label: 'Milestone Proof',
    icon: '🏁',
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    content: (
      <div className="space-y-2">
        {[
          { name: 'Logo concepts', status: 'approved', pct: 100 },
          { name: 'Style guide', status: 'pending', pct: 65 },
          { name: 'Final files', status: 'locked', pct: 0 },
        ].map(m => (
          <div key={m.name} className="bg-white/[0.03] rounded-lg px-3 py-2.5 border border-white/[0.06]">
            <div className="flex justify-between mb-1.5">
              <span className="text-white/70 text-[11px]">{m.name}</span>
              <span className={`text-[10px] font-bold ${m.status === 'approved' ? 'text-emerald-400' : m.status === 'pending' ? 'text-amber-400' : 'text-white/30'}`}>
                {m.status}
              </span>
            </div>
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-blue-400"
                initial={{ width: 0 }}
                animate={{ width: `${m.pct}%` }}
                transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    label: 'Paid 💳',
    icon: '💳',
    color: 'from-amber-500/20 to-amber-600/10',
    border: 'border-amber-500/30',
    content: (
      <div className="space-y-3">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-4 text-center"
        >
          <p className="text-amber-300 text-[10px] font-bold uppercase tracking-wider mb-1">Payment received</p>
          <p className="text-white font-black text-3xl tracking-tight">$2,400</p>
          <p className="text-white/40 text-[10px] mt-1">via Stripe · instantly settled</p>
        </motion.div>
        <div className="flex gap-2">
          <div className="flex-1 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.06] text-center">
            <p className="text-white/40 text-[10px]">Deal status</p>
            <p className="text-emerald-400 text-[11px] font-bold">Complete</p>
          </div>
          <div className="flex-1 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/[0.06] text-center">
            <p className="text-white/40 text-[10px]">WhatsApp</p>
            <p className="text-green-400 text-[11px] font-bold">Sent ✓</p>
          </div>
        </div>
      </div>
    ),
  },
]

export default function HeroDemoPanel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(a => (a + 1) % STEPS.length), 3000)
    return () => clearInterval(t)
  }, [])

  const step = STEPS[active]

  return (
    <div className="w-full">
      {/* Step tabs */}
      <div className="flex gap-1.5 mb-3">
        {STEPS.map((s, i) => (
          <button
            key={s.label}
            onClick={() => setActive(i)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              i === active
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:text-white/60'
            }`}
          >
            {s.icon}
          </button>
        ))}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className={`bg-gradient-to-br ${step.color} border ${step.border} rounded-xl p-4 min-h-[180px]`}
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">{step.label}</p>
          {step.content}
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5 mt-3">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-violet-400' : 'w-1.5 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  )
}
