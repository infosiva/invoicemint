import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

  const deals = await db.deal.findMany({
    where: {
      vendorId: session.userId,
      status: 'INVOICED',
      updatedAt: { lt: cutoff },
    },
    select: { id: true, title: true, updatedAt: true, totalAmount: true },
    orderBy: { updatedAt: 'asc' },
  })

  return NextResponse.json({ deals, count: deals.length })
}
