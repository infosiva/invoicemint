# HANDOFF — InvoiceMint Full Pipeline
**Date:** 2026-06-18  **Status:** IN PROGRESS
**Goal:** Full 16-step pipeline — promo codes, live stats, plan preview, dashboard preview, smart AI prompts, zero fake data

## Current state (good foundation exists)
- ✅ bg `#f8fafc`, accent `#059669` (finance/billing correct)
- ✅ Split hero layout, InvoiceDemo right panel (live, real API call)
- ✅ Chatbot (FloatingChatWrapper), FeedbackWidget, BackToTop
- ✅ /api/stats route exists, /api/chat, /api/feedback
- ✅ Branded navbar (Invoice**Mint** accent)
- ✅ app/icon.tsx exists
- ✅ JSON-LD, OG, sitemap, robots, privacy
- ❌ No promo code system
- ❌ No LiveStatsBar (stats hidden until real data)
- ❌ No PlanPreview component (inline free vs pro comparison)
- ❌ No DashboardPreview (empty-state motivates upgrade)
- ❌ No TrendingTopics (top invoice categories/clients)
- ❌ AI prompt not context-adaptive (invoice type/complexity)
- ❌ Fake invoice data in page.tsx INVOICES array

## Files to touch
- `app/page.tsx` — remove fake INVOICES array, add LiveStatsBar + PlanPreview + DashboardPreview + TrendingTopics sections
- `app/globals.css` — fintech theme: upgrade to `#f0fdf4` + border `#a7f3d0`
- `app/layout.tsx` — add FloatingChatWrapper if missing
- `lib/promoCode.ts` — create promo system
- `hooks/usePromo.ts` — client hook
- `app/api/promo/route.ts` — promo validate endpoint
- `app/api/stats/route.ts` — verify no fake baselines
- `app/api/trending/route.ts` — create: top invoice categories logged per generation
- `app/api/generate/route.ts` — add context-adaptive prompts (invoice type: hourly/project/retainer)
- `components/LiveStatsBar.tsx` — real stats, hidden when zero
- `components/PlanPreview.tsx` — free vs pro inline comparison
- `components/DashboardPreview.tsx` — empty-state dashboard with 3D tilt
- `components/TrendingTopics.tsx` — top invoice categories, hidden until data

## Steps
- [ ] Step 1: Fix globals.css — finance theme `#f0fdf4` bg
- [ ] Step 2: Remove fake INVOICES array from page.tsx
- [ ] Step 3: Create lib/promoCode.ts + hooks/usePromo.ts + app/api/promo/route.ts
- [ ] Step 4: Verify/fix app/api/stats/route.ts — no fake baselines
- [ ] Step 5: Create app/api/trending/route.ts — invoice categories
- [ ] Step 6: Add context-adaptive prompts to app/api/generate/route.ts
- [ ] Step 7: Create components/LiveStatsBar.tsx
- [ ] Step 8: Create components/PlanPreview.tsx
- [ ] Step 9: Create components/DashboardPreview.tsx
- [ ] Step 10: Create components/TrendingTopics.tsx
- [ ] Step 11: Wire all into app/page.tsx
- [ ] Step 12: npm run build → Playwright 375+1280px → push → E2E verify

## Success criteria
- No fake data visible anywhere
- Stats hidden on first load (zero session), appear after real usage
- Promo code `LAUNCH50` unlocks Pro badge in navbar
- PlanPreview shows inline free vs pro diff with promo input
- DashboardPreview shows empty-state with feature hints
- TrendingTopics hidden until invoices generated
- Build green, Playwright screenshots pass, live URL verified

## Resume from here if interrupted
Starting Step 1.
