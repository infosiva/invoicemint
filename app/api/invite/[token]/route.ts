import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token: tokenParam } = await params
  const invite = await db.inviteToken.findUnique({
    where: { token: tokenParam },
    include: { deal: { include: { vendor: { select: { email: true } } } } },
  })

  if (!invite) return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 })
  if (invite.usedAt) return NextResponse.json({ error: 'This invite has already been used' }, { status: 410 })
  if (invite.expiresAt < new Date()) return NextResponse.json({ error: 'Invite link expired' }, { status: 410 })

  return NextResponse.json({
    deal: {
      id: invite.deal.id,
      title: invite.deal.title,
      brief: invite.deal.brief,
      vendorEmail: invite.deal.vendor.email,
    },
    email: invite.email,
  })
}
