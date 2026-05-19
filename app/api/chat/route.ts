import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

let _groq: Groq | null = null
function groq() { if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY! }); return _groq }

export async function POST(req: NextRequest) {
  try {
    const { messages, system } = await req.json()
    const sysPrompt = system ?? 'You are InvoiceAI — a freelance billing and invoicing expert. Help users create professional invoices, chase late payments, set payment terms, and manage client billing. Be practical and concise.'
    const res = await groq().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: sysPrompt }, ...messages],
      max_tokens: 400,
    })
    return NextResponse.json({ text: res.choices[0]?.message?.content ?? 'Let me help with your invoicing!' })
  } catch {
    return NextResponse.json({ text: 'Create your first invoice above — it\'s free!' }, { status: 200 })
  }
}
