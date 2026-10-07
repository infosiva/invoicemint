import { NextRequest, NextResponse } from 'next/server'

// Accepts {type, rating, message, email?, page?, site?}. Never 500s.
export async function POST(req: NextRequest) {
  try {
    const b = await req.json().catch(() => ({}))
    const entry = {
      site: String(b.site ?? 'InvoiceMint').slice(0, 60),
      type: String(b.type ?? 'General').slice(0, 40),
      rating: Number(b.rating) || undefined,
      message: String(b.message ?? b.text ?? '').slice(0, 1000),
      email: b.email ? String(b.email).slice(0, 120) : undefined,
      page: b.page ? String(b.page).slice(0, 200) : undefined,
    }
    console.log('[feedback]', entry)
    const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID
    if (token && chat) {
      const text = `Feedback ${entry.site} [${entry.type}] ${entry.rating ?? '-'}/5\n${entry.message}\n${entry.email ?? ''} ${entry.page ?? ''}`
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chat, text }),
      }).catch(() => {})
    }
  } catch (err) {
    console.warn('[feedback] failed', err)
  }
  return NextResponse.json({ ok: true })
}
