'use client'

import { useState } from 'react'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_CLIENT: 'Awaiting client',
  SCOPE_AGREED: 'Scope agreed',
  IN_PROGRESS: 'In progress',
  INVOICED: 'Invoiced',
  PAID: 'Paid',
  DISPUTED: 'Disputed',
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-700 text-slate-300',
  PENDING_CLIENT: 'bg-yellow-900/40 text-yellow-300',
  SCOPE_AGREED: 'bg-blue-900/40 text-blue-300',
  IN_PROGRESS: 'bg-violet-900/40 text-violet-300',
  INVOICED: 'bg-orange-900/40 text-orange-300',
  PAID: 'bg-green-900/40 text-green-300',
  DISPUTED: 'bg-red-900/40 text-red-300',
}

interface DealCardProps {
  deal: {
    id: string
    title: string
    clientEmail: string | null
    status: string
    // Prisma Decimal serialises to a Decimal object — use toString() / Number()
    totalAmount: { toString(): string } | string | number | null | undefined
    createdAt: Date
    _count: { milestones: number; messages: number }
  }
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  if (secs < 604800) return `${Math.floor(secs / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}

export default function DealCard({ deal }: DealCardProps) {
  const [status, setStatus] = useState(deal.status)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleStatusChange(newStatus: string) {
    if (newStatus === status) {
      setEditing(false)
      return
    }
    setSaving(true)
    // Optimistic update
    setStatus(newStatus)
    setEditing(false)
    try {
      await fetch(`/api/deals/${deal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
    } catch {
      // Revert on failure
      setStatus(deal.status)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-violet-800/60 rounded-2xl p-5 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <Link href={`/deal/${deal.id}`} className="flex-1 min-w-0">
          <h3 className="font-bold text-white truncate">{deal.title}</h3>
          {deal.clientEmail && (
            <p className="text-slate-400 text-sm mt-0.5">{deal.clientEmail}</p>
          )}
        </Link>

        {/* Status badge — click to edit */}
        {editing ? (
          <select
            autoFocus
            value={status}
            onChange={e => handleStatusChange(e.target.value)}
            onBlur={() => setEditing(false)}
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-violet-600 text-white focus:outline-none cursor-pointer flex-shrink-0"
          >
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        ) : (
          <button
            onClick={() => setEditing(true)}
            title="Click to change status"
            className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 transition-opacity hover:opacity-80 cursor-pointer ${STATUS_COLORS[status] ?? 'bg-slate-700 text-slate-300'} ${saving ? 'opacity-50' : ''}`}
          >
            {STATUS_LABELS[status] ?? status}
          </button>
        )}
      </div>

      <Link href={`/deal/${deal.id}`} className="block">
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <span>{deal._count.milestones} milestones</span>
          <span>{deal._count.messages} messages</span>
          {deal.totalAmount && (
            <span className="text-slate-300 font-semibold">
              ${Number(deal.totalAmount).toLocaleString()}
            </span>
          )}
          <span className="ml-auto">{timeAgo(deal.createdAt)}</span>
        </div>
      </Link>
    </div>
  )
}
