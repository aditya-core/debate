# Gift of Words — Product Brief

> Distilled understanding of the project, reconstructed from Aditya's design discussion.
> This is the "what are we building" document. The "what happened" document is `PROJECT-JOURNAL.md`.
> Status: **v0.1 — draft understanding.** Not yet confirmed line by line by Aditya.

---

## 1. In one paragraph

**Gift of Words** is an AI-powered communication training platform. A student (or any ambitious communicator) practises speaking in two independent worlds — **Debate** and **Extempore** — and is evaluated, rated and coached by AI. The product's claim is not "learn English"; it is that *the ability to think clearly and express it powerfully is a superpower*, and it can be trained deliberately.

## 2. Positioning (locked)

| Axis | Decision |
|------|----------|
| Brand personality | Cinematic **+** intellectual (hybrid) |
| Colour | Vibrant accents on a dark charcoal foundation |
| Motion | Immersive — but every animation must communicate, create emotion, or guide attention |
| Audience | "Everyone" — students, university applicants, young professionals |
| Anti-positioning | Not another generic AI SaaS template; not an English-learning app; no "master speaking in 30 days" style claims |

## 3. Identity architecture (locked)

- **One account, one login, one overall communication profile.**
- Two sub-identities with **permanent, independent** records:
  - `GOW-DEB-XXXXX` → Debate: sessions, arguments, rebuttals, rating, XP, reports, learning path.
  - `GOW-EXT-XXXXX` → Extempore: speeches, fluency, pace, rating, XP, reports, learning path.
- Both sub-profiles are **auto-created at registration**.
- IDs are **identifiers, not credentials** — every request is authorised through the parent session.
- **Shared intelligence layer** reads across both worlds to find common development areas, and can recommend exercises in both. It **never blends competitive scores** — each world keeps its own rating.

## 4. Design system (direction, not final values)

| Token | Value | Purpose |
|-------|-------|---------|
| Background | `#10111D` | Primary canvas |
| Surface | `#191A2B` | Nav & overlays |
| Violet | `#7945E8` | Brand accent |
| Electric blue | `#258BFF` | Energy / depth |
| Magenta | `#E34FBF` | Expressive highlights |
| Cyan | `#53D8E8` | Light / contrast |
| White | `#F8F8FC` | Primary type |

Typography: Space Grotesk / Sora for headlines, Inter / Manrope for body — **not final**, to be tested against the real headline at desktop + mobile sizes.

Guiding line from the design discussion: *"If everything glows, nothing glows."*

## 5. Landing page blueprint (10 sections)

| # | Section | Job |
|---|---------|-----|
| 01 | Navigation | Transparent over hero → blurred dark surface on scroll. Links: Explore / Our Vision / Sign In / Get Started |
| 02 | **Hero** | Stop the scroll. Emotional identity. See §6 |
| 03 | The problem | "Having an idea is one thing. Expressing it is another." |
| 04 | Two worlds | Introduce Debate World + Extempore World |
| 05 | Meet your AI coach | Show what real practice + feedback feels like |
| 06 | Your growth journey | Baseline assessment → skill development → adaptive practice → progress |
| 07 | Product showcase | Convincing preview of the actual interface |
| 08 | The bigger vision | Human debates, competitions, tournaments — **clearly marked coming soon** |
| 09 | Final CTA | Closing moment |
| 10 | Footer | Contact, privacy, terms, accessibility, social |

Rule from the discussion: *"A beautiful entrance that leads to a mediocre product is an expensive magic trick."* — the practice experience must be as strong as the landing page.

## 6. Hero specification v1.0 (locked content)

**Content**

- Brand label: `GIFT OF WORDS`
- Eyebrow: `THE POWER OF COMMUNICATION`
- Headline: **Unlock the power of your words.**
- Supporting line: *Think clearly. Speak confidently. Communicate exceptionally.*
- Description: *An intelligent communication training experience designed to help you sharpen your thinking, strengthen your expression and make your voice matter.*
- Primary CTA: **Begin your journey** → registration
- Secondary CTA: **Discover the experience** → scroll to product intro
- Scroll cue: *Scroll to explore*
- Visual motif: `THINK · EXPRESS · IMPACT` — three interweaving streams

**Motion storyboard (target, not rigid)**

| Time | Event |
|------|-------|
| 0.0–0.6s | Dark canvas, subtle light bloom |
| 0.6–1.5s | `THINK` emerges from darkness |
| 1.5–2.8s | Letterforms dissolve into particles |
| 2.8–4.2s | Particles form flowing 3D streams |
| 4.2–5.4s | Streams weave through expressive letterforms |
| 5.4–6.6s | Headline reveals progressively |
| 6.6–7.5s | Supporting copy settles |
| 7.5–8.0s | CTAs appear |
| after | Continuous organic idle motion; does **not** loop the entrance |

**Craft rules (explicitly forbidden):** identical particle motion, perfectly linear ribbons, random floating blobs, heavy blur, flashing/pulsing, cursor interactions that fight reading, dark-pattern-ish glassmorphism everywhere.

**Interaction:** subtle pointer parallax · scroll transforms artwork into next section · full-screen mobile menu · primary CTA reachable at all times.

**Responsive:** mobile <768 · tablet 768–1023 · desktop ≥1024. Mobile gets an independently designed composition and a lighter animation path (not a shrunken desktop scene).

**Acceptance (12 points, condensed):** approved copy present · nav works desktop+mobile · both CTAs correct · type and 3D art coherent · entrance smooth · idle motion not distracting · pointer interaction causes no layout instability · scroll transition natural · mobile independently polished · reduced-motion + no-WebGL fallbacks · no horizontal overflow or CLS · tested on mobile and desktop.

## 7. Development sequence (8 stages)

| Stage | Deliverable |
|-------|-------------|
| 1 | **Product blueprint** — pages, journeys, data ownership, features, navigation |
| 2 | **Visual identity & design system** — colour, type, spacing, components, motion principles |
| 3 | **Landing page** — first polished visible milestone |
| 4 | **Auth & identity backend** — register, verify, login, parent ID, auto sub-profiles |
| 5 | **Onboarding & baseline assessment** — 5-minute journey, initial profile |
| 6 | **Debate + Extempore dashboards** — independent worlds |
| 7 | **AI practice & intelligence** — Gemini, student memory, evaluation, voice, adaptivity |
| 8 | **Testing & launch** — security, responsiveness, AI reliability, a11y, performance |

Rationale for the order: building all backend first blocks on unknowns (e.g. *"should switching worlds preserve the last visited page, exercise and unfinished session?"* — that decision touches session storage, schema, DB relations **and** frontend state). Building only the landing page first risks beautiful screens that later need redesign.

**Immediate next step as understood:** finish/agree the blueprint, then execute the hero brief (scaffold Next.js + TS + Tailwind + GSAP + R3F if nothing exists, per the handoff brief's own instruction). Pending Aditya's call → Q-010.

## 8. Known gaps (do not guess these)

1. **Datastore** — not named anywhere. Postgres? Supabase? Firestore? (Needed for the identity model.)
2. **Auth provider** — not named. Custom, Better Auth, NextAuth, Clerk?
3. **Hosting / storage** — not named. Vercel? Audio file storage (S3/R2)?
4. **Speech pipeline** — transcription + pronunciation/pace scoring engine not chosen (Gemini alone cannot measure pace/fluency precisely).
5. **Rating & XP model** — how rating is computed, whether it is ELO-like, whether XP is event-sourced.
6. **Age policy / consent** — minors + voice data. Legal basis, retention, deletion.
7. **Monetisation** — "subscription and billing" exists in the identity model but no plans/pricing are defined.
8. **Sections 03–10 detailed specs** — only headlines/intent exist; hero is the only fully specified section.

---

## 9. Earlier context — the AI Mode conversation (2026-11-07)

> **Status: CONTEXT ONLY.** Aditya's instruction (2026-11-09): *"the discussions we did above will prevail over these older chats — this is just for info."*
> Where this section contradicts §1–§8, §1–§8 wins. Recorded so the reasoning trail isn't lost.

### 9.1 What it adds that we did not have

**Market and money**
- Target: **affluent parents in the US, Middle East and Asia**; students aged **14–18**, primarily US high-school debaters / admissions candidates.
- Positioning: **"24/7 AI Leadership & Rhetoric Coach"** — an investment in a child's future, not an education app.
- Pricing history: original idea **$65/mo or $99 per 3 months** (≈49% discount — flagged as too aggressive) → suggested **$59 / $139 / $399** → revised **$14.99/mo · $34.99/quarter · $99/yr**, founding member **$9.99**.
- Possible **B2B stream later**: schools, universities and debate clubs running competitions on the platform.

**Scope**
- **Four** experiences, not two: AI Debate Coach · Extempore Trainer · **Interview Simulator** (admissions/scholarship panels) · **Speech Vitals analytics** (filler words, WPM, tone variance, structural logic).
- A **human layer**: skill-based matchmaking, Elo-style ratings in divisions (Beginner 0–799 → Elite 2000+), weekly tournaments, leaderboards, reputation.
- The **Personal Weakness Engine**: detect recurring failure patterns (weak evidence, no rebuttal, too fast, conclusion without reasoning) and generate targeted exercises.

**Strategy**
- Differentiation is **training methodology, not AI feedback**. "Anyone can connect Gemini to a microphone."
- Judge design: separate **AI debater** from **AI judge**; structured rubrics; store session history.
- Scale caveat: *"don't build your business around free API quotas — voice interactions need a proper cost model."*

**Execution**
- 35-day sprint: **Nov 27, 2026 = Day 20 MVP**, **Dec 12 = Day 35 first revenue**.
- Day-35 targets: 150–250 registered, 50–100 active, 10–20 paying, **$100–300 MRR**.
- Web-first, not React Native; **asynchronous** human debates first, live voice later.
- Marketing from day 1; 20–30 founding testers; don't advertise unbuilt features.
- Django chosen because **Aditya already knows Python/Django** — this is the origin of D-018.

### 9.2 Where it conflicts with our decisions (newer wins)

| Topic | Older chat (Nov 7) | Our decision (Nov 9) | Verdict |
|-------|--------------------|----------------------|---------|
| Human community at launch | "Must ship" — matchmaking, leaderboard, async debates | AI-only at launch; community is "coming soon" on the landing page | **Our decision wins.** An empty community is worse than no community — the older text admits this itself |
| Backend | Django (because Aditya knows it) | Next.js + Supabase only, Phase 0; Django deferred | **Our decision wins** on hosting economics, *not* on merit — Django is deferred, not wrong |
| Timeline | Sellable MVP in 20 days, revenue in 35 | Staged: blueprint → design system → landing → auth → onboarding → dashboards → AI | **Unresolved** — see Q-023 |
| Market | US/international premium | India-first assumed (DPDP, ₹-scale) | **Genuinely unresolved** — see Q-022. This is the biggest open item |
| Pricing | $65 → $59 → $14.99 → $9.99 founding | Not locked at all | **Open** (Q-024) |
| Number of worlds | Four features + human arena | Two sub-IDs: Debate, Extempore (D-003) | **Open** — interview room and speech vitals need a home (Q-025) |

### 9.3 My read on the older conversation

**Its best idea** is the Personal Weakness Engine. It is also, independently, the same idea as the "shared intelligence layer" in the newer conversation — two separate design sessions converged on *cross-cutting weakness detection as the moat*. When two independent analyses land on the same differentiator, that is usually the real product.

**Its weakest advice** is the 20-day plan that includes community, matchmaking, tournaments and payments. It is self-contradictory: the same message warns that "an empty community" is one of five things that will destroy the launch, and also puts a community in the Day-20 must-ship list. At 20–30 testers there is no matchmaking pool — the feature cannot demonstrate its only value.

**Its pricing critique is right**: a 49% discount for a 3-month commitment destroys MRR and trains users to never pay monthly.

**Its stack advice was reasonable for its assumptions** (solo dev, Django experience, 20 days) and became wrong once the motion-heavy premium landing page and the ₹0 budget entered the picture.
