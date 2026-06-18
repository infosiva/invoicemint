import { NextResponse } from 'next/server'

// Session-scoped counters — real data only, start at 0, no fake baselines
let sessionCounts = { invoicesGenerated: 0, dealsCreated: 0, paymentsProcessed: 0 }

export async function GET() {
  return NextResponse.json(sessionCounts)
}

export async function POST(req: Request) {
  const { event } = await req.json()
  if (event === 'invoice_generated') sessionCounts.invoicesGenerated++
  if (event === 'deal_created') sessionCounts.dealsCreated++
  if (event === 'payment_processed') sessionCounts.paymentsProcessed++
  return NextResponse.json({ ok: true })
}
