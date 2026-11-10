# Deploying to Vercel

Ten minutes, once. Free (Hobby) tier.

---

## 1. Import the repository

Vercel → **Add New… → Project → Import Git Repository** → `aditya-core/debate`.

The defaults that matter:

| Setting | Value |
| --- | --- |
| **Root Directory** | `web` ← the app is not at the repo root |
| Framework Preset | Next.js (auto-detected) |
| Build Command | leave default — `package.json` already says `next build` |
| Output Directory | leave default — the build writes `.next` |
| Install Command | default (`npm install`) |
| Node.js Version | 22.x |

If the root directory is left as the repository root, the build fails on the
first line: there is no `package.json` there.

## 2. Environment variables

Add these **before** the first deploy. `NEXT_PUBLIC_*` values are baked into the
JavaScript at build time, so changing one later only takes effect after a
redeploy.

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the project's `anon` / public key |
| `NEXT_PUBLIC_SITE_URL` | `https://<your-domain>` — or the `*.vercel.app` URL until the domain is live |

**Never** add a `service_role` key. Nothing in this app needs one, and a leaked
service-role key ignores Row Level Security entirely.

`NEXT_PUBLIC_SITE_URL` is not cosmetic: it switches the CSP's `frame-ancestors`
from "the preview platform is allowed to embed us" to `'none'`, and turns on
HSTS. Set it as soon as the deployment has a stable URL.

## 3. Tell Supabase about the domain

Supabase → **Authentication → URL Configuration**:

- **Site URL:** `https://<your-domain>`
- **Redirect URLs:** add `https://<your-domain>/auth/callback`
  and `https://*-<team>.vercel.app/auth/callback` if you want previews to work.

A missing entry here is the usual reason a confirmation link lands on a blank
page or comes back to `localhost`.

## 4. First deploy

Push to `main` (or click **Deploy**). Watch the build log for:

- `Route (app)` listing all ten routes,
- `/` marked `○ (Static)`.

Then check, in order:

1. `https://<domain>/` loads and is styled. If it is unstyled, the build served a
   stale asset — redeploy with **Clear build cache**.
2. Response headers include `Content-Security-Policy`. (Browser devtools → Network
   → the HTML request → Response Headers.)
3. `/signup` shows the form. If it says *"the database isn't connected"*, the two
   `NEXT_PUBLIC_SUPABASE_*` values did not reach the build.
4. Create a test account, confirm the mail, land on `/account` with three IDs.

## 5. Before real users

- **Preview deployments are public URLs.** Turn on Vercel → Settings →
   Deployment Protection, so previews require a login.
- **Hobby is for non-commercial use.** The moment this takes money (Q-024), it
  needs Pro ($20/month) or another host — see `docs/ARCHITECTURE.md`.
- **No database backups on the Supabase free tier.** Schedule a `pg_dump`
  somewhere else before the first real account exists.
- **Connect the domain before telling anyone.** Links in the confirmation email
  are built from the request origin; a `*.vercel.app` origin in a mail that says
  `giftofwords.app` looks like phishing.

## 6. Rolling back

Every deployment is immutable. Vercel → Deployments → pick the last good one →
**Promote to Production**. Rolling back the database is a different story: that
is a `pg_dump` restore, which is exactly why §5 says to take one.
