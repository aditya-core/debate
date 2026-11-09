# Gift of Words

An intelligent communication training experience — two independent practice worlds
(**Debate** and **Extempore**), one account, one shared intelligence layer.

> **Status:** Stage 3 — landing page. Hero and navigation are built; everything below
> the fold is a teaser. No auth, no database, no AI calls yet.

## Run it

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

Other commands:

```bash
npm run build      # production build (all routes prerender as static)
npm run typecheck  # tsc --noEmit
```

## Repo layout

```
docs/        the thinking: product brief, architecture, decision journal
web/         the Next.js application (deployed to Vercel)
  app/         routes, design tokens (globals.css), layout
  components/  Nav, Hero, hero/RibbonCanvas, WorldsTeaser
  lib/         device tiering
  public/fonts self-hosted woff2 (latin subset)
```

## Where the reasoning lives

- `docs/PRODUCT-BRIEF.md` — what we are building and why
- `docs/ARCHITECTURE.md` — stack, capacity budgets, launch conditions
- `docs/PROJECT-JOURNAL.md` — every decision, question, mistake and fix, append-only

Every commit references the decision IDs it implements.

## Non-negotiables already encoded in the build

- The **H1 is the LCP element**; the artwork loads behind it and never blocks text.
- Motion is **device-tiered** (`lib/tiers.ts`): full field on desktop, reduced on
  mid-range phones, **none** when `prefers-reduced-motion` or on low-end devices.
- Nothing depends on JavaScript to be readable — a no-JS visitor gets the full page.
- Fonts are self-hosted and preloaded; no third-party request on the critical path.
