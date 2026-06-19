'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Scope', path: 'scope' },
  { label: 'Milestones', path: 'milestones' },
  { label: 'Messages', path: 'messages' },
  { label: 'Invoice', path: 'invoice' },
]

export default function DealTabs({ id }: { id: string }) {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b border-slate-800 mb-8">
      {TABS.map(tab => {
        const isActive = pathname.endsWith(`/${tab.path}`)
        return (
          <Link
            key={tab.path}
            href={`/deal/${id}/${tab.path}`}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors -mb-px border-b-2 ${
              isActive
                ? 'text-white border-violet-500'
                : 'text-slate-400 hover:text-white border-transparent hover:border-slate-600'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
