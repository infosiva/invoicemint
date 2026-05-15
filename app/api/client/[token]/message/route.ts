import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Parse request body
    let body: string
    try {
      const data = await req.json()
      body = data.body
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Validate: body must be a non-empty string
    if (!body || typeof body !== 'string' || body.trim() === '') {
      return NextResponse.json(
        { error: 'Message body is required and cannot be empty' },
        { status: 400 }
      )
    }

    // Find InviteToken
    const invite = await db.inviteToken.findUnique({
      where: { token },
    })

    if (!invite) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
    }

    // Check if expired
    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 410 }
      )
    }

    // Find or create User by email
    const user = await db.user.upsert({
      where: { email: invite.email },
      update: {},
      create: {
        email: invite.email,
        name: invite.email.split('@')[0],
      },
    })

    // Create Message
    const message = await db.message.create({
      data: {
        dealId: invite.dealId,
        authorId: user.id,
        body: body.trim(),
      },
      include: {
        author: { select: { email: true } },
      },
    })

    return NextResponse.json({ message }, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
