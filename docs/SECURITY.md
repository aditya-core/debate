# Security audit — 9 Nov 2026

Scope: the whole application at commit `f9829c9` plus the identity schema. This
is the working document, not a certificate. It lists what was found, what was
fixed in code, what needs a person with dashboard access, and what is accepted
with a reason.

Nothing here has been tested against a live Supabase project, because one does
not exist yet. Claims are about code, not about observed behaviour.

---

## 1. Fixed in code

| # | Finding | Severity | Fix |
|---|---------|----------|-----|
| S-01 | **No security headers at all.** Any page could be framed (clickjacking on the login form), MIME types were sniffable, and no CSP existed. | High | `next.config.mjs` now sets CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and HSTS on a configured production origin. |
| S-02 | **Session cookies were not httpOnly.** `@supabase/ssr` defaults to `httpOnly: false`; after an XSS the session could be read straight out of `document.cookie`. | High | `httpOnly: true`, `sameSite: lax`, `secure` in production — set in both `lib/supabase/server.ts` and `proxy.ts`, because the refresh in `proxy.ts` is the write that actually matters. |
| S-03 | **Sign-up confirmed whether an email already had an account.** A form that answers "that email is registered" is an oracle for who studies here — unacceptable on a platform holding minors' details. | Medium | The "already registered" branch now redirects to the same confirmation screen a new sign-up reaches. The screen's copy is neutral: "If this address can be used, a confirmation link is on its way." |
| S-04 | **Consent tokens were `md5(uuid)`.** Cheap to brute force for anyone who ever obtains a database dump, and not a hash of a secret. | Medium | 32 random bytes from `pgcrypto`, stored as a SHA-256 hex digest. The token itself is never stored. |
| S-05 | **The consent row was client-readable.** When the approval flow is built, a minor could have read their own token and approved themselves. | Medium | `consents_select_own` policy dropped. The app never needed to read this table. |
| S-06 | **Internal functions were executable by every role.** Postgres grants `EXECUTE` on new functions to `PUBLIC`. | Low | Revoked on `gow_display_id`, `touch_updated_at`, `handle_new_user`. Only `delete_my_account` is granted, to `authenticated`. |
| S-07 | **No bot defence on sign-up.** | Medium | Honeypot field, off-screen, `aria-hidden`, `tabindex="-1"`. A filled field returns the success screen and creates nothing. |
| S-08 | **An unused browser Supabase client existed.** With httpOnly cookies it would silently stop working, and it invites someone to put auth back in the browser. | Low | Deleted. All auth is server-side. |
| S-09 | `X-Powered-By: Next.js` advertised the stack. | Info | `poweredByHeader: false`. |
| S-10 | **No erasure path**, which DPDP requires. | High (compliance) | `delete_my_account()` in `0002_security.sql`: SECURITY DEFINER, deletes only `auth.uid()`, everything else cascades. **Not yet wired to a button** — see §5. |

Verified after the change: CSP and the other headers are present on `/`,
`/signin` and `/account`; `/signin` and `/account` still return
`Cache-Control: private, no-cache, no-store`; no secrets are tracked in git and
`.env*.local` is ignored; `npm audit --omit=dev` reports 0 vulnerabilities.

---

## 2. Data leakage — what is where

- **The anon key is public by design.** It ships in the bundle. It is safe
  *because* RLS is on: every table in `public` has RLS enabled and clients can
  read only their own rows.
- **No service-role key exists anywhere** in the app, the repo, or the history.
  This is the single most important invariant in the project: that key ignores
  RLS entirely.
- **Nothing user-specific is cached.** `/account` is `force-dynamic` and
  `no-store` (verified in the response headers); the marketing pages are static
  and contain no personal data.
- **No third-party scripts, no analytics, no advertising pixels.** Nothing on
  the page phones home, so there is nothing to leak to a third party and no
  cookie-consent problem to solve — yet. Adding analytics later re-opens both.
- **Server actions never echo input back into HTML.** React escapes by
  construction; the only reflected values are `?email=` and `?state=` on the
  check-email and sign-in screens, both rendered as text, not markup.
- **No PII in logs.** We log nothing. Next's own error output is the only
  channel, and it does not receive form values.

---

## 3. What a person with dashboard access has to do

These cannot be fixed from this repository.

| # | Action | Why |
|---|--------|-----|
| A-01 | **Turn on CAPTCHA** — Cloudflare Turnstile is free — then enable CAPTCHA protection in Supabase → Auth → Settings. | The honeypot stops naive bots. Turnstile stops the rest. Without it, a script can create thousands of accounts and burn the mail quota. |
| A-02 | **Review Supabase Auth rate limits** (sign-ups, sign-ins, token refreshes, email sends). | This is the only real rate limiter we get for free. Serverless in-memory counters are useless — every cold start forgets. |
| A-03 | **Enable "leaked password protection"** in Supabase Auth. | Checks passwords against HaveIBeenPwned; free; one toggle. |
| A-04 | **Set `NEXT_PUBLIC_SITE_URL`** in Vercel once the domain exists. | Also flips `frame-ancestors` to `'none'` and turns on HSTS — see S-01. |
| A-05 | **Protect preview deployments** in Vercel. | Previews are public URLs. Before launch, they should need a login. |
| A-06 | **Schedule a `pg_dump`.** | The free tier has **no backups**. One bad migration and the first cohort is gone. A nightly dump to storage we control costs nothing. |
| A-07 | **Decide session lifetime.** Supabase's refresh cookie currently lives up to 400 days. | Long-lived sessions on shared school devices are a risk. 30 days is a defensible default for this product. |
| A-08 | **Email provider** (Q-016). | Until SMTP exists, confirmation mail reaches nobody, which means the verification step is not actually happening. |

---

## 4. Accepted risks, with reasons

- **CSP allows `'unsafe-inline'` for scripts and styles.** Next injects inline
  bootstrap scripts and this codebase uses inline style objects; a policy
  without it breaks hydration. The policy still forbids any script from another
  origin, injected `<base>`, off-site form posts, plugins, and framing. The
  upgrade path is a nonce per request in `proxy.ts` — but that requires reading
  `headers()` in the root layout, which would force every page to render
  dynamically. Not worth it while the site is static and escapes everything.
- **Sign-out has no CSRF token.** `SameSite=Lax` means a cross-site POST does not
  carry the session cookie, so a third party cannot sign a user out. Nothing
  else in the app mutates data from a form.
- **`x-forwarded-host` is trusted for redirect origins.** Required behind a
  proxy — `request.url` is the internal bind address. Vercel overwrites the
  header; the residual risk is an untrusted hop in front of us, which we would
  have anyway. Setting `NEXT_PUBLIC_SITE_URL` removes the dependency entirely.
- **No application-level rate limiting.** On serverless, in-memory counters
  reset with every cold start and give false comfort. Supabase's auth limits plus
  Turnstile are the honest answer.

---

## 5. Still open — real work, not yet done

| # | Item | Notes |
|---|------|-------|
| O-01 | **Admin surface.** There is no admin panel, and no admin can act from inside the app. | Today, control is the Supabase dashboard: SQL, RLS, users. When an admin panel is built it must be **a separate deployment** holding the service-role key in server-only env, gated by a `admins` table checked server-side on every request, with an append-only audit log of every read and write. The key must never appear in the user-facing app. |
| O-02 | **Wire `delete_my_account()`** to a two-step confirmation on `/account`. | The SQL exists; the button does not. |
| O-03 | **Data export** (DPDP access right). | A `GET /account/export` returning the user's rows as JSON, generated server-side. |
| O-04 | **Audit logging** for consent, deletion and any future admin action. | Append-only table, no client access. |
| O-05 | **Content moderation** for anything users will publish (nothing is published yet). | |
| O-06 | **Dependency automation.** | `dependabot.yml` added; it needs the repo settings to enable alerts. |
| O-07 | **A real penetration test** before public launch, and a second pass once payments exist. | Razorpay webhooks will introduce a new, more interesting attack surface than anything here. |

---

## 6. What we are still assuming

- That Supabase's RLS is actually on in the live project. The migration turns it
  on, but **nobody has verified it against a running database**, because there
  isn't one. Step 6 of `docs/SUPABASE-SETUP.md` checks exactly this and must be
  run before the first real user.
- That the trigger provisions every account. Same reason.
- That the platform proxy sets `x-forwarded-host` honestly.
