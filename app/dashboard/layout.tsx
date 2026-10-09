import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/session'
import Logo from '@/components/Logo'
import { DashboardShell } from '@/components/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-950 text-white" style={{ ['--bg' as string]: '#020617', ['--fg' as string]: '#f8fafc', ['--accent' as string]: '#fbbf24' }}>
      <DashboardShell
        brand={<Logo />}
        nav={[
          { href: '/dashboard', label: 'Invoices' },
          { href: '/create', label: 'Create invoice' },
          { href: '/upgrade', label: 'Upgrade' },
        ]}
        user={
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm hidden md:block">{user.email}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="min-h-[44px] px-3 text-slate-400 hover:text-white text-sm transition-colors">Log out</button>
            </form>
          </div>
        }
      >
        {children}
      </DashboardShell>
    </div>
  )
}
