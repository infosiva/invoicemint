import { notFound } from 'next/navigation'
import ClientPayment from './ClientPayment'
import MessageThread from './MessageThread'

type Params = { token: string }

export default async function ClientPortalPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { token } = await params
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/client/${token}`, { cache: 'no-store' })

  if (res.status === 404 || res.status === 410) notFound()
  if (!res.ok) throw new Error('Failed to load deal')

  const { deal } = await res.json()

  const fmt = (cents: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
      cents / 100
    )

  const fmtPrice = (value: number) =>
    new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)

  const vendorName = deal.vendor.name ?? deal.vendor.email.split('@')[0]
  const firstDueDate = deal.milestones.find((m: { dueDate: string | null }) => m.dueDate)?.dueDate

  const milestoneColors: Record<string, string> = {
    COMPLETE: 'bg-green-400',
    IN_PROGRESS: 'bg-yellow-400',
    PENDING: 'bg-slate-500',
  }

  const showCTA =
    deal.status === 'PENDING_CLIENT' || deal.status === 'SCOPE_AGREED'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-xl mx-auto px-4 py-10 space-y-8">

        {/* Hero */}
        <div className="space-y-2">
          <p className="text-sm text-slate-400">{vendorName}</p>
          <h1 className="text-3xl font-bold text-white">{deal.title}</h1>
          <p className="text-2xl font-semibold text-violet-400">${fmt(deal.totalAmount)}</p>
          {firstDueDate && (
            <p className="text-sm text-slate-400">
              Due {new Date(firstDueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
          {deal.brief && <p className="text-slate-300 text-sm pt-1">{deal.brief}</p>}
        </div>

        {/* Scope */}
        {deal.scopeItems.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">What&apos;s included</h2>
            <div className="bg-slate-800 rounded-xl p-4 space-y-2">
              {deal.scopeItems.map((item: { id: string; description: string; qty: number; unitPrice: number }) => {
                const lineTotal = item.qty > 1 ? item.qty * item.unitPrice : item.unitPrice
                return (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <span className="text-slate-300 text-sm">
                      {item.qty > 1 ? `${item.qty}× ` : ''}{item.description}
                    </span>
                    <span className="text-white text-sm font-medium whitespace-nowrap">
                      ${fmtPrice(lineTotal)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Milestones */}
        {deal.milestones.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Payment schedule</h2>
            <div className="border-l-2 border-slate-700 pl-4 space-y-4">
              {deal.milestones.map((m: { id: string; title: string; status: string; dueDate: string | null }) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 -ml-[1.375rem] border-2 border-slate-950 ${
                      milestoneColors[m.status] ?? 'bg-slate-500'
                    }`}
                  />
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span className="text-slate-300 text-sm">{m.title}</span>
                    {m.dueDate && (
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {new Date(m.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {deal.status === 'COMPLETE' ? (
          <div className="bg-green-900/30 border border-green-500/40 rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 border-2 border-green-400 mx-auto mb-3">
              <span className="text-green-400 text-xl">&#10003;</span>
            </div>
            <p className="text-green-300 font-semibold">Payment received — thank you!</p>
          </div>
        ) : deal.status === 'CANCELLED' ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center">
            <p className="text-slate-400">This deal has been cancelled.</p>
          </div>
        ) : showCTA ? (
          <div className="bg-slate-900 border border-violet-500/30 rounded-2xl p-6">
            <ClientPayment
              dealId={deal.id}
              token={token}
              amount={deal.totalAmount}
              depositLabel="Approve & Pay"
            />
          </div>
        ) : null}

        {/* Message thread */}
        <MessageThread dealId={deal.id} token={token} messages={deal.messages} />

      </div>
    </div>
  )
}
