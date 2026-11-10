# Gift of Words — Project Journal

**Owner:** Aditya
**Agent:** Arena Agent Mode
**Branch:** `arena/cd16e984-debate`
**Repo:** `aditya-core/debate`
**Journal opened:** 2026-11-09

---

## 0. Purpose & conventions

This file is the **living record** of the project. It is deliberately kept out of `README.md`.

It records:

- every decision that comes up, no matter how small,
- every question asked (by Aditya, by the designer, or by me) and how it was answered,
- every mistake we make, how we found it, and how we fixed it,
- every improvement and every change of direction,
- the current state of the work at the end of each session.

**Rules**

1. **Append-only.** History is never rewritten. If a decision changes, we add a *new* entry that supersedes the old one and mark the old one `SUPERSEDED`.
2. **Every entry gets an ID** so it can be referenced in commits, PRs and conversation: `D-` decision, `Q-` question, `M-` mistake/fix, `R-` risk, `S-` session.
3. **Status values:** `PROPOSED` · `LOCKED` · `OPEN` · `SUPERSEDED` · `FIXED`.
4. If something is ambiguous or half-decided, it goes in the **Open Questions** table — we do not silently assume.

---

## 1. Decision log

| ID | Date | Decision | Source | Status |
|----|------|----------|--------|--------|
| D-001 | 2026-11-09 | All work happens on branch `arena/cd16e984-debate`; repo starts from an empty scaffold (only `README.md`). | Agent policy | LOCKED |
| D-002 | 2026-11-09 | Project progress is recorded in `docs/PROJECT-JOURNAL.md`, separate from `README.md`. A distilled product understanding lives in `docs/PRODUCT-BRIEF.md`. | Aditya's instruction | LOCKED |
| D-003 | 2026-11-09 | One parent identity (`GOW-USER-…`) with two independent sub-identities: Debate (`GOW-DEB-…`) and Extempore (`GOW-EXT-…`). Sub-profiles are **identifiers, not credentials** — access is always authorised through the parent account. | Aditya + designer chat | LOCKED (pending §7 refinements) |
| D-004 | 2026-11-09 | Both sub-profiles are created **automatically at registration**, even if the student has not entered either world yet. | Designer recommendation, accepted by Aditya | LOCKED |
| D-005 | 2026-11-09 | Both worlds keep **fully independent** ratings, XP, history and reports. A shared "intelligence layer" may *read across* both but must never blend competitive scores. | Designer chat | LOCKED |
| D-006 | 2026-11-09 | Build order is **not** "all backend first" and **not** "landing page first". Order: product blueprint → design system → landing page → auth/identity → onboarding → dashboards → AI layer → test/launch. | Answer to Q-001 | LOCKED |
| D-007 | 2026-11-09 | Brand personality: **hybrid of cinematic + intellectual**. | Aditya | LOCKED |
| D-008 | 2026-11-09 | Colour direction: **vibrant, dark foundation** (charcoal base; violet, electric blue, magenta, cyan accents). | Aditya | LOCKED |
| D-009 | 2026-11-09 | Motion ambition: **immersive**. Guiding principle: every animation must communicate, create emotion or guide attention — never animation for its own sake. | Aditya | LOCKED |
| D-010 | 2026-11-09 | Landing page audience: **everyone** (students, applicants, young professionals), not students-only and not parents-first. Positioning is "communication is a superpower", not "English learning app". | Aditya | LOCKED |
| D-011 | 2026-11-09 | Hero headline: **"Unlock the power of your words."** (chosen from three options; the "potential" direction). | Aditya | LOCKED |
| D-012 | 2026-11-09 | Hero signature visual: **hybrid** — kinetic typography + colourful 3D ribbons/particles. | Aditya | LOCKED |
| D-013 | 2026-11-09 | Hero is **full-screen cinematic** (≈ one viewport). | Aditya | LOCKED |
| D-014 | 2026-11-09 | Landing page blueprint is 10 sections: Nav → Hero → Problem → Two Worlds → AI Coach → Growth Journey → Product Showcase → Bigger Vision (coming soon) → Final CTA → Footer. | Designer chat | PROPOSED |
| D-015 | 2026-11-09 | Hero must ship with reduced-motion support, a no-WebGL static fallback, and headline/CTA visible before the 3D scene finishes loading. | Designer chat (technical brief) | LOCKED |
| D-016 | 2026-11-09 | Stack direction for the hero: Next.js + TypeScript + Tailwind + GSAP + Three.js/React Three Fiber; fonts self-hosted. | Designer chat (technical brief) | PROPOSED |
| D-017 | 2026-11-09 | Hero scope is restricted: build hero + its nav integration only. No dashboard, auth or AI backend in that task. | Designer chat (handoff brief) | PROPOSED |
| D-018 | 2026-11-09 | **Backend is Django** (DRF). Aditya's call. Good fit for domain logic, admin, migrations, Python AI orchestration. | Aditya | LOCKED |
| D-019 | 2026-11-09 | **Supabase Auth is the identity provider.** Django does not store passwords; it verifies Supabase JWTs via JWKS and maps `sub` → `Account.supabase_uid`. | Aditya | LOCKED |
| D-020 | 2026-11-09 | **Hosting is split:** Vercel for Next.js only; Django + Celery on a container platform (Railway / Render / Fly). Django on Vercel is rejected as an architectural fit (see R-009). | Agent recommendation | PROPOSED — needs sign-off |
| D-021 | 2026-11-09 | **Motion graphics are non-negotiable.** Performance is solved by device tiering and pre-rendered fallbacks, not by removing motion. | Aditya | LOCKED |
| D-022 | 2026-11-09 | **Desktop-first build, mobile as a first-class target** — validated on ₹15k-class Android, not just a dev laptop. | Aditya | LOCKED |
| D-023 | 2026-11-09 | **Legal compliance is a product requirement, not paperwork.** Age gate, verifiable parental consent (under-18), recording consent, and erasure cascade must exist in schema v1. | Aditya ("keep legal compliance clear") | LOCKED |
| D-024 | 2026-11-09 | **Speech evaluation deferred.** But a `Scorer` interface, async pipeline and rubric/model versioning are built now so the vendor is swappable. | Aditya | LOCKED |
| D-025 | 2026-11-09 | Datastore is **Supabase Postgres** (implied by Supabase adoption), project region Mumbai `ap-south-1`. | Aditya (implied) | PROPOSED — confirm |
| D-026 | 2026-11-09 | Stack decisions are documented in `docs/ARCHITECTURE.md`; this journal stays chronological. | Agent | LOCKED |
| D-027 | 2026-11-09 | **Budget is ₹0 for now.** Phase 0 stack = **Next.js + Supabase only**. Django deferred to Phase 1/2, reintroduced only when a concrete need exists. | Agent recommendation (from Aditya's constraint) | PROPOSED — Aditya to sign off |
| D-028 | 2026-11-09 | **No background queue in Phase 0.** AI evaluation runs inside the request; a queue is added when a measured problem appears, not preemptively. | Agent | PROPOSED |
| D-029 | 2026-11-09 | Free-tier limits are accepted, each with a named upgrade trigger (`ARCHITECTURE.md` §11.5) rather than an open-ended "we'll pay when we need to". | Agent | LOCKED |
| D-030 | 2026-11-09 | If Django is kept in Phase 0, it runs on an **Oracle Cloud Always Free ARM VM** (Docker Compose), never on Render free (no free workers, 15-min sleep, 512 MB). | Agent | PROPOSED |
| D-031 | 2026-11-09 | **Stack confirmed: keep Next.js + Vercel + Supabase.** Target = launch-ready for **100 users at ₹0/month**. Capacity budget and four launch conditions in `ARCHITECTURE.md` §12. | Aditya + Agent | LOCKED |
| D-032 | 2026-11-09 | **Four non-negotiable launch conditions:** (1) custom SMTP from day one, (2) delete raw audio after scoring, (3) landing page static/ISR, (4) uptime pinger + weekly `pg_dump`. | Agent | LOCKED |
| D-033 | 2026-11-09 | Upgrade triggers are explicit, not vibes: first payment → Vercel Pro ($20); storage pressure or pause risk → Supabase Pro ($25). | Agent | LOCKED |
| D-034 | 2026-11-09 | **Precedence rule:** the Nov 7 AI-Mode conversation is *context only*. Where it conflicts with a decision taken in this journal, this journal wins. Recorded as `PRODUCT-BRIEF.md` §9. | Aditya | LOCKED |
| D-035 | 2026-11-09 | **The moat is cross-cutting weakness detection**, not AI feedback. Both design conversations arrived at it independently (Personal Weakness Engine ≈ shared intelligence layer). Product strategy anchors here. | Both conversations | LOCKED |
| D-036 | 2026-11-09 | **Speech Vitals is a cross-cutting measurement layer, not a third world.** It attaches to Debate and Extempore sessions alike; it does not get its own `GOW-*` identity. | Agent | PROPOSED |
| D-037 | 2026-11-09 | **Human community, matchmaking and tournaments stay post-launch** — re-affirmed against the older "must ship" list. Rationale: a 20-user matchmaking pool has nothing to match. | Agent | LOCKED |
| D-038 | 2026-11-09 | **No prices are published until demand is validated.** Pricing has moved $65 → $59 → $14.99 → $9.99 across two conversations; publishing now would anchor us to a guess. | Agent | PROPOSED |

---

## 2. Question log

> Both directions are recorded: questions Aditya/design asked, and questions the agent asked.

| ID | Date | From → To | Question | Answer / Status |
|----|------|-----------|----------|-----------------|
| Q-001 | 2026-11-09 | Aditya → designer | "If I ask my AI agent to start working, what should it build first — all the backend logic, or the landing page and signup, integrating logic later?" | Answered: neither extreme. Blueprint → design system → landing page (first visible milestone) → identity backend → onboarding → dashboards → AI → launch. → became D-006. **CLOSED** |
| Q-002 | 2026-11-09 | designer → Aditya | Should both sub-profiles be created automatically at registration? | Aditya's structure accepted; auto-create chosen. → D-004. **CLOSED** |
| Q-003 | 2026-11-09 | designer → Aditya | What brand personality? | Hybrid cinematic + intellectual. → D-007. **CLOSED** |
| Q-004 | 2026-11-09 | designer → Aditya | Which colour direction? | Vibrant / dark. → D-008. **CLOSED** |
| Q-005 | 2026-11-09 | designer → Aditya | How ambitious should the motion be? | Immersive. → D-009. **CLOSED** |
| Q-006 | 2026-11-09 | designer → Aditya | Who is the landing page speaking to? | "Everyone." → D-010. **CLOSED** (note: earlier recommendation was students-first; Aditya overrode it — see D-010, and R-007) |
| Q-007 | 2026-11-09 | designer → Aditya | Lock headline / signature visual / hero height? | Unlock the power of your words / hybrid / full-screen. → D-011..D-013. **CLOSED** |
| Q-008 | 2026-11-09 | Agent → Aditya | Which database, and which auth system, are we committing to? Stack names Next.js/Tailwind/GSAP/R3F/Gemini but no datastore, no auth provider, no hosting. | **OPEN** — blocks Stage 4 and any schema work |
| Q-009 | 2026-11-09 | Agent → Aditya | Are the `GOW-*` IDs meant to be shown to users (public/pretty) or only internal? Sequential numbers are guessable and invite enumeration/IDOR. | **OPEN** — see R-001 |
| Q-010 | 2026-11-09 | Agent → Aditya | Do we scaffold the Next.js app now (so the hero brief can be executed), or finish the written blueprint for sections 03–10 first? | **OPEN** |
| Q-011 | 2026-11-09 | Agent → Aditya | Voice recording is central to practice. Are students/minors involved, and where (India / global)? This drives consent + data-retention design. | **ANSWERED (partial):** India-first; teenagers in scope → parental consent required (D-023). Global scope still open. |
| Q-012 | 2026-11-09 | Aditya → Agent | "Use Supabase for auth, we are using Django — is that enough?" | Answered: individually good, one structural flaw (Django cannot live on Vercel) + ~12 missing pieces. See `ARCHITECTURE.md` §2, §9. **CLOSED** (recommendation pending on D-020) |
| Q-013 | 2026-11-09 | Agent → Aditya | Do we keep Django (hosted on Railway) or drop it for pure Next.js + Supabase? | **OPEN** — `ARCHITECTURE.md` §10 item A |
| Q-014 | 2026-11-09 | Agent → Aditya | Supabase region: Mumbai `ap-south-1` (recommended) vs Singapore? | **OPEN** — cheap now, painful later |
| Q-015 | 2026-11-09 | Agent → Aditya | `GOW-*` IDs: sequential or random + checksum? | **OPEN** — R-001 |
| Q-016 | 2026-11-09 | Agent → Aditya | Email provider for verification + parent consent mail? (Supabase's default sender will land in spam.) | **OPEN** |
| Q-017 | 2026-11-09 | Aditya → Agent | "I can't spend right now — can I host Django for free? If I use Next.js, is Vercel + Supabase enough to launch? Which stack is best?" | Answered in `ARCHITECTURE.md` §11. Short version: Vercel + Supabase **is** enough to launch; free Django means a self-managed Oracle VM; Django + Celery on free PaaS does not work. **CLOSED** |
| Q-018 | 2026-11-09 | Agent → Aditya | Django now (Oracle VM, some sysadmin) or defer it (Next.js + Supabase, zero ops)? | **CLOSED by D-031** — deferred. Next.js + Supabase only for Phase 0. |
| Q-019 | 2026-11-09 | Aditya → Agent | "Can a ready-to-launch app handling 100 users be built and deployed on free Vercel + Supabase?" | Answered: **yes**, with 4 build conditions. Full budget in `ARCHITECTURE.md` §12. **CLOSED** |
| Q-020 | 2026-11-09 | Agent → Aditya | Gemini free tier's data-use terms differ from paid. Are we willing to process real students' audio on the free tier, or do we need paid billing before Stage 5? | **OPEN** — legal, not cost |
| Q-021 | 2026-11-09 | Agent → Aditya | Ready to scaffold? (`Q-010` still unanswered after the stack is settled.) | **OPEN** |
| Q-022 | 2026-11-09 | Agent → Aditya | **Who are we actually selling to?** The Nov 7 chat says affluent US/Middle-East/Asia parents, ages 14–18. Our compliance work assumed India-first. This changes payments (Stripe vs Razorpay), currency, child-safety law and even the hero copy. | **OPEN — highest priority.** See R-021 |
| Q-023 | 2026-11-09 | Agent → Aditya | **Is the Nov 27 / Dec 12 deadline still real?** It predates the motion-led landing page, the free-tier constraint and the staged plan. 18 days remain. | **OPEN** — see `ARCHITECTURE.md` §13 |
| Q-024 | 2026-11-09 | Agent → Aditya | Pricing: which tier structure survives contact with reality? ($9.99 founding / $14.99 / $99 annual from the older chat.) | **OPEN** — D-038 says do not publish yet |
| Q-025 | 2026-11-09 | Agent → Aditya | **Where do the Interview Simulator and Speech Vitals live** in the two-world identity model? (Third sub-ID? Format inside Debate? Cross-cutting layer?) | **OPEN** — proposed answer in D-036 |

---

## 3. Mistakes, fixes & lessons

| ID | Date | What happened | How we found it | Fix | Lesson |
|----|------|---------------|-----------------|-----|--------|
| M-001 | 2026-11-09 | The `chatgpt.com/share/...` link **cannot be read**. Verified by attempting it directly: the fetch returns only the page shell (`Chat history`) because the transcript is client-rendered behind JavaScript. No conversation text is retrievable. | Aditya asked directly "did you read the link or the text?" — so it was tested rather than assumed | Aditya's inline paste is the only source. It is the *only* thing I have read, and every decision is traceable to it. | State this up front, unprompted, whenever a link is shared. Never let a user believe I read something I didn't. |
| M-002 | 2026-11-09 | The pasted transcript is **partial**, not the whole conversation: it opens at "Loading older messages…", contains UI noise and image alt-text instead of images, and stops at "What comes next?" (Section 03). | Reading the paste closely | Treated the paste as authoritative but incomplete; every assumption drawn from a gap is marked `PROPOSED`/`OPEN` instead of `LOCKED`. | Ask for (a) the earlier part of the thread and (b) the actual design reference images before we design Sections 03–10. |

### What the paste does **not** contain (explicit gap list)

1. **Everything before the identity discussion.** The thread starts mid-conversation — the original product concept, the feature list, the initial brief, pricing thinking, and the reasoning that produced "Gift of Words" are all missing.
2. **How the stack was chosen.** Django, Gemini and Supabase appear in the paste only as *given* facts (Aditya states them later) — the conversation that justified them is not in the text.
3. **Detailed specs for landing sections 03–10.** Only titles and one-line intents exist.
4. **Dashboard, onboarding assessment, rating/XP mechanics, subscription/billing** — referenced in passing, never specified.
5. **The actual visual references.** Only image alt-text survived (`Syvra 3D Design`, `Fullygan Dashboards`, `LevelUp Labs`, `PersuadeMe`, `WHIF`, …). For a motion-led brand, the *images* are the brief. I have never seen them.

*(Nothing has broken yet — the repo was empty at the start of this session.)*

---

## 4. Risk register

| ID | Risk | Impact | Mitigation | Status |
|----|------|--------|------------|--------|
| R-001 | Public IDs like `GOW-USER-00042` are sequential and guessable → user enumeration / IDOR if any endpoint trusts an ID from the client. | Security | Separate **internal UUID (PK)** from **display ID**. Display ID uses Crockford base32 with a random component + checksum char. Authorisation only ever via session, never via ID. | OPEN |
| R-002 | An immersive WebGL hero directly fights Core Web Vitals (LCP/INP). A 3D canvas as LCP element will fail on mid-range phones. | Performance / SEO | Text-first render: headline + CTA are static HTML/CSS and are the LCP element. Canvas lazy-mounts after first paint, heavy assets deferred, static poster as fallback. | OPEN |
| R-003 | Voice recordings of teenagers = sensitive personal data (India DPDP Act 2023, GDPR if EU, COPPA if US under-13s). | Legal / trust | Decide age gate + parental consent before Stage 5; define retention window (e.g. audio deleted after scoring, transcript kept); data-region choice. | OPEN |
| R-004 | Stack is only half-specified (no DB, no auth, no hosting, no storage). Every later decision depends on these. | Architecture | Resolve Q-008 before any schema/migration work. | OPEN |
| R-005 | "Two independent worlds" invites copy-paste code → two dashboards, two rating engines, two sets of bugs. | Maintainability | One shared core (identity, XP engine, session model, evaluation pipeline) + per-world configuration and content packs. Independence is a *product* boundary, not necessarily a *code* boundary. | OPEN |
| R-006 | Gemini is the only named AI vendor; evaluation quality, cost and latency all hinge on it. | Vendor risk / cost | Keep an `Evaluator` interface with adapters (Gemini now, others later); store rubric + model version with every score so re-scoring is possible. | OPEN |
| R-007 | Landing page "speaks to everyone" while the product is built around students. Copy risk: too broad = speaks to nobody. | Product/marketing | Keep "everyone" as the *brand* position, but choose one primary persona for the *hero proof* (a student). Validate with real copy, not abstractions. | OPEN |
| R-008 | Immersive motion + first-time visitor = animation delays comprehension. ChatGPT flagged this itself ("avoid delaying access to headline or CTA"). | UX | Headline and CTA render immediately; the 3D story plays *behind/around* them, not before them. Entrance animation must be skippable by scrolling. | OPEN |
| R-009 | **Django on Vercel.** Serverless is request-scoped: 4.5 MB body cap (not configurable), 10s Hobby / 15s Pro-default timeouts, no persistent WebSockets, no worker processes. Audio uploads 413 *before* our code runs; AI scoring times out mid-request. | Architecture (blocking) | Split runtimes (D-020): Next.js on Vercel, Django + Celery on Railway/Render/Fly. Never force Django into a serverless function. | **MITIGATED** (pending D-020 sign-off) |
| R-010 | **False confidence in Supabase RLS.** RLS applies only to requests carrying a user JWT through PostgREST. Django connects as superuser/`service_role` and bypasses RLS entirely. | Security | One authorisation model, in Django (querysets + permissions). RLS only where the browser talks to Supabase directly; `service_role` key never reaches the client. | OPEN |
| R-011 | **AI cost runaway.** Every practice session costs money; a retry loop or a bot can generate a real bill overnight. | Cost | Per-user daily cap + Redis token bucket + spend alert. Log cost per session on every `ScoreResult`. | OPEN |
| R-012 | **Age gate treated as a checkbox.** DPDP requires *verifiable* parental consent for under-18s — a multi-step flow with an auditable record, not a modal. | Legal | Design the flow in Stage 4 with auth; store the consent artefact (who, when, notice version). | OPEN |
| R-013 | **Two runtimes drift.** Web and api deploy separately and will disagree about the contract within a week. | Maintainability | OpenAPI via `drf-spectacular` → generated TS client → CI fails on a breaking change. | OPEN |
| R-014 | **Vercel Hobby is non-commercial by ToS.** A landing page advertising a product counts as commercial use; deployments can be suspended without warning. | Legal/availability | Fine while it is an unreleased personal project. Budget Vercel Pro ($20/mo) as the first real cost at launch. Cloudflare Pages (commercial allowed, free) is the escape hatch for a static landing page. | OPEN |
| R-015 | **Free tier = no backups.** Supabase Free has none; Render's free Postgres is deleted after 30 days. One bad migration and the project is gone. | Data loss | Weekly `pg_dump` to a private Supabase Storage bucket or a laptop, starting the day the first real user signs up. Automate it before it matters. | OPEN |
| R-016 | **Supabase free project pauses after 7 days idle.** A user opening the app after a quiet week sees a broken product. | Availability/trust | Uptime pinger (cron-job.org / UptimeRobot free) hitting one DB read every few hours during Phase 0. Remove at Pro. | OPEN |
| R-017 | **Supabase built-in auth email is 2/hour and only delivers to your own organisation members.** Every real signup fails with `email_address_not_authorized`. Silent in the UI; shows in Auth logs. | Launch blocker | Custom SMTP (Resend free tier) configured **before** the first outside user is invited. Raise the hourly limit under Authentication → Rate Limits. | OPEN — must close before launch |
| R-018 | **Gemini free tier is ~1,500 req/day and ~15 RPM, and its data-use terms differ from paid.** A class practising at the same time can exhaust the per-minute limit; minors' audio on a free tier may be used to improve the vendor's models. | Legal + reliability | Read the data-use terms before Stage 5. Design graceful 429 handling. Consider paid Gemini (~₹ negligible at 100 users) before real students upload voice. | OPEN |
| R-019 | **Vercel active CPU (4 h/month) is the thinnest margin at 100 users**, and it is invisible until it runs out. | Capacity | Static/ISR landing page, small bundles (cold-start CPU counts), audio work in the browser, no SSR on hot paths. Watch the dashboard monthly. | OPEN |
| R-020 | **Four-product sprawl.** Debate + Extempore + Interview Simulator + Speech Vitals + community + tournaments is six products. The older chat warned about this in one paragraph and recommended all of it in another. | Scope | Ship two worlds. Speech Vitals is a layer (D-036), not a product. Interview Room and community are explicitly post-launch. | OPEN |
| R-021 | **Positioning/market mismatch.** A premium product for affluent US parents, priced in dollars, sold with a motion-heavy brand — while the build assumes India-first, ₹0 infrastructure and DPDP. Both can be true, but not accidentally. | Strategy | Q-022 must be answered before copy, pricing or compliance is finalised. | OPEN |
| R-022 | **US child-safety law.** If the market is US teens: COPPA (under 13), state AADC-style laws, verifiable parental consent, and moderation duties — over and above DPDP. Voice data raises the bar further. | Legal | Decide market first (Q-022); the consent flow is then designed once, correctly. | OPEN |

---

## 5. Session log

### S-01 — 2026-11-09 — Project intake & briefing

**Goal of the session:** read the designer conversation, absorb the project, set up the recording system. Explicitly **learning only — no product code**.

**Done**
- Inspected repo: single `Initial commit`, only `README.md` (`# debate`). Nothing to work around.
- Read the full pasted design conversation (Gift of Words / Assembly-style product design dialogue).
- Created `docs/PROJECT-JOURNAL.md` (this file) and `docs/PRODUCT-BRIEF.md` (distilled understanding).
- Logged D-001…D-017, Q-001…Q-011, M-001…M-002, R-001…R-008.

**Extracted & understood**
- Product name: **Gift of Words**. Repo name is `debate` (legacy; product name wins in UI).
- Two learning worlds: **Debate World** and **Extempore World**, under one login.
- Full hero specification v1.0 (copy, tokens, 8-step motion timeline, 12-point acceptance checklist).
- 8-stage development sequence.

**Deliberately not done**
- No scaffolding, no `package.json`, no components. Aditya asked for learning first.
- No decision invented on DB/auth/hosting — logged as Q-008 instead.

**Open at end of session:** Q-008, Q-009, Q-010, Q-011.

### S-02 — 2026-11-09 — Stack review (Supabase / Django / Vercel)

**Goal:** Aditya answered the open stack questions; assess whether the combination is sound.

**New constraints given**
- Legal compliance must be handled properly, not deferred.
- Motion graphics are mandatory.
- Must run well on ₹15k Android phones; desktop-first build, mobile must still look great.
- Supabase for auth. Django for backend. Vercel for hosting. Speech evaluation decided later.

**Done**
- Wrote `docs/ARCHITECTURE.md` (v0.2): target topology, auth flow, data model sketch, device-tier performance rulebook, legal baseline, missing-pieces list.
- Verified Vercel platform limits against current documentation rather than memory: 4.5 MB request/response body cap (platform-level, not configurable), Hobby 10s / Pro 15s-default timeouts, no persistent WebSockets in Functions.
- Logged D-018…D-026, Q-012…Q-016, R-009…R-013.

**The finding that matters:** the individual choices are sound, but Django and Vercel are structurally incompatible for this product (audio uploads + AI scoring + background jobs + possibly live rooms). Recommendation: keep Django, move it off Vercel. Logged R-009, D-020.

**Second finding:** Supabase RLS gives a feeling of security that evaporates the moment Django owns the database connection. Authorisation must live in one place. Logged R-010.

**Third finding:** "motion is a must" + "₹15k phone" are only reconcilable through device tiering and pre-rendered fallbacks — not by shipping a smaller 3D scene to phones. Logged D-021, ARCHITECTURE §6.

**Open at end of session:** Q-013 (keep Django?), Q-014 (Mumbai region?), Q-015 (ID format), Q-016 (email provider), plus Q-010 (scaffold now?).

### S-03 — 2026-11-09 — Budget reality check

**New constraint:** no money to spend while building.

**Done**
- Verified the 2026 free-tier landscape against current sources instead of recalling it: Vercel Hobby (non-commercial, 1M requests, 100 GB), Supabase Free (500 MB / 1 GB / 5 GB egress / 50k MAU, 7-day pause, no backups), Render Free (750 h, 512 MB, 15-min sleep, no free workers, free Postgres expires in 30 days), Railway (trial credit only), Fly (no free tier), Oracle Always Free (4 OCPU / 24 GB ARM, never sleeps, self-managed).
- Wrote `ARCHITECTURE.md` §11: two-phase plan, three cost tables, "what breaks first".
- Logged D-027…D-030, Q-017…Q-018, R-014…R-016.

**Key finding:** with zero budget, **Django + Celery has no good free home except a self-managed Oracle VM**. Meanwhile Next.js + Supabase needs no third service, has no cold start, and removes the RLS caveat entirely because nothing holds a superuser connection. Simplifying is the *architecturally correct* answer here, not just the cheap one.

**Second finding:** "delete audio after scoring" is required by DPDP *and* by the 1 GB storage cap. Legal and budget agree — good sign.

**Open at end of session:** Q-018 (Django now or deferred) — this is the one blocking scaffolding.

### S-04 — 2026-11-09 — Capacity check: 100 users on free tier

**Question:** "Can a ready-to-launch app handling 100 users be built and deployed on the free tier of Vercel + Supabase, with the necessary stuff?"

**Done**
- Modelled real usage for this product (100 users × 3 sessions/week, 2-min audio, text feedback) against every free-tier limit.
- Wrote `ARCHITECTURE.md` §12 with the budget table, the four launch conditions and the documented ceiling.
- Logged D-031…D-033, Q-019…Q-021, R-017…R-019.

**Answer:** Yes. Database, storage, egress, MAU and invocations all have 5–500× headroom. Three thin spots, all fixable by design rather than money:

1. **Supabase auth email** — built-in sender is 2/hour and only reaches your own org members, so *real signups fail outright*. Custom SMTP (Resend) is mandatory before any outside user. This was the single most important finding of the session and it is invisible in the UI (`R-017`).
2. **Storage** — 1 GB holds ~2,800 recordings (~10 weeks at 100 users). Deleting raw audio after scoring (already a DPDP requirement) turns this into a non-issue.
3. **Vercel active CPU** — 4 h/month is the thinnest margin; a static landing page protects it.

**Consequence:** stack locked (D-031). Django formally deferred. Four build conditions become part of the definition of "done" for launch (D-032).

**New open item that is legal, not technical:** Gemini free-tier data terms vs minors' audio (`Q-020`, `R-018`). Must be resolved before Stage 5.

**Blocking now:** Q-021 — permission to scaffold.

### S-05 — 2026-11-09 — Reading the earlier (Nov 7) conversation

**Instruction from Aditya:** read the older AI-Mode conversation for context, but *"the discussions we did above will prevail over these older chats."*

**Done**
- Read the full paste, stripped the Google-navigation noise.
- Rewrote `PRODUCT-BRIEF.md` §9: what the older chat adds, a conflict table (older vs ours), and my assessment of it.
- Added `ARCHITECTURE.md` §13: what an honest 18-day build looks like if the Nov 27 date still stands.
- Logged D-034…D-038, Q-022…Q-025, R-020…R-022.

**What is genuinely new:** the market (US/Middle East/Asia, affluent parents, ages 14–18), the pricing history, the **four** features rather than two, the human-competition layer, and the reason Django was ever in the picture (Aditya's existing Python experience).

**The convergence worth noting:** the older chat's "Personal Weakness Engine" and the newer chat's "shared intelligence layer" are the same idea, reached independently in two different sessions. Both say the moat is *cross-cutting weakness detection*, not AI feedback. That is now D-035.

**What I am rejecting from the older chat:** community + matchmaking + tournaments + payments inside a 20-day MVP. It contradicts itself — one paragraph names "empty community" as a launch-killer, another puts a community in the must-ship list. At 20 testers there is no pool to match against. D-037 re-affirms community as post-launch.

**What it re-opened, uncomfortably:** market and geography (Q-022). Our legal and payment work so far assumed India-first; the older strategy is explicitly for paying US parents. Both are viable; only one can be built first.

**Blocking:** Q-021 (scaffold), Q-022 (market), Q-023 (deadline).

---

## 6. Improvement backlog (notes to future us)

- Turn the hero's 12-point acceptance checklist into a real `docs/hero-acceptance.md` checklist that we tick off during implementation.
- Add a `docs/DESIGN-TOKENS.md` once the palette/type choices are final (they are currently "direction", not final values).
- Decide a commit convention so each commit can reference decision IDs (e.g. `feat(hero): entrance timeline (D-015, R-002)`).
- Consider a lightweight ADR (Architecture Decision Record) folder once we pass Stage 4; this journal is fine until then.

---

## 7. Notes on the identity model (my reading of D-003/D-004/D-005)

```
Account (GOW-USER-XXXXX)        ← one login, one billing, one overall profile
├── Personal details
├── Subscription & billing
├── Shared preferences
├── Debate profile (GOW-DEB-XXXXX)
│    ├── sessions, arguments, rebuttals
│    ├── rating, XP, learning path
│    └── reports
└── Extempore profile (GOW-EXT-XXXXX)
     ├── speeches, fluency, pace
     ├── rating, XP, learning path
     └── reports
```

**Shared intelligence layer** reads from both profiles to find cross-cutting weaknesses (e.g. "spontaneous thinking" shows up as weak argument construction in Debate *and* weak structure in Extempore) and can recommend exercises in both — but **never merges ratings**.

**Technical refinement I'd add (needs Aditya's approval → Q-009):** the `GOW-*` strings are *display identifiers*. The database primary key should be a UUID/ulid; the display ID is derived and can be regenerated. This keeps the friendly ID while making authorisation airtight.

---

### S-06 — 2026-11-09 — GO: scaffold + hero built

**Instruction from Aditya:** *"Now GO."* Deadline confirmed aspirational; Razorpay chosen for payments; global product, India-first launch.

**Built**
- Monorepo layout: `web/` (Next.js 16 + TypeScript + Tailwind v4 + GSAP), `docs/`.
- Design tokens in `web/app/globals.css` matching D-008 exactly.
- `Hero` with GSAP entrance timeline, scroll transition, reduced-motion path.
- `RibbonCanvas` — signature artwork: a continuous velocity field, three colour
  streams, no dependencies, device-tiered, auto-degrades if frame time slips.
- `Nav` — transparent → blurred on scroll, full-screen mobile panel.
- `WorldsTeaser` — Debate/Extempore cards + a short vision statement.
- `/signup`, `/signin` — honest placeholders (no fake forms).
- README rewritten with run instructions.

**Decisions taken during the build**
- **D-039:** Signature hero artwork is a hand-written canvas velocity field, **not**
  Three.js in this pass. Rationale: R3F + three.js ≈ 200 KB before a single particle;
  the 2D field costs 0 KB, holds 60fps on low-end Android, and the entrance reads the
  same. Three.js remains an upgrade path for tier-1 desktop only.
- **D-040:** Fonts self-hosted (Space Grotesk + Inter, latin subset, 70 KB total),
  preloaded. No Google Fonts request — protected the LCP budget.
- **D-041:** Landing page must prerender as **static** (verified: `/`, `/signup`,
  `/signin` all `○ Static`). This is launch condition #3 in `ARCHITECTURE.md` §12.2.
- **D-042:** No dead links at any point. `/signin` and `/signup` exist as honest
  "not open yet" pages rather than 404s or fake forms.

**Mistakes found and fixed during this session**
| # | Mistake | How it was caught | Fix |
|---|---------|-------------------|-----|
| M-003 | `bg-gradient-to-r` / `from-brand/70` silently produced **no CSS** in Tailwind v4 (renamed to `bg-linear-to-r`). The accent bars in the world cards were invisible. | Grepped the compiled stylesheet instead of trusting the build passing. | Renamed to v4 utilities; re-verified the rules exist in the output CSS. |
| M-004 | Canvas could seed particles at `width = 0` on first layout, collapsing every particle onto x=0. | Code review before running. | Guard `nextW < 2` and a `seeded` flag. |
| M-005 | Trail segments were drawn from the *new* x to the *new* y — vertical ticks that read as rain, not flow. | Re-reading the draw loop while tuning. | Draw from the previous position to the new one (true motion vector). |
| M-006 | Opening `chatgpt.com` share links returns only the page shell; Chromium cannot be installed in this sandbox (missing `libnspr4`, no root), so **I cannot screenshot the UI myself**. | Attempted `@sparticuz/chromium` + playwright-core; failed with `libnspr4.so`. | Rely on live preview for Aditya + static verification (CSS rule presence, HTTP status, anchor integrity). Logged so it isn't mistaken for thoroughness. |

**Verification performed (not visual — see M-006)**
- `tsc --noEmit` clean · `next build` clean · all 3 routes return 200.
- Every `href` resolves: `#top`, `#main`, `#explore`, `#vision`, `/signin`, `/signup`.
- Fonts preloaded and self-hosted · design tokens present in compiled CSS.
- Contrast pass raised several meta labels from /30–/35 to /45–/50 (AA on dark).
- Hero headline clamp lowered to `2.2rem` minimum so 16 characters cannot overflow
  a 360 px viewport.

**Open:** visual QA by Aditya on real devices (this is the one thing I cannot do from
inside the sandbox), then sections 03–10.

---

### S-07 — 2026-11-09 — Redesign: 2D, vibrant, alive

**Feedback from Aditya:** the page looked terrible; drop the 3D/canvas artwork; deliver
a strong 2D design with motion, a full footer, more content, real charts of
communication skills, a light/dark switch, SVG graphics — "make it vibrant and joy
giving, make it alive."

**Decisions taken**
- **D-043:** The canvas artwork is retired from the hero. Motion is now CSS + SVG only
  (no canvas, no GSAP — dependency removed). Rationale: the artwork was the weakest
  part of the page and carried the most cost; the page now moves through layout,
  typography, marquees, chart animation and hover states instead.
- **D-044:** Light theme added and made the default; dark retained as the cinematic
  counterpart. Preference is stored and resolved before first paint (no flash).
- **D-045:** Illustrative charts live in `lib/sample-data.ts` and are labelled as
  sample data on every surface that renders them. No invented "live" numbers.
- **D-046:** `/develop` (build in public · roadmap · changelog · method) and `/legal`
  (privacy, guardians, terms, cookies, accessibility, security) were created so the
  footer's links all resolve. Unbuilt features are marked "soon", never linked.
- **D-047:** Added text-safe accent tokens (`--c-mint-text`, `--c-sun-text`,
  `--c-flare-text`) so accent-coloured text clear AA on light surfaces.

**Built**
- Full landing page: Hero (+ rotating speak→score→feedback demo), marquee band,
  Problem, HowItWorks, Worlds, SkillData (radar + bars + sparkline), Scorecard,
  Vision, FinalCTA, Footer (4 link columns, logo, copyright, legal, back-to-top).
- Hand-built SVG charts: `Radar`, `Bars`, `Sparkline` — no chart library, animated
  on scroll via CSS only.
- Theme system: tokens on `:root`/`[data-theme]`, mapped into Tailwind with
  `@theme inline`, toggle in nav, OS-preference default, `localStorage` persistence.
- `ScrollReveal`: one IntersectionObserver for the page, plus a 4 s visibility fallback.

**Mistakes found and fixed**
| # | Mistake | Fix |
|---|---------|-----|
| M-007 | The mobile menu was `position: fixed` **inside** a header carrying `backdrop-filter`. A backdrop filter creates a containing block, so the menu would have been trapped inside the 70 px header when scrolled. | Moved the panel out of `<header>` into a fragment sibling. |
| M-008 | Chart bars used `h-full` inside an auto-height flex column — the track would collapse. | Track is now `flex-1` in a fixed-height row. |
| M-009 | Radar axis labels at `1.19 × r` overflowed the viewBox and clipped. | Padding raised to 66, label radius to 1.13 × r. |
| M-010 | The boot script ran in `<body>`, so a dark-preference visitor could see one light frame. | Moved into `<head>` before the document renders. |

**Verified**
- 6 routes, all `○ Static` · every internal link and anchor resolves · both theme token
  sets present in the compiled CSS · utilities resolve to `var(--c-*)` · contrast
  pass on accent text · reduced-motion path present.

**Still open (unchanged):** Q-022 market/pricing, and visual QA on real devices —
the sandbox still cannot run a browser (M-006).

---

### S-08 — 2026-11-09 — The page rendered unstyled (serious)

**What Aditya saw:** the site with correct copy but no layout — no cards, no grid,
default font sizes, buttons still gradient. Effectively an unstyled HTML document.

**Root cause (verified, not guessed):** the dev server was serving a **mismatched
HTML/CSS pair**. `next build` was run while `next dev` was running against the *same*
`.next` directory. The build overwrote the dev server's output, so the HTML came from
one compilation and the stylesheet from another. The directory contained both
`BUILD_ID` (production) and `dev/` at the same time — the fingerprint of the collision.
A secondary aggravating factor: in dev the CSS chunk keeps a **stable filename**
(`app_globals_….css`), so a browser that cached the previous stylesheet keeps using it
against new markup, which reproduces the same symptom even after the server is fixed.

**This is my mistake.** The build passing and the CSS containing the right rules were
both true and both irrelevant — I never verified that the stylesheet a page *links to*
matches the classes in that page's markup.

**Fixed**
- **D-048:** production builds now go to a separate `distDir` (`.next-build`), so a
  build can never clobber a running dev server again.
- **D-049:** `npm run audit:styles` — a script that fetches every route, extracts every
  class from the rendered HTML, and fails if any class has no rule in the CSS that page
  actually links to. Currently: **317/317, 194/194, 145/145, 135/135, 135/135 matched.**
- **D-050:** the preview now runs the **production build**, so every asset has a
  content-hashed filename. A stale cache can no longer produce a mixed page.
- Cleared the corrupted `.next` entirely.

**Second real bug found while verifying (M-012):** the SVG charts used
`fill="var(--c-muted)"` and `stopColor="var(--c-brand)"` as *presentation attributes*.
Custom properties do not resolve there — only in CSS declarations — so the radar was
rendering black-on-black. Moved to `.chart-*` classes and inline `style` stops.

**Lesson recorded (M-013):** "the build is green" and "the CSS file contains the rule"
are not evidence that the page is styled. The only sufficient check is markup ↔
stylesheet coherence, which is now automated and part of the definition of done.

---

### S-09 — 2026-11-09 — Stage 4: accounts, identity, and a form that is actually wired

**Shape of the stage.** One login, three permanent identities, and a registration
page that does real work instead of saying "you're early". Everything below is
built; the only thing missing is a Supabase project to point at.

**What exists now**

```
web/app/signup/page.tsx              real registration form
web/app/signup/check-email/page.tsx  "we sent you a link" (+ guardian variant)
web/app/signin/page.tsx              real sign-in, with link-expiry notice
web/app/account/page.tsx             the three IDs, both worlds, status, sign out
web/app/auth/callback/route.ts       PKCE exchange for the confirmation link
web/app/auth/signout/route.ts        POST-only sign out
web/proxy.ts                         session refresh (Next 16's renamed middleware)
web/lib/auth/validation.ts           age + password rules, shared client/server
web/lib/auth/actions.ts              signUp / signIn server actions
web/lib/supabase/{server,client}.ts  cookie-bound clients, anon key only
web/lib/http.ts                      request origin + in-site redirect guard
supabase/migrations/0001_identity.sql schema, trigger, RLS
web/.env.example                     the two public values, and nothing else
docs/SUPABASE-SETUP.md               thirty minutes, start to verified signup
```

**Decisions**

| # | Decision | Why |
|---|----------|-----|
| D-051 | Display IDs (`GOW-USER-…`, `GOW-DEB-…`, `GOW-EXT-…`) are **labels**, never credentials. UUIDs are the keys. | An ID you read aloud to a friend must not be a key you authenticate with. Crockford base32 (no I/L/O/U) with a checksum character survives being said out loud and typed back. |
| D-052 | Both world profiles are created by the signup trigger, in the same transaction as the account. Never lazily. | "Debate exists, Extempore doesn't yet" is a state no other code should ever have to handle. |
| D-053 | Under 18 → `status = 'pending_guardian_consent'` plus a `guardian_consents` row (14-day token, unique per account). Product floor is 13. | DPDP requires verifiable parental consent for minors. Storing the request, the notice version and the expiry is what makes it verifiable rather than decorative. |
| D-054 | **No write policy and no write grant for clients** on any identity table. Reads are RLS-restricted to your own rows. | See M-015 — an update policy keyed on `auth_user_id = auth.uid()` would have let a minor set their own status to `active`. Writes will be SECURITY DEFINER functions that decide per column. |
| D-055 | Session refresh lives in `proxy.ts`, not in pages. | Server Components cannot set cookies. Without an interception point a token that expires between requests is never refreshed. |
| D-056 | Age and password-strength rules live in one pure module used by both the form and the server action. | The form must never disagree with the server about whether someone is 17 or 18 — and now a test proves they can't. |
| D-057 | `/account` is `force-dynamic` and is not in the nav yet. | It depends on a session cookie; prerendering it is meaningless. The nav link becomes worth adding when the arenas exist, since a signed-in visitor otherwise has nowhere to go *into*. |

**Mistakes**

| # | Mistake | Fix |
|---|---------|-----|
| M-014 | `new Date("2000-02-31T00:00:00Z")` silently rolls into 2 March, so an impossible date of birth was accepted as real. The test caught it, not the code review. | `ageFrom` now builds the date from its parts and round-trips year/month/day; anything that doesn't match is rejected. |
| M-015 | The migration shipped an `accounts` update policy keyed on `auth_user_id = auth.uid()`, which allows updating **any** column — including `status`. A minor could have self-approved. | Policy removed; write grants revoked from `anon`/`authenticated` on all four tables. |
| M-016 | Redirects were built from `new URL(request.url)`, which behind the preview proxy is `http://0.0.0.0:3000` — a host the browser cannot resolve. | `requestOrigin()` reads `x-forwarded-host` / `x-forwarded-proto`. Verified: the confirmation callback now redirects to `https://<preview-host>/signin`. |
| M-017 | `z.literal("on", { errorMap: … })` is Zod 3 syntax; Zod 4 rejects it at compile time. | `{ message: … }`. Caught by `tsc`, not at runtime. |
| M-018 | Next 16 renamed the `middleware` file convention to `proxy`; the build warns on every run. | Renamed to `proxy.ts`, default export. Warning gone. |

**Verified** (production build, port 3000, preview process running)

- `tsc --noEmit` clean · `next build` clean · 10 routes, `/` still static.
- `npm run audit:styles`: `/` 317/317 · `/develop` 194/194 · `/legal` 145/145 ·
  `/signup` 209/209 · `/signin` 195/195 · `/signup/check-email` 185/185.
- Both woff2 fonts `200 font/woff2`; all six routes `200`.
- `npm test`: 6/6 — age boundaries at exactly the birthday, month-order drift,
  future dates, impossible dates, leap day, password scale.
- `POST /auth/signout` → `303` to `/`; `GET` → `405`.
- `/auth/callback` with no code → `/signin?state=link`; with the preview's
  forwarded host → `https://<preview-host>/…` (M-016 fix confirmed).
- Without credentials, `/signup` shows the "database isn't connected" notice and
  a submit returns the explicit "not configured" message. By design.

**Not verified — and I will not claim otherwise**

- Anything interactive: the guardian field appearing when a date of birth under
  18 is typed, the password meter filling, the pending label on submit. The
  sandbox still cannot run a browser (M-006), so these need Aditya's eyes.
- The end-to-end Supabase path: no project exists, so no auth user, no trigger
  run, no `/account` render with real rows. `docs/SUPABASE-SETUP.md` step 6 is
  the checklist that closes this.

**Blocked on Aditya**

- Create the Supabase project (Mumbai `ap-south-1` unless he says otherwise),
  paste two values into `web/.env.local`, run the migration. Q-014 answers itself
  the moment he picks the region at project creation.
- Q-016 (email provider) still gates real signups: Supabase's built-in sender is
  2 messages/hour to organisation members only. Fine for testing his own address;
  unusable for anyone else.

---

### S-10 — 2026-11-09 — A form is a task: auth pages get their own shell

**Aditya asked for two things:** a confirm-password field, and no full marketing
footer on login and registration — just small links to the terms and the privacy
policy.

**D-058 — route groups instead of a conditional footer.** The footer was in the
root layout, so "hide it on two pages" had no honest server-side answer: a client
component checking `usePathname()` would ship the footer in the HTML and then
flicker it away. The app is now split into `app/(site)/` (nav + footer) and
`app/(auth)/` (no nav, no footer, one line of legal links), both under the same
root layout. URLs are unchanged, `/` and the marketing pages keep their chrome,
and the auth pages genuinely do not render the footer at all.

Auth pages keep one piece of chrome: the theme toggle, floating top-right. A
visitor who has chosen dark should not be thrown into a light form because we
removed the nav.

**The legal line** now sits at the foot of the form column — *Terms & conditions
· Privacy policy · giftofwords.app* — and the `check-email` page gets it too,
because somebody waiting on a confirmation link is still a data subject.

**D-059 — confirm password is a second field and the same rule.** The client
shows "Those passwords don't match yet" as soon as they start typing the second
one, but the gate is server-side: the zod schema compares the two through
`passwordsMatch()` in `lib/auth/validation.ts`, the same function the form calls.
The confirmation value is never sent to Supabase — it exists to catch a typo, not
to authenticate.

**Verified** (production build, port 3000)

- `tsc` clean · `npm test` **7/7** (new: confirmation is exact equality,
  whitespace included) · build clean, 10 routes.
- Style audit after removing nav and footer: `/` 317 · `/develop` 194 ·
  `/legal` 145 · `/signup` **153** (was 209) · `/signin` **136** (was 195) ·
  `/signup/check-email` **130** (was 185). The class counts dropping is the
  evidence that the chrome is gone, not merely hidden.
- Footer still present on `/`, `/develop`, `/legal`; absent on `/signup`,
  `/signin`.
- `/signup` markup contains `name="confirmPassword"`, the legal nav, and exactly
  one theme toggle.
- The guardian step on `check-email` renders only with `?guardian=1`.

**Still not verified:** the interactive behaviour of the new field (the mismatch
message appearing as you type) — no browser in this sandbox (M-006).

**Note for later:** the account page still sits in the site group and therefore
still carries the marketing footer. It is not wrong, but an authenticated app
shell with its own nav is the right long-term answer, and that belongs with the
arenas in Stage 5.

---

### S-11 — 2026-11-09 — Borrowing the craft, keeping the identity

**What Aditya gave me:** 19 files from another dev's landing page — React + Vite +
Tailwind 4 + framer-motion, with an editorial serif, a warm paper canvas and ember
red. He asked for the *feel*: the motion, the animations, the effects.

**What I found in it.** The quality was not in the colour. It was in five things:
masked line reveals on one shared easing curve (`cubic-bezier(.22,1,.36,1)`); a
hero panel that *performs* the product (typewriter transcript, 44 seeded waveform
bars, a coach line that expands once typing finishes, two chips floating on 7s and
5.4s); small physical touches (magnetic CTA, sheen sweep, cursor spotlight,
self-drawing underline); typographic nerve (display to 6.4rem at 0.92 leading, one
light italic word in the accent colour, mono micro-labels at 9.5px/0.18em); and a
scroll progress hairline.

**Decision (Aditya's, offered as a three-way fork): D-060 — keep our identity,
import the craft.** Charcoal + violet/blue/magenta/cyan and Space Grotesk stay
(D-008 unchanged); no rebrand of auth, legal or develop.

**D-061 — no framer-motion.** Their page leans on it in 14 files. We rebuilt the
same vocabulary as CSS keyframes plus five tiny vanilla components. Measured cost
on `/`: **178 KB gzipped JS, 10 KB gzipped CSS**. Their motion layer alone would
have added roughly 40–60 KB gzipped — on the ₹15k phones this product is for,
that is the difference between a page that arrives and one that is watched
arriving.

**D-062 — one curve, one observer, one listener.** `--ease` is used for every
transition and keyframe; `ScrollReveal` remains the single IntersectionObserver;
`SpotlightCursor` is a single passive `pointermove` listener with an rAF guard,
mounted once, writing `--mx`/`--my` straight to the node. No per-card React state,
no re-render per frame.

**D-063 — I refused their numbers.** Their page claims *"42,318 speakers · 61
countries"*, "SOC 2 Type II", "Cohort 14 enrolling" and a countdown timer. We are
pre-launch. Ours stay real and labelled: two worlds, six skills, five minutes a
day, and the demo panel still says "Illustrative interface — not a live session."

**Built**

| Piece | What it does |
|---|---|
| `.mask` / `.mask-line` | Headline cut into lines, each rising from 115% with 110 ms stagger, 1.05 s on `--ease`. No JS: pure CSS animation with per-line delay. |
| `.accent-word` | The last word carries its own gradient *and* underlines itself (scaleX 0→1 at 1.08 s), unaffected by the text clip because the underline is a pseudo-element background. |
| `.rise` | Staggered load-in for the pill, subcopy, CTAs and stats (60 → 820 ms). |
| `.btn-sheen` | A light sweep across the primary CTA every 5.2 s, skewed 18°. |
| `.magnetic` | CTA follows the pointer ~22%, desktop only, bails under reduced motion. |
| `Waveform` | 44 bars, heights from a seeded sine hash — deterministic, so server and client agree. Each bar has its own duration and negative delay. |
| `Typewriter` | Types the transcript, caret blinking, restarts each rotation. Reduced motion prints the whole line. |
| `CountUp` | Hero stats count once on view with ease-out cubic; reduced motion gets the final value. |
| `SpotlightCursor` | Cursor spotlight on the Worlds and How-it-works cards. |
| `.scroll-progress` | 2 px gradient hairline under the header, scaleX driven by scroll. |

**Verified** (production build, port 3000)

- `tsc` clean · `npm test` 7/7 · build clean, `/` still `○ Static`.
- Style audit: `/` **324/324** (was 317), `/develop` 196, `/legal` 147, `/signup`
  153, `/signin` 136, `/signup/check-email` 130 — every class has a rule.
- All eight keyframes present in the served stylesheet: `mask-up`, `ink-grow`,
  `sheen`, `wave-dance`, `rise-in`, `ring-out`, `float-y`, `caret-blink`.
- Markup confirmed in the served HTML: 2 mask lines, the accent word, the sheen
  class, both floating chips, 40 waveform bars, 10 spotlight surfaces, the
  progress bar, the magnetic wrapper.
- H1 still reads exactly "Unlock the power of your words." (D-011 intact).

**M-019 — their screenshots arrived with no stylesheet.** All four images show
bare text, no cards, no grid, plus a dev overlay. Same failure class as our S-08.
It is a useful reminder from the outside: source code that exists and a build that
passes still say nothing about what the page looks like. I judged the code.

**Not verified — needs his eyes**

Everything visual. This sandbox cannot run a browser (M-006), so I cannot confirm
the mask reveal lands cleanly, whether the chips collide with the panel at 768 px,
or whether the accent-word underline sits at the right optical weight under the
descender of "words." Those are judgements for a screen, not for a terminal.

**Left on the table (deliberately, for a later pass)**

- Section headings could take the same mask reveal (`reveal-lines` is built and
  wired into the observer, unused so far) — I did not force line breaks into
  responsive headings without being able to look at them.
- Their scroll-driven market map + dossier panel is genuinely good interaction
  design; the equivalent for us is a world/skill selector, and it deserves real
  data rather than more invented numbers.
- Back-to-top ring, FAQ and pricing sections exist in their build; ours need copy
  decisions (Q-024) before they are worth building.

---

### S-12 — 2026-11-09 — Security pass: what was actually broken

**Aditya asked** whether we had checked for data leakage, server-side admin
control, and everything else a platform holding minors' data should worry about.
The honest answer was no — there had been care in specific places and no pass
whose only job was to attack the thing. This is that pass. Full report:
**`docs/SECURITY.md`**.

**The serious one (S-02).** `@supabase/ssr` defaults session cookies to
`httpOnly: false`, because its browser client reads the session from
`document.cookie`. We inherited that default without looking. It meant any XSS —
ours or a dependency's — yields a session. Since every auth operation here is
server-side, the browser never needed to read that cookie, so it is now
`httpOnly`, `SameSite=Lax`, and `secure` in production, set in **both**
`lib/supabase/server.ts` and `proxy.ts` (the refresh in the proxy is the write
that matters). The unused browser client was deleted rather than left as a trap.

**No headers at all (S-01).** The site could be framed — a login form inside an
attacker's iframe is clickjacking with extra steps. There is now a CSP plus
`nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP, and HSTS on a real
origin. `frame-ancestors` lists the platform hosts until `NEXT_PUBLIC_SITE_URL`
is set, at which point it collapses to `'none'`; that switch is what keeps the
preview embeddable and production not.

**D-064: CSP allows `'unsafe-inline'` for scripts and styles — deliberately.**
Next injects inline bootstrap scripts and this codebase sets inline style
objects. A policy without it breaks hydration on every page. The nonce upgrade
needs `headers()` in the root layout, which forces every route dynamic — a bad
trade for a site that is static, escapes all input, and loads no third-party
code. The policy still forbids other origins, `<base>` injection, off-site form
posts, plugins and framing.

**D-065: sign-up is no longer an oracle (S-03).** It used to answer "that email
is already registered". On a platform where an account quietly reveals that a
named teenager is studying here, that is a privacy leak dressed as helpfulness.
It now redirects to the same screen a new sign-up reaches, and the screen says
"If this address can be used, a confirmation link is on its way." The cost is
real: someone who forgot they had an account waits for a mail that will not come.
The sign-in link is directly below.

**Consent tokens (S-04, S-05).** They were `md5(uuid)` — not a hash of a secret,
just a scrambled identifier. Now 32 bytes from `pgcrypto`, stored as SHA-256. And
the consent row is no longer client-readable: when the approval flow is built, a
minor reading their own token and approving themselves would have been trivial.
The app never needed that read.

**D-066: admin control is deliberately absent, and that is the safe state.**
Nothing in this app can administer anything, because nothing holds the
service-role key — the one credential that ignores RLS. Today, control means the
Supabase dashboard. When an admin panel is built it must be a **separate
deployment** with the key in server-only env, an `admins` table checked on every
request, and an append-only audit log. Putting an admin panel into the app users
load is how this class of product gets owned.

**Also fixed:** internal functions were executable by every role (Postgres grants
`EXECUTE` to `PUBLIC` by default) — revoked; a honeypot on sign-up, off-screen and
`aria-hidden`, which returns the success screen and creates nothing; `X-Powered-By`
off; `delete_my_account()` added for DPDP erasure (SECURITY DEFINER, deletes only
`auth.uid()`, everything cascades — **SQL only, no button yet**); Dependabot and a
disclosure policy.

**Verified:** CSP, `nosniff`, `Referrer-Policy`, `Permissions-Policy` and COOP
present on `/`, `/signup`, `/account` **and** static assets; `X-Powered-By` gone;
`/account` still `no-store`; `npm audit --omit=dev` 0 vulnerabilities; no secrets
in git history; 7/7 tests; build clean; style audit 6/6 (signup 154, +1 for the
honeypot).

**Not fixed, because it needs him:** CAPTCHA (Turnstile, free) and Supabase rate
limits — the only real brute-force and spam defence we get on this budget; leaked
password protection (one toggle); preview deployment protection; a nightly
`pg_dump`, since the free tier has **no backups**; and the email provider, without
which the verification step is theatre.

**Still open:** the admin surface, the delete button, data export, audit logging,
and a real pen test before launch. All tracked in `docs/SECURITY.md` §5.

---

### S-13 — 2026-11-09 — Making the build Vercel-shaped before Vercel sees it

**Aditya's next step** is merging, cloning locally, then connecting Vercel and
Supabase. One thing had to change first.

**D-067: production builds go back to `.next`; development moves to `.next-dev`.**
After S-08 the build wrote to `.next-build` to stop it colliding with the dev
server. That was right for this sandbox and wrong for Vercel, which looks for
`.next`. Rather than rely on Vercel honouring a custom `distDir`, the isolation
moved to the side that actually needs it:

| Script | Directory |
| --- | --- |
| `npm run dev` | `.next-dev` |
| `npm run build` | `.next` (default, what Vercel expects) |
| `npm start` | `.next` |

The original guarantee holds — a dev server and a build can never write to the
same place — and the default output directory is the one the platform looks for.

**Also added:** `docs/DEPLOY-VERCEL.md`. Root directory `web`, the three `NEXT_PUBLIC_*`
values (and why they must exist before the first build), the Supabase redirect URL,
the post-deploy checklist, and the two things that will bite on the free tier:
public preview URLs and no database backups.

**Verified after the change:** build writes `.next` only; the preview restarted
from that build; style audit 6/6 unchanged (324 / 196 / 147 / 154 / 136 / 130);
all five routes 200; CSP still present on every response.

**Not verified:** that Vercel builds it. Nobody has connected the repository yet.

---

### S-14 — 2026-11-10 — The dev script only worked on Unix

**Aditya cloned on Windows** and `npm run dev` died immediately:

```
'NEXT_DIST_DIR' is not recognized as an internal or external command
```

**M-020 — a POSIX-only npm script.** In S-13 I isolated the dev server with
`NEXT_DIST_DIR=.next-dev next dev`. That leading `VAR=value command` form is
shell syntax; on Windows npm runs scripts through `cmd.exe`, which reads
`NEXT_DIST_DIR` as the name of a program. Every script I write runs here on
Linux, so it passed review, the build and the audit — and was broken for the
only person who actually has to run it.

**Fixed by removing the env var from the script entirely.** `next.config.mjs`
now chooses the directory from `NODE_ENV`, which Next sets before loading the
config:

| Command | `NODE_ENV` | Directory |
| --- | --- | --- |
| `next dev` | `development` | `.next-dev` |
| `next build` · `next start` | `production` | `.next` |

Identical behaviour on Linux, macOS and Windows, and the isolation from S-08
still holds. `NEXT_DIST_DIR` remains as a manual override.

Also made portable in the same commit: `npm test` now names
`scripts/validation.test.mjs` explicitly, because `scripts/*.test.mjs` relies on
the shell expanding the glob — `cmd.exe` does not.

**Lesson:** a script that only ever runs on the machine it was written on is not
verified. Cross-platform is a correctness property, not a nice-to-have.

**Verified:** config resolves `.next-dev` under `NODE_ENV=development` and
`.next` under `production`; build clean; 7/7 tests via the explicit path; style
audit 6/6 (324 / 196 / 147 / 154 / 136 / 130); `tsc` clean.

---

### S-15 — 2026-11-10 — Tailwind needed a newer Node than his

**The error, on Windows:**

```
Build Error — Error evaluating Node.js code
./app/globals.css
Error: require() of ES Module
  ...\node_modules\magic-string\dist\index.mjs not supported.
```

**Cause, proven rather than guessed.** `@tailwindcss/node` is CommonJS and calls
`require("magic-string")`. `magic-string@1.4.5` — the version Tailwind 4.3.5
resolves — has an exports map of exactly one entry, `"./dist/index.mjs"`. There is
no CommonJS build to fall back to. Node learned to `require()` an ES module in
**22.12** (and backported to 20.19); below that it throws `ERR_REQUIRE_ESM`.
Our sandbox builds clean on 22.22.3, which is why every check I ran passed.

**M-021 — the project never declared the Node version it needs.** Nothing in
`package.json` said 22.12; nothing stopped an older Node from installing and
failing three layers deep in a CSS compiler. Fixed with `engines.node: ">=22.12.0"`,
`.nvmrc`, and `.npmrc` with `engine-strict=true`, so `npm install` now fails
immediately with *"Unsupported engine"* instead of surfacing as a build error.

**Verified:** `engines` present; `npm ci` accepts Node 22.22.3 with
`engine-strict` on; build clean; style audit 6/6; 7/7 tests; `tsc` clean.

**Not verified:** that his machine is now on 22.12+. He has to run `node -v`.
