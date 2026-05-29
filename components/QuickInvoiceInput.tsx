'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function QuickInvoiceInput() {
  const [prompt, setPrompt] = useState('')
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = prompt.trim()
    if (!trimmed) return
    router.push(`/generate?prompt=${encodeURIComponent(trimmed)}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-violet-400/80 mb-1.5">
        ⚡ Quick invoice
      </label>
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder='Try: "Invoice Sarah £2,400 for branding project due July 1"'
          className="flex-1 bg-slate-900/60 border border-slate-700/60 hover:border-violet-600/40 focus:border-violet-500 rounded-xl px-4 py-2.5 text-[13px] text-white placeholder-slate-500 focus:outline-none transition-colors duration-150"
        />
        <button
          type="submit"
          disabled={!prompt.trim()}
          className="bg-violet-700 hover:bg-violet-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold px-4 py-2.5 rounded-xl text-[13px] transition-all duration-150 active:scale-[0.97] flex-shrink-0"
        >
          Go →
        </button>
      </div>
    </form>
  )
}
