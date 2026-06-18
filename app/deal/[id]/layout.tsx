import { redirect, notFound } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { db } from '@/lib/db'
import Link from 'next/link'
import DealTabs from './DealTabs'

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

export default async function DealLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const deal = await db.deal.findFirst({
    where: {
      id,
      OR: [{ vendorId: user.id }, { clientId: user.id }],
    },
  })

  if (!deal) notFound()

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="text-lg font-black tracking-tight">
            Deal<span className="text-violet-400">Flow</span>
          </Link>
          <span className="text-slate-400 text-sm">{user.email}</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
            ← Dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-xl font-black text-white">{deal.title}</h1>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[deal.status] ?? 'bg-slate-700 text-slate-300'}`}>
              {STATUS_LABELS[deal.status] ?? deal.status}
            </span>
          </div>
          {deal.clientEmail && (
            <p className="text-slate-400 text-sm mt-0.5">{deal.clientEmail}</p>
          )}
        </div>

        <DealTabs id={id} />

        {children}
      </div>
    </div>
  )
}
