import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch('http://31.97.56.148:3099/api/stats?site=invoicemint', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return NextResponse.json({ visitors: 0, pageviews: 0 })
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ visitors: 0, pageviews: 0 })
  }
}
