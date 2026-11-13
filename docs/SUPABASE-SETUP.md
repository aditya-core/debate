# Supabase setup

Registration is written and committed, but it is **inert until a project is
connected**. Without credentials the sign-up form returns an explicit
"not configured" message rather than pretending to work.

Everything below is free tier. Budget half an hour the first time.

---

## 1. Create the project

1. <https://supabase.com/dashboard> → **New project**.
2. **Region: `ap-south-1` (Mumbai).** Closest to Indian users; the free-tier
   latency difference against Singapore is noticeable on a ₹15k phone.
3. Save the database password somewhere safe — it is not needed by this app,
   but it cannot be shown again.

Free tier gives two projects. One is the app; keep the second free for
experiments.

---

## 2. Copy the two public values

Project → **Settings → Data API** / **Settings → API Keys**:

| Dashboard value | Goes into `web/.env.local` |
| --- | --- |
| Project URL (`https://xxxx.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

```bash
cd web
cp .env.example .env.local   # then paste both values
```

Both values are public by design — they ship in the browser bundle. They are
safe *only because* Row Level Security is on. The `service_role` key must never
appear in this repository or in Vercel.

---

## 3. Create the schema

Dashboard → **SQL Editor** → **New query**. Run the three files **in order**, one
run each — not pasted together, so a failure tells you which file it came from.

**3a. `supabase/migrations/0001_identity.sql`** — paste the whole file → **Run**.

Builds: `accounts`, `debate_profiles`, `extempore_profiles`, `guardian_consents`,
the display-ID helper, and the `on_auth_user_created` trigger that provisions all
three identity rows the instant an auth user exists.

**3b. `supabase/migrations/0002_security.sql`** — paste the whole file → **Run**.

Hardens what 0001 created: consent tokens become 32 random bytes hashed with
SHA-256 instead of `md5(uuid)`; the consent row stops being client-readable;
`EXECUTE` is revoked on the internal functions; `delete_my_account()` is added
for DPDP erasure.

**3c. `supabase/migrations/0003_worlds.sql`** — paste the whole file → **Run**.

Guarantees every account owns exactly one debate identity and one extempore
identity — it repairs any account that is missing one, backfills existing rows,
and rewrites the sign-up trigger to create the pair through a single function.
Then it creates the places their data will live: `debate_sessions`,
`extempore_sessions`, and `analytics_events`, each scoped to the account and,
where it applies, to the world identity that produced it.

The *contents* of a round — prompt, rubric, scores — are deliberately not
defined yet. `payload jsonb` captures whatever the arena writes until the rubric
is fixed, at which point those become real columns.

**3d. `supabase/migrations/0004_onboarding.sql`** — paste the whole file → **Run**.

Creates `learner_profiles`: one row per account holding what the learner is
preparing for, their experience, self-rated confidence, topics, daily budget and
optional deadline. Typed columns for queries, plus `answers jsonb` keeping the
raw submission, plus `learner_brief(account_id)` — one stable text block the AI
tutor will be given instead of re-deriving the shape from five columns.

Writes go through `complete_onboarding(jsonb)` only; there is no insert/update
policy, so `completed_at` cannot be forged by a client that skipped the wizard.

**3e. `supabase/migrations/0005_email_verification.sql`** — paste the whole file → **Run**.

Adds `accounts.email_verified_at` and the `email_otps` table. A six-digit code
lives for ten minutes, is stored **only as a bcrypt hash**, allows five attempts,
and is deleted the moment it is used or replaced — one live code per account,
enforced by a partial unique index. Clients have no access to the table at all;
`issue_email_otp()` and `verify_email_otp()` are the only doors, and the resend
cooldown is enforced in SQL rather than in the button.

**3f. `supabase/migrations/0006_secure_pending_verification.sql`** — paste the
whole file → **Run**. This lets the signed-in verification flow read its own
pending-verification details through a narrowly scoped security-definer
function; direct access to `email_otps` remains revoked.

All six files are idempotent (`if not exists`, `create or replace`, `drop
policy if exists`), so re-running any of them is safe. If a statement errors,
read the first line of the message — it names the object.

### Confirm it took

```sql
-- the trigger that provisions every new account
select tgname from pg_trigger where tgname = 'on_auth_user_created';

-- RLS must be on for all four tables, and there must be no policy at all on
-- guardian_consents (it is deliberately unreachable from the client)
select tablename, rowsecurity,
       (select count(*) from pg_policies p
         where p.schemaname = 'public' and p.tablename = t.tablename) as policies
  from pg_tables t
 where schemaname = 'public'
   and tablename in ('accounts','debate_profiles','extempore_profiles','guardian_consents')
 order by tablename;

-- function permissions: no `=X/` (PUBLIC) on the first three
select proname, proacl
  from pg_proc
 where pronamespace = 'public'::regnamespace
   and proname in ('gow_display_id','touch_updated_at','handle_new_user','delete_my_account');
```

Expected: one trigger row; `rowsecurity = true` on all four; `guardian_consents`
with `policies = 0`; `delete_my_account` executable by `authenticated` only.

Then, after 3c, check that nobody is missing a world identity:

```sql
select count(*) filter (where d.account_id is null) as missing_debate,
       count(*) filter (where e.account_id is null) as missing_extempore
  from public.accounts a
  left join public.debate_profiles d    on d.account_id = a.id
  left join public.extempore_profiles e on e.account_id = a.id;
```

Both columns must be `0`. After a test sign-up they still must be `0`.

### The identity it builds

One `accounts` row per auth user (`GOW-USER-…`) plus a `debate_profiles`
(`GOW-DEB-…`) and an `extempore_profiles` (`GOW-EXT-…`) row, all created in the
same transaction by the trigger. Both worlds start at rating 1000, XP 0. An
under-18 sign-up gets `status = 'pending_guardian_consent'` and a
`guardian_consents` row.

## 4. Auth URL configuration

Dashboard → **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` while building.
- **Redirect URLs:** add `http://localhost:3000/auth/callback`

Sign-up and password reset both redirect to `/auth/callback` with a `next=`
parameter (`?next=/onboarding`, `?next=/account/update-password`). Only the
callback itself needs allowlisting — Supabase matches the path, and our route
decides where to go next. Do not add a wildcard like `http://localhost:3000/**`
to save typing: it would also allow an attacker-crafted link to bounce a
confirmed session anywhere on the site.

When the Vercel preview goes up, add its origin too, and switch Site URL to the
production domain once it exists. A missing redirect entry is the usual cause
of a confirmation link that lands on a blank page.

---

## 5. Email verification — six digits, not a link

The learner types a code instead of clicking a link. That choice removes the
three things that usually break a magic link: an allowlist of redirect URLs, a
deep link that Gmail's in-app browser mangles, and a link that expires before it
is opened on a second device.

**What it does not remove: something still has to deliver the digits.** A code is
useless if it does not arrive, so a sender is required — but *not* a domain.
Brevo lets you verify a single sender address and send from it, 300 a day, free.

### How the flow runs

```
/signup  →  code generated in Postgres, mailed  →  /verify  →  /onboarding
```

- Ten minutes to live, five attempts, 120-second resend cooldown.
- One live code per account: a resend destroys the previous digits.
- Wrong, expired or locked codes each get their own sentence on screen — they are
  not collapsed into "invalid".

### Switching it on

1. **Environment** (`web/.env.local`, and Vercel for production):

   ```bash
   NEXT_PUBLIC_EMAIL_VERIFICATION_MODE=otp
   BREVO_API_KEY=xkeysib-...
   EMAIL_FROM=you@gmail.com        # the address you verified in Brevo
   EMAIL_FROM_NAME=Gift of Words
   ```

2. **Supabase** → Authentication → Sign In / Providers → Email →
   **Confirm email OFF**. We send the code ourselves; Supabase's own
   confirmation must be off or the learner gets two verifications and the wrong
   mail.

3. Restart the dev server — `NEXT_PUBLIC_*` is baked in at build time.

### Getting a Brevo key (5 minutes, free, no domain)

1. Sign up at brevo.com → **SMTP & API → API Keys tab → Generate a new API key**
   — you want an **`xkeysib-…`** key.

   Brevo keeps two secrets on adjacent tabs and they look alike:

   | Prefix | What it is | Where |
   |---|---|---|
   | `xkeysib-…` | API v3 key — **what we need** | SMTP & API → **API Keys** |
   | `xsmtpsib-…` | SMTP password | SMTP & API → **SMTP** |

   Pasting the SMTP password returns a 401 that reads like an outage.
   `npm run doctor` now names this outright.
2. **Senders & Domains → Add a sender** — your own Gmail address. Brevo emails a
   verification link; click it.
3. Put that address in `EMAIL_FROM` — it must match exactly, or Brevo rejects the
   send with a 400.

Free tier: 300 emails/day. At one code per sign-up plus resends, that is roughly
200 registrations a day.

### While no sender is configured

In development the code is printed to the **server console** and the page says so:

```
[email] (dev, no sender configured) code for you@gmail.com: 481920
```

A production build never does this — with no key it logs an error and the page
tells the learner the sender isn't configured. That is deliberate: silent failure
would look like "the email never arrived", which is the least debuggable state
there is.

### Switching it back off

`NEXT_PUBLIC_EMAIL_VERIFICATION_MODE=off` (the default). Sign-up then goes
straight to `/onboarding`. Cost of being off: an account can be created with an
address nobody has proven they own — recorded as A-08 in `docs/SECURITY.md`.

## 5b. When it doesn't work: `npm run doctor`

Two switches must agree — the mode in `.env.local` and "Confirm email" in the
Supabase dashboard. When they disagree, sign-up refuses rather than pretending a
link was sent. There is also a check:

```bash
cd web && npm run doctor
```

It reads `.env.local`, asks Supabase's public settings endpoint what it actually
does with new sign-ups (`mailer_autoconfirm`), and prints the verdict:

```
Supabase auth settings
  ✗ mailer_autoconfirm         false

Verdict
  ✗ Sign-up cannot work in this state.
    Fix: Authentication → Sign In / Providers → Email →
         turn Confirm email OFF, then Save, then restart the dev server.
```

Exit code 1 when something is wrong, 0 when it is safe to test. Read-only, anon
key only, nothing is changed.

## 6. Restart and verify

`NEXT_PUBLIC_*` values are baked in at build time, so restart the server after
editing `.env.local`.

```bash
cd web && npm run dev
```

Checklist:

1. `/signup` shows no "database isn't connected" banner.
2. Submit an empty form → field errors, nothing posted.
3. Submit with a date of birth under 18 → guardian field appears, and the
   account lands as *Pending approval*.
4. Submit valid adult details → **`/verify`** (mode `otp`) or straight to
   `/onboarding` (mode `off`).
5. On `/verify`: the code from your inbox (or the terminal, in dev) → six cells
   fill one by one → green tick → lands on `/onboarding`. A wrong code shakes the
   row and clears it; "Resend" is disabled for two minutes, then works.
6. The wizard will not let you past step 1 without a goal, and has no link back
   to the site — only sign-out. That is deliberate.
7. Finish setup → `/account` with a "Setup complete" banner, the summary of what
   you chose, and three IDs: `GOW-USER-…`, `GOW-DEB-…`, `GOW-EXT-…`, each world
   at rating 1000 / XP 0.
8. Reload `/onboarding` now → redirected to `/account`. Setup is one-way until
   you choose *Edit answers*.
9. Sign out → `/signin` → sign back in → lands on `/account`, not the wizard.
10. In the SQL editor, `select * from public.accounts;` returns exactly one row
   per sign-up — no duplicates, no orphans. And:
   `select public.learner_brief(id) from public.accounts order by created_at desc limit 1;`
   returns the paragraph the AI will be given.
