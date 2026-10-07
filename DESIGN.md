# InvoiceMint design

Source of truth: `design-system/` (MASTER.md, tokens, `components/AnimatedBg.tsx`). This file only records project choices.

- Accent: `#a16207` (amber/gold on warm cream); palette checked with `design-system/scripts/check-palettes.mjs`.
- Hub override: Edge Config `theme_invoicemint.design` (dials, brief, palette, `layout.bgAnimation`/`bgSpeed`) wins over these values; loaded by `lib/theme-loader.ts` and applied in `app/layout.tsx`.
- Background: `components/AnimatedBg.tsx` (hub-driven, reduced-motion safe).
- Logo: `components/Logo.tsx` (InvoiceMint, accent on the second word), used in the navbar/header; favicon is `app/icon.svg` (same mark).
- ai-core: exempt: invoice/speech parsing is one-shot LLM extraction via the shared chat chain; no document corpus, RAG, memory or vector search is stored.
