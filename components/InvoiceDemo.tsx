'use client'

import { useState } from 'react'
import Link from 'next/link'

interface InvoiceItem {
  description: string
  amount: number
}

interface Invoice {
  invoiceNumber: string
  date: string
  from: string
  to: string
  items: InvoiceItem[]
  total: number
  status: string
}

export default function InvoiceDemo() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!from || !to || !item || !amount) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/preview-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, item, amount }),
      })
      if (!res.ok) throw new Error('Failed to generate preview')
      const data: Invoice = await res.json()
      setInvoice(data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/60">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          Try it — no sign-up needed
        </span>
      </div>

      {!invoice ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                From
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={from}
                onChange={e => setFrom(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 transition-colors duration-150"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                To
              </label>
              <input
                type="text"
                placeholder="Client name"
                value={to}
                onChange={e => setTo(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 transition-colors duration-150"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Item description
            </label>
            <input
              type="text"
              placeholder="e.g. Logo design, 3 concepts"
              value={item}
              onChange={e => setItem(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 transition-colors duration-150"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Amount ($)
            </label>
            <input
              type="number"
              placeholder="e.g. 1200"
              min="1"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-800 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-200 transition-colors duration-150"
            />
          </div>
          {error && <p className="text-[11px] text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 py-2.5 text-[13px] font-black text-white transition-colors duration-150 hover:bg-teal-700 active:scale-[0.97] disabled:opacity-60"
            style={{ transition: 'background-color 150ms, transform 100ms' }}
          >
            {loading ? 'Generating…' : 'Preview invoice →'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Invoice preview card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="text-[16px] font-black text-teal-600">Invoice<span className="text-slate-800">Mint</span></div>
                <div className="mt-0.5 text-[10px] text-slate-400">#{invoice.invoiceNumber}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Date</div>
                <div className="text-[12px] font-bold text-slate-700">{invoice.date}</div>
              </div>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">From</div>
                <div className="text-[12px] font-bold text-slate-800">{invoice.from}</div>
              </div>
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">To</div>
                <div className="text-[12px] font-bold text-slate-800">{invoice.to}</div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="grid grid-cols-[1fr_auto] gap-2 border-b border-slate-100 px-3 py-1.5">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Description</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Amount</span>
              </div>
              {invoice.items.map((li, i) => (
                <div key={i} className="grid grid-cols-[1fr_auto] gap-2 px-3 py-2.5">
                  <span className="text-[12px] text-slate-700">{li.description}</span>
                  <span className="text-[12px] font-bold text-slate-800">
                    ${li.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-b-lg bg-teal-600 px-3 py-2">
                <span className="text-[11px] font-semibold text-teal-100">Total</span>
                <span className="text-[15px] font-black text-white">
                  ${invoice.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-600 border border-amber-200">
                Preview only
              </span>
              <span className="text-[10px] text-slate-400">Sign in to save, send & get paid</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/login"
              className="block w-full rounded-xl bg-teal-600 py-2.5 text-center text-[13px] font-black text-white transition-colors duration-150 hover:bg-teal-700 active:scale-[0.97]"
              style={{ transition: 'background-color 150ms, transform 100ms' }}
            >
              Save &amp; Export PDF →
            </Link>
            <button
              onClick={() => setInvoice(null)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 text-[12px] font-semibold text-slate-500 transition-colors duration-150 hover:bg-slate-100 active:scale-[0.97]"
              style={{ transition: 'background-color 150ms, transform 100ms' }}
            >
              ← Try another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
