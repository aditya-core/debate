# Gift of Words

An intelligent communication training experience — two independent practice worlds
(**Debate** and **Extempore**), one account, one shared intelligence layer.

> **Status:** Stage 3 — the public site. Landing page, theme system, build-in-public
> page and legal drafts. No auth, no database, no AI calls yet.

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
  app/         routes: /, /develop, /legal, /signup, /signin (+ design tokens)
  components/
    sections/  Hero, Marquee, Problem, HowItWorks, Worlds, SkillData,
               Scorecard, Vision, FinalCTA, LiveDemo
    charts/    Radar, Bars, Sparkline — hand-built SVG, no chart library
  lib/         sample data for the illustrative charts
  public/fonts self-hosted woff2 (latin subset)
```

## Where the reasoning lives

- `docs/PRODUCT-BRIEF.md` — what we are building and why
- `docs/ARCHITECTURE.md` — stack, capacity budgets, launch conditions
- `docs/PROJECT-JOURNAL.md` — every decision, question, mistake and fix, append-only

Every commit references the decision IDs it implements.

## Non-negotiables already encoded in the build

- **Two complete themes.** Light is the default; the choice follows the operating
  system until the visitor flips the switch, and is then remembered. No flash on load.
- **Motion is CSS and SVG only** — no WebGL, no animation library. Everything
  degrades to a static page under `prefers-reduced-motion`.
- **Nothing depends on JavaScript to be readable**; a reveal-fallback also guarantees
  content appears if the motion layer ever fails.
- **Every route prerenders as static**, which keeps the hosting CPU budget near zero.
- **No dead links.** Unbuilt features are labelled "soon" rather than linked to nowhere.
- **All sample data is labelled** as illustrative wherever it appears.
