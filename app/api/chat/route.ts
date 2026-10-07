import { sanitizeUserInput } from '@/lib/guard'
import { NextRequest, NextResponse } from 'next/server'
import { CHAT_LIMITER } from '@/lib/rateLimit'

const SYSTEM = "You are InvoiceAI, the assistant for InvoiceMint. Help freelancers create invoices, set payment terms, chase late payments and use scope sign-off and milestones. Be practical and concise. If asked anything outside invoicing and freelance billing, respond: \"I'm trained for InvoiceMint. For that, try Google or ChatGPT!\""
const FALLBACK = "I can't reach the assistant right now. Try the invoice generator above, it works without an account."

type Msg = { role: string; content: string }
// Free-first chain: Groq -> Gemini -> Cerebras. ponytail: sequential tries, no circuit breaker.
const OPENAI_COMPAT = [
  { url: 'https://api.groq.com/openai/v1/chat/completions', key: 'GROQ_API_KEY', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] },
  { url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', key: 'GEMINI_API_KEY', models: ['gemini-2.0-flash'] },
  { url: 'https://api.cerebras.ai/v1/chat/completions', key: 'CEREBRAS_API_KEY', models: ['llama-3.3-70b'] },
]

export async function POST(req: NextRequest) {
  const limited = CHAT_LIMITER.check(req); if (limited) return limited
  try {
    const { messages } = await req.json()
    for (const m of Array.isArray(messages) ? messages : []) if (m && typeof m.content === 'string') m.content = sanitizeUserInput(m.content).text
    const history: Msg[] = Array.isArray(messages) ? messages.slice(-12).map((m: Msg) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content).slice(0, 2000) })) : []
    for (const p of OPENAI_COMPAT) {
      const key = process.env[p.key]
      if (!key) continue
      for (const model of p.models) {
        try {
          const res = await fetch(p.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
            body: JSON.stringify({ model, max_tokens: 400, messages: [{ role: 'system', content: SYSTEM }, ...history] }),
            signal: AbortSignal.timeout(15000),
          })
          if (!res.ok) continue
          const text = (await res.json()).choices?.[0]?.message?.content
          if (text) return NextResponse.json({ text })
        } catch (err) {
          console.warn(`[invoicemint][chat] ${model} failed`, err)
        }
      }
    }
  } catch (err) {
    console.error('[invoicemint][chat]', err)
  }
  return NextResponse.json({ text: FALLBACK })
}
