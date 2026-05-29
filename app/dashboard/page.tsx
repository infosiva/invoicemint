import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import { db } from '@/lib/db'
import Link from 'next/link'
import DealCard from './DealCard'
import QuickInvoiceInput from '@/components/QuickInvoiceInput'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const overdueCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [deals, dbUser, overdueDeals, revenueThisMonth, nextInvoicedDeal] = await Promise.all([
    db.deal.findMany({
      where: { vendorId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { milestones: true, messages: true } },
      },
    }),
    db.user.findUnique({ where: { id: user.id }, select: { plan: true } }),
    db.deal.count({
      where: {
        vendorId: user.id,
        status: 'INVOICED',
        updatedAt: { lt: overdueCutoff },
      },
    }),
    db.deal.findMany({
      where: {
        vendorId: user.id,
        status: 'PAID',
        updatedAt: { gte: thirtyDaysAgo },
      },
      select: { totalAmount: true },
    }),
    // Next expected payment: earliest INVOICED deal
    db.deal.findFirst({
      where: { vendorId: user.id, status: 'INVOICED' },
      orderBy: { updatedAt: 'asc' },
      select: { id: true, title: true, totalAmount: true, updatedAt: true },
    }),
  ])

  const isPro = dbUser?.plan === 'PRO'
  const atFreeLimit = !isPro && deals.length >= 3

  const paidDeals = deals.filter((d: { status: string }) => d.status === 'PAID')
  const revenue = paidDeals.reduce((sum: number, d: { totalAmount: unknown }) => sum + Number(d.totalAmount ?? 0), 0)
  const revenueMonthTotal = revenueThisMonth.reduce((sum, d) => sum + Number(d.totalAmount ?? 0), 0)

  const activeDeals = deals.filter((d: { status: string }) => ['SCOPE_AGREED', 'IN_PROGRESS'].includes(d.status))
  const recentlyInvoicedCount = deals.filter((d: { status: string; updatedAt: Date }) =>
    d.status === 'INVOICED' && new Date(d.updatedAt) >= sevenDaysAgo
  ).length

  // Find oldest overdue deal for follow-up link
  const oldestOverdueDeal = deals.find((d: { status: string; updatedAt: Date }) =>
    d.status === 'INVOICED' && new Date(d.updatedAt) < overdueCutoff
  )

  // Days since invoiced (used as proxy for "days since sent")
  const nextPaymentDaysAgo = nextInvoicedDeal
    ? Math.floor((Date.now() - new Date(nextInvoicedDeal.updatedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const stats = {
    total: deals.length,
    active: activeDeals.length,
    paid: paidDeals.length,
    revenue,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Your Deals</h1>
          <p className="text-slate-400 text-sm mt-1">Manage proposals, milestones, and payments</p>
        </div>
        <div className="flex items-center gap-2">
          {atFreeLimit ? (
            <Link
              href="/upgrade"
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              Upgrade for more →
            </Link>
          ) : (
            <Link
              href="/deal/new"
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              + New deal
            </Link>
          )}
        </div>
      </div>

      {/* Quick invoice prompt */}
      <QuickInvoiceInput />

      {/* Free plan limit banner */}
      {atFreeLimit && (
        <div className="bg-violet-900/30 border border-violet-700/50 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-violet-300 font-semibold text-sm">Free plan limit reached</p>
            <p className="text-violet-400/70 text-xs mt-0.5">You&apos;ve used all 3 free deals. Upgrade to Pro for unlimited deals.</p>
          </div>
          <Link href="/upgrade" className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex-shrink-0">
            Upgrade $12/mo →
          </Link>
        </div>
      )}

      {/* Overdue alert */}
      {overdueDeals > 0 && (
        <div className="bg-red-900/20 border border-red-700/40 rounded-2xl p-4 mb-4 flex items-center gap-3">
          <span className="text-red-400 text-lg leading-none">⚠</span>
          <p className="text-red-300 text-sm font-semibold">
            {overdueDeals} {overdueDeals === 1 ? 'deal' : 'deals'} overdue —{' '}
            <span className="font-normal text-red-400">invoiced over 14 days ago with no payment</span>
          </p>
        </div>
      )}

      {/* AI nudge strip */}
      {overdueDeals > 0 ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-2.5 mb-6">
          <p className="text-[13px] text-amber-300 font-medium">
            💬 {overdueDeals} invoice{overdueDeals === 1 ? '' : 's'} overdue — send a polite follow-up?
          </p>
          {oldestOverdueDeal && (
            <Link
              href={`/deal/${oldestOverdueDeal.id}`}
              className="flex-shrink-0 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 px-3 py-1.5 text-[11px] font-bold text-amber-300 transition-colors"
            >
              Send Follow-up
            </Link>
          )}
        </div>
      ) : activeDeals.length > 0 && recentlyInvoicedCount === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-2.5 mb-6">
          <p className="text-[13px] text-amber-300/80 font-medium">
            ⚡ {activeDeals.length} active project{activeDeals.length === 1 ? '' : 's'} ready to invoice
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 mb-6">
          <p className="text-[13px] text-white/40 font-medium">
            ✨ Tip: Use voice input to create invoices 3x faster
          </p>
          <Link href="/generate" className="ml-auto flex-shrink-0 text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors">
            Try it →
          </Link>
        </div>
      )}

      {/* Stats — revenue first */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {/* 1. Revenue — most important */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Revenue</p>
          <p className="text-3xl font-black text-green-400">${stats.revenue.toLocaleString()}</p>
          {revenueMonthTotal > 0 && (
            <p className="text-slate-500 text-xs mt-1.5">+${revenueMonthTotal.toLocaleString()} this month</p>
          )}
        </div>
        {/* 2. Next expected payment */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Next Payment</p>
          {nextInvoicedDeal ? (
            <>
              <p className="text-3xl font-black text-white">${Number(nextInvoicedDeal.totalAmount ?? 0).toLocaleString()}</p>
              <p className="text-slate-500 text-xs mt-1.5 truncate" title={nextInvoicedDeal.title}>
                {nextPaymentDaysAgo === 0 ? 'invoiced today' : `${nextPaymentDaysAgo}d since invoiced`}
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-black text-slate-600">—</p>
              <p className="text-slate-600 text-xs mt-1.5">No open invoices</p>
            </>
          )}
        </div>
        {/* 3. Active deals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Active</p>
          <p className="text-3xl font-black text-violet-400">{stats.active}</p>
          <p className="text-slate-500 text-xs mt-1.5">in progress</p>
        </div>
        {/* 4. Total deals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total</p>
          <p className="text-3xl font-black text-white">{stats.total}</p>
          <p className="text-slate-500 text-xs mt-1.5">{stats.paid} paid</p>
        </div>
      </div>

      {/* Deal list */}
      {deals.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <p className="text-slate-400 mb-4">No deals yet.</p>
          <Link href="/deal/new" className="text-violet-400 hover:underline text-sm">Create your first deal →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {deals.map((deal: typeof deals[0]) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}
