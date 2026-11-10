# Security policy

## Reporting a vulnerability

Email **security@giftofwords.app** with what you found, where, and how to
reproduce it. Please do not open a public issue for anything that could expose
user data.

We aim to acknowledge within 48 hours and to give a first assessment within
five working days. We will tell you when a fix ships, and credit you if you
want the credit.

## Scope

In scope: anything that exposes another person's data, bypasses Row Level
Security, escalates privilege, or lets an unauthenticated party act as someone
else. The product handles minors' data, so consent and age-gate bypasses are
treated as high severity.

Out of scope: findings that require access to our Supabase project or Vercel
account, reports from automated scanners without a demonstrated impact, and
anything that only affects a deployment we do not run.

## What we already know about

`docs/SECURITY.md` is the working audit: what is fixed, what is accepted with
reasons, and what is still open. We would rather publish that than pretend the
list is empty.
