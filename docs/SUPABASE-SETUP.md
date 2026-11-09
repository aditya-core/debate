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

Dashboard → **SQL Editor** → new query → paste the whole of
`supabase/migrations/0001_identity.sql` → **Run**.

Confirm it took:

```sql
select tgname from pg_trigger where tgname = 'on_auth_user_created';
select tablename, rowsecurity from pg_tables
 where schemaname = 'public' order by tablename;
```

You want the trigger present, and `rowsecurity = true` on `accounts`,
`debate_profiles`, `extempore_profiles`, `guardian_consents`.

What the migration builds: one `accounts` row per auth user plus a
`debate_profiles` and an `extempore_profiles` row, all created by a trigger the
instant the auth user exists. Under-18 sign-ups get
`status = 'pending_guardian_consent'` and a `guardian_consents` row.

---

## 4. Auth URL configuration

Dashboard → **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` while building.
- **Redirect URLs:** add `http://localhost:3000/auth/callback`.

When the Vercel preview goes up, add its origin too, and switch Site URL to the
production domain once it exists. A missing redirect entry is the usual cause
of a confirmation link that lands on a blank page.

---

## 5. Email, while building

The built-in sender is limited to **2 messages per hour, and only to members of
your Supabase organisation** — fine for testing your own address, useless for
real users (tracked as Q-016).

Two options:

- **Fast loop:** Authentication → Sign In / Providers → Email →
  turn **Confirm email** off. Sign-up then returns a session immediately and
  you land on `/account` without opening mail. Turn it back on before anyone
  else is given the link.
- **Test the real path:** leave it on, add your own address to the
  organisation, and confirm the `/auth/callback` hop end to end.

---

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
   account lands on `/account` as *Pending approval*.
4. Submit valid adult details → confirmation email → link → `/account`.
5. `/account` shows three IDs: `GOW-USER-…`, `GOW-DEB-…`, `GOW-EXT-…`, each
   world at rating 1000 / XP 0.
6. Sign out → `/signin` → sign back in → same IDs.
7. In the SQL editor, `select * from public.accounts;` returns exactly one row
   per sign-up — no duplicates, no orphans.

If `/account` says *"Your login exists, your profile doesn't"*, step 3 was
skipped or failed: the trigger is missing, so only the auth user exists.

---

## 7. Free-tier limits that will bite

| Limit | Consequence | Mitigation |
| --- | --- | --- |
| 7-day inactivity pause | Project sleeps after a week without traffic | A scheduled ping, or accept the cold start |
| 500 MB database | Years away at our row sizes | — |
| 50k MAU | Fine | — |
| No backups | Nothing to restore from | `pg_dump` on a schedule before any real data exists |
| 2 projects | No spare environment | Use a separate Supabase org if a staging project is needed later |

---

## 8. Invariants

- RLS on for every table in `public`. No exceptions, no "temporarily off".
- Clients **read their own rows and write nothing**. Practice writes will go
  through `SECURITY DEFINER` functions with server-side validation.
- No service-role key in the app, in Vercel, or in git history.
- Display IDs (`GOW-…`) are labels, not credentials. The UUID is the key.
- Both world profiles exist from the first second of an account's life, so no
  code path ever has to invent a missing one.
