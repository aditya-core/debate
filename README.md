# Gift of Words

An intelligent communication training experience — two independent practice worlds
(**Debate** and **Extempore**), one account, one shared intelligence layer.

> **Status:** Stage 4 — registration and identity. The public site is done, and
> accounts now sign up, sign in and carry two world identities in Supabase.
> The practice arenas and AI scoring are next. No AI calls yet.

## Run it

```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

Other commands:

```bash
npm run build      # production build → .next-build
npm run typecheck  # tsc --noEmit
npm test           # age + password rules (node:test)
npm run audit:styles  # every class in every page must exist in its stylesheet
```

Accounts need a database. Create a free Supabase project, paste two values into
`web/.env.local`, run one SQL file — `docs/SUPABASE-SETUP.md` walks through it.
Without it, sign-up and sign-in say so explicitly instead of pretending.

## Repo layout

```
docs/        the thinking: product brief, architecture, decision journal
web/         the Next.js application (deployed to Vercel)
  app/
    (site)/    /, /develop, /legal, /account — marketing nav + full footer
    (auth)/    /signup, /signin — no nav, no footer, one line of legal links
    auth/      /auth/callback, /auth/signout (URLs, not a route group)
  components/
    sections/  Hero, Marquee, Problem, HowItWorks, Worlds, SkillData,
               Scorecard, Vision, FinalCTA, LiveDemo
    charts/    Radar, Bars, Sparkline — hand-built SVG, no chart library
    motion/    Magnetic, CountUp, Typewriter, Waveform, SpotlightCursor
    auth/      AuthShell, SignUpForm, SignInForm, SetupNotice
  lib/
    auth/      server actions + the age/password rules both sides share
    supabase/  cookie-bound clients (anon key only)
  proxy.ts     session refresh
  public/fonts self-hosted woff2 (latin subset)
supabase/
  migrations/  0001_identity.sql — accounts, two world profiles, RLS
```

## Where the reasoning lives

- `docs/PRODUCT-BRIEF.md` — what we are building and why
- `docs/ARCHITECTURE.md` — stack, capacity budgets, launch conditions
- `docs/PROJECT-JOURNAL.md` — every decision, question, mistake and fix, append-only
- `docs/SUPABASE-SETUP.md` — database setup, from empty project to verified sign-up
- `docs/SECURITY.md` — the working audit: fixed, accepted with reasons, still open
- `SECURITY.md` — how to report a vulnerability

Every commit references the decision IDs it implements.

## Non-negotiables already encoded in the build

- **Two complete themes.** Light is the default; the choice follows the operating
  system until the visitor flips the switch, and is then remembered. No flash on load.
- **Motion is CSS and SVG only** — no WebGL, no animation library. Everything
  degrades to a static page under `prefers-reduced-motion`. The interactive
  touches (magnetic button, count-up, typewriter, cursor spotlight) are a few
  kilobytes of vanilla JavaScript, not a framework: 178 KB gzipped JS and 10 KB
  gzipped CSS for the whole landing page.
- **Nothing depends on JavaScript to be readable**; a reveal-fallback also guarantees
  content appears if the motion layer ever fails.
- **Every route prerenders as static**, which keeps the hosting CPU budget near zero.
- **No dead links.** Unbuilt features are labelled "soon" rather than linked to nowhere.
- **Row Level Security on every table**, and no service-role key anywhere in the app.
  Clients read their own rows and write nothing; privileged work happens in Postgres.
- **httpOnly session cookies, a CSP, and no third-party scripts.** Sign-up does not
  reveal whether an email already has an account. See `docs/SECURITY.md`.
- **One account, three identities.** A `GOW-USER` account and a `GOW-DEB` +
  `GOW-EXT` pair, created together by a database trigger, with independent ratings.
  Display IDs are labels — the key is a UUID.
- **All sample data is labelled** as illustrative wherever it appears.
