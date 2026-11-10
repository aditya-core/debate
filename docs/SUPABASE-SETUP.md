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

All four files are idempotent (`if not exists`, `create or replace`, `drop
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

## 5. Email — this is now on the critical path

Verification is **compulsory**: sign-up sends a confirmation mail, the link
returns to `/auth/callback`, and only a confirmed session reaches the setup
wizard. That means the mail sender decides whether anyone can register at all.

The built-in sender cannot do this. It allows **2 messages per hour, and only to
members of your Supabase organisation** — fine for testing your own address,
useless for real users (tracked as Q-016). If you sign up with any other address
you will see, in the server log:

```
[signup] supabase signUp failed: email_send_failed Error sending confirmation email
```

and on screen a message saying our sender isn't configured. That is the correct
behaviour: we did not create a half-registered account.

### Free sender options

| Provider | Free allowance | Needs a domain? |
|---|---|---|
| **Brevo** | 300 emails/day | No — verify a single sender address |
| **Gmail SMTP** | ~500/day | No — needs 2-Step Verification + an App Password |
| **Resend** | 100/day | Yes, to send to anyone but yourself |

### Configure it

Authentication → **Emails → SMTP Settings → Enable custom SMTP**:

- **Brevo:** host `smtp-relay.brevo.com`, port `587`, username is your Brevo
  login, password is the SMTP key from Brevo → SMTP & API.
- **Gmail:** host `smtp.gmail.com`, port `587`, username is the full address,
  password is the 16-character App Password (spaces removed).

Then set **Sender email** to the address you verified, leave **Confirm email**
**ON**, and send one real sign-up to yourself.

### While testing without a sender

Authentication → Sign In / Providers → Email → **Confirm email** off. Sign-up
then returns a session immediately and lands on `/onboarding` — the wizard still
runs, so you can test everything except the mail hop. Turn it back on before
anyone else gets the link; with it off, "verified email" is a claim we cannot
make.

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
4. Submit valid adult details → confirmation email → link →
   **`/onboarding`**, not `/account`.
5. The wizard will not let you past step 1 without a goal, and has no link back
   to the site — only sign-out. That is deliberate.
6. Finish setup → `/account` with a "Setup complete" banner, the summary of what
   you chose, and three IDs: `GOW-USER-…`, `GOW-DEB-…`, `GOW-EXT-…`, each world
   at rating 1000 / XP 0.
7. Reload `/onboarding` now → redirected to `/account`. Setup is one-way until
   you choose *Edit answers*.
8. Sign out → `/signin` → sign back in → lands on `/account`, not the wizard.
9. In the SQL editor, `select * from public.accounts;` returns exactly one row
   per sign-up — no duplicates, no orphans. And:
   `select public.learner_brief(id) from public.accounts order by created_at desc limit 1;`
   returns the paragraph the AI will be given.
