"use client";
// Common signed-in dashboard layout: sidebar (bottom tab bar on mobile), top bar, stat strip, panels.
// Pure CSS, uses --accent/--bg tokens so each project keeps its own identity. Honours prefers-reduced-motion.
import type { ReactNode } from "react";

export type DashNavItem = { href: string; label: string; icon?: ReactNode; active?: boolean };
export type DashStat = { label: string; value: string | number; hint?: string };

type Props = {
  brand: ReactNode;
  nav: DashNavItem[];
  user?: ReactNode; // e.g. <UserButton /> or email
  stats?: DashStat[];
  children: ReactNode; // panels: wrap each in <DashPanel>
};

export function DashPanel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="dsd-panel">
      <header><h2>{title}</h2>{action}</header>
      <div className="dsd-scroll">{children}</div>
    </section>
  );
}

export function DashboardShell({ brand, nav, user, stats, children }: Props) {
  const css = `
.dsd{display:grid;grid-template-columns:220px 1fr;min-height:100dvh;background:var(--bg,#0b0b12);color:var(--fg,#f5f5f7)}
.dsd-side{position:sticky;top:0;height:100dvh;padding:16px 12px;border-right:1px solid color-mix(in oklab,var(--fg,#fff) 10%,transparent);display:flex;flex-direction:column;gap:4px}
.dsd-side a{display:flex;align-items:center;gap:10px;min-height:44px;padding:0 12px;border-radius:10px;color:inherit;text-decoration:none;opacity:.75;transition:background .15s ease-out,opacity .15s ease-out,transform .1s ease-out}
.dsd-side a:active{transform:scale(.97)}
.dsd-side a[aria-current=page]{opacity:1;background:color-mix(in oklab,var(--accent,#6366f1) 22%,transparent);box-shadow:inset 3px 0 0 var(--accent,#6366f1)}
@media (hover:hover) and (pointer:fine){.dsd-side a:hover{opacity:1;background:color-mix(in oklab,var(--accent,#6366f1) 12%,transparent)}}
.dsd-main{padding:16px;display:flex;flex-direction:column;gap:16px;min-width:0}
.dsd-top{display:flex;align-items:center;justify-content:space-between;min-height:44px}
.dsd-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.dsd-stat{padding:14px;border-radius:14px;background:color-mix(in oklab,var(--fg,#fff) 6%,transparent);border:1px solid color-mix(in oklab,var(--fg,#fff) 10%,transparent);animation:dsd-in .35s ease-out both}
.dsd-stat:nth-child(2){animation-delay:50ms}.dsd-stat:nth-child(3){animation-delay:100ms}.dsd-stat:nth-child(4){animation-delay:150ms}
.dsd-stat b{display:block;font-size:1.6rem;line-height:1.2;color:var(--accent,#6366f1)}
.dsd-stat span{font-size:.8125rem;opacity:.7}.dsd-stat small{display:block;font-size:.75rem;opacity:.55}
.dsd-grid{display:grid;align-items:start;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px}
.dsd-panel{display:flex;flex-direction:column;border-radius:14px;background:color-mix(in oklab,var(--fg,#fff) 5%,transparent);border:1px solid color-mix(in oklab,var(--fg,#fff) 10%,transparent);min-width:0}
.dsd-panel header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;min-height:44px}
.dsd-panel h2{font-size:.9375rem;font-weight:600;margin:0}
.dsd-scroll{max-height:320px;overflow:auto;padding:0 14px 14px}
@keyframes dsd-in{from{opacity:0;transform:translateY(6px)}}
@media (max-width:767px){
 .dsd{grid-template-columns:1fr;padding-bottom:64px}
 .dsd-side{position:fixed;inset:auto 0 0 0;height:64px;flex-direction:row;justify-content:space-around;padding:6px;border-right:0;border-top:1px solid color-mix(in oklab,var(--fg,#fff) 10%,transparent);background:var(--bg,#0b0b12);z-index:20}
 .dsd-side a{flex:1;justify-content:center;padding:0 4px;font-size:.75rem}
 .dsd-brand{display:none}
}
@media (prefers-reduced-motion:reduce){.dsd-stat{animation:none}.dsd-side a{transition:none}}`;
  return (
    <div className="dsd">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <nav className="dsd-side" aria-label="Dashboard">
        <div className="dsd-brand" style={{ padding: "4px 12px 12px", fontWeight: 700 }}>{brand}</div>
        {nav.map((n) => (
          <a key={n.href} href={n.href} aria-current={n.active ? "page" : undefined}>{n.icon}{n.label}</a>
        ))}
      </nav>
      <main className="dsd-main">
        <div className="dsd-top"><span /> {user}</div>
        {stats?.length ? (
          <div className="dsd-stats">
            {stats.map((s) => (
              <div className="dsd-stat" key={s.label}><span>{s.label}</span><b>{s.value}</b>{s.hint && <small>{s.hint}</small>}</div>
            ))}
          </div>
        ) : null}
        <div className="dsd-grid">{children}</div>
      </main>
    </div>
  );
}
