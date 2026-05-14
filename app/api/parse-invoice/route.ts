import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export type ParsedInvoice = {
  clientName: string
  clientEmail: string
  vendorName: string
  lineItems: { description: string; qty: number; unitPrice: number }[]
  discount?: { type: 'percent' | 'fixed'; value: number }
  dueDate: string
  notes: string
  milestones?: { label: string; percent: number }[]
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const SYSTEM = `You are an invoice parser. Extract invoice details from natural language.
Return ONLY valid JSON matching this exact shape — no markdown, no explanation:
{
  "clientName": "string",
  "clientEmail": "string (empty if not mentioned)",
  "vendorName": "string (empty if not mentioned)",
  "lineItems": [{ "description": "string", "qty": number, "unitPrice": number }],
  "discount": { "type": "percent|fixed", "value": number } or null,
  "dueDate": "YYYY-MM-DD (infer from relative terms like 'in 2 weeks'; empty if none)",
  "notes": "string (empty if none)",
  "milestones": [{ "label": "string", "percent": number }] or null
}

Examples:
- "Charge Mark $3k for dev work, 20% deposit" → lineItems:[{description:"Dev work",qty:1,unitPrice:3000}], milestones:[{label:"Deposit",percent:20},{label:"Balance",percent:80}]
- "4 days at $800/day minus 10% discount" → lineItems:[{description:"Day rate",qty:4,unitPrice:800}], discount:{type:"percent",value:10}
- "Logo design $1500, 3 revisions $150 each" → lineItems:[{description:"Logo design",qty:1,unitPrice:1500},{description:"Revision",qty:3,unitPrice:150}]`

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }
    const today = new Date().toISOString().split('T')[0]
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 800,
      messages: [
        { role: 'system', content: SYSTEM + `\nToday is ${today}.` },
        { role: 'user', content: text },
      ],
    })
    const raw = completion.choices[0]?.message?.content ?? '{}'
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON in response')
    const parsed: ParsedInvoice = JSON.parse(match[0])
    return NextResponse.json({ invoice: parsed })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Parse failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
