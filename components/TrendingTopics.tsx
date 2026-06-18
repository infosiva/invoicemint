'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Category { category: string; count: number }

export default function TrendingTopics() {
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetch('/api/trending')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {})
  }, [])

  if (categories.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <p className="mb-4 text-[11px] font-black uppercase tracking-widest" style={{ color: 'var(--accent, #059669)' }}>
        Trending invoice types
      </p>
      <div className="flex flex-wrap gap-2">
        {categories.map(c => (
          <Link
            key={c.category}
            href={`/generate?type=${encodeURIComponent(c.category)}`}
            className="rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-colors hover:opacity-80"
            style={{
              borderColor: 'var(--border, #a7f3d0)',
              color: 'var(--accent-2, #047857)',
              background: 'var(--surface-2, #ecfdf5)',
            }}
          >
            {c.category}
            {c.count > 1 && <span className="ml-1 opacity-50">×{c.count}</span>}
          </Link>
        ))}
      </div>
    </section>
  )
}
