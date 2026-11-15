# The red "Dangerous" warning: what it is and how it is cleared

## What is actually happening

Chrome's address bar shows **Dangerous** and, on submit, a modal that says *"You just
entered your password on a deceptive site."* That is **Google Safe Browsing**, not:

- a certificate problem (TLS is fine — the padlock is irrelevant here),
- a Supabase problem (no key is exposed; this is about the domain),
- something a redeploy clears. Reputation follows the **domain**, not the deployment.

Safe Browsing keeps a reputation per host. When a host is reported or matched against
its phishing/social-engineering classifiers, every visitor sees an interstitial until
Google re-evaluates it.

The likely cause here is structural: the app is served from a **shared
`*.vercel.app` subdomain** (`debate-cyan-one.vercel.app`). Those subdomains are used
for thousands of throwaway deployments every day; when enough of them are abused,
the reputation of the neighbourhood leaks onto innocent tenants. It is also exactly
the pattern phishing classifiers look for: a page that presents a brand ("Gift of
Words") and collects an email + password at a hostname that has nothing to do with
that brand.

## Fix it, in this order

### 1. Confirm the reason (2 minutes)

Open the Transparency Report for the exact URL:

```
https://transparencyreport.google.com/safe-browsing/search?url=https%3A%2F%2Fdebate-cyan-one.vercel.app
```

It answers one of three things: **no unsafe content found** (the flag may be a
credential-warning heuristic or stale), **deceptive pages**, or **harmful programs**.
Do not guess past this step — the review request only works if it names the right
category.

### 2. Verify ownership in Search Console (10 minutes)

Safe Browsing reviews are requested through Search Console, which requires proof you
control the site.

- Add a **URL-prefix** property: `https://debate-cyan-one.vercel.app/`
- Choose **HTML tag**, copy the token
- In Vercel → Project → Settings → Environment Variables, add
  `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<token>` for Production, then redeploy.

The app already reads that variable (`app/layout.tsx`) and renders the verification
`<meta>` tag on every page. No code change is needed.

### 3. Request the review

Search Console → **Security issues** → *Request a review*, and paste something like:

> This is a legitimate educational practice application. Sign-in is handled by
> Supabase Auth over HTTPS; no payment details, no credential interception, no
> redirects to third-party login pages. The domain is a Vercel deployment of our own
> repository. We believe the flag originates from the shared `vercel.app`
> neighbourhood rather than from content on this site. We are moving production to a
> domain we own.

Reviews usually take **1–3 days**. Nothing in the codebase speeds that up.

### 4. The durable fix: stop serving the product from `vercel.app`

Reputation is per domain, and a domain you own starts clean.

- Point a hostname you control at the project — e.g. `debate.forgedigital.online`
  or `app.giftofwords.app` — in Vercel → Settings → Domains.
- Set `NEXT_PUBLIC_SITE_URL=https://<that host>` in Production so canonical and OG
  URLs match the thing people actually visit (they currently fall back to
  `giftofwords.app`, which we do not serve from yet).
- Keep the `vercel.app` URL only for machines, never for humans.

### 5. Protect preview deployments

Every `*-git-branch.vercel.app` URL serves the same login form on a random hostname.
That is a phishing pattern in aggregate and a real credential risk for anyone who
lands on one by accident.

- Vercel → Settings → **Deployment Protection** → protect *Preview* deployments with
  Vercel Authentication.
- Keep `NEXT_PUBLIC_SITE_URL` unset for previews, so preview metadata never claims to
  be the production site.

## Meanwhile

- Tell people the warning is a false positive **and** give them the custom domain as
  soon as it exists. Asking users to click "proceed anyway" on a password page is how
  a product teaches people to ignore warnings.
- If the account whose password was typed into the flagged page is reused anywhere,
  change it, and turn on 2FA on the Supabase account and the GitHub account. The
  warning does not mean the password was stolen — nothing here suggests interception —
  but rotating a password on a host under suspicion is cheap.
- Do not file an appeal without verifying ownership first; unverified requests are
  closed without action.

## Checklist so this does not recur

- [ ] One product, one domain, owned by us.
- [ ] No password field is ever served from a shared hosting hostname.
- [ ] Preview deployments behind authentication.
- [ ] `NEXT_PUBLIC_SITE_URL` set in Production to the real domain.
- [ ] Search Console verified for every domain we ship on, so a review can be filed
      the day it is needed rather than the day it is discovered.
