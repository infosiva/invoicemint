import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { from, to, item, amount } = await req.json()
  if (!from || !to || !item || !amount) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }
  const invoice = {
    invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
    date: new Date().toLocaleDateString('en-GB'),
    from: from.trim(),
    to: to.trim(),
    items: [{ description: item.trim(), amount: parseFloat(amount) }],
    total: parseFloat(amount),
    status: 'preview',
  }
  return NextResponse.json(invoice)
}
