import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ['DRAFT', 'PENDING_CLIENT', 'SCOPE_AGREED', 'IN_PROGRESS', 'INVOICED', 'PAID', 'DISPUTED']
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Ensure deal belongs to this vendor
  const existing = await db.deal.findUnique({
    where: { id },
    select: { vendorId: true },
  })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (existing.vendorId !== session.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const deal = await db.deal.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ deal })
}
