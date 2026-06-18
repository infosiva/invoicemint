import { NextRequest, NextResponse } from 'next/server'

interface TopicEntry { category: string; count: number; lastSeen: number }
const generatedCategories: Map<string, TopicEntry> = new Map()

export function logCategory(category: string) {
  const existing = generatedCategories.get(category)
  if (existing) {
    existing.count++
    existing.lastSeen = Date.now()
  } else {
    generatedCategories.set(category, { category, count: 1, lastSeen: Date.now() })
  }
}

export async function GET() {
  const sorted = Array.from(generatedCategories.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)
  return NextResponse.json({ categories: sorted })
}

export async function POST(req: NextRequest) {
  const { category } = await req.json()
  if (category) logCategory(category)
  return NextResponse.json({ ok: true })
}
