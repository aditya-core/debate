#!/usr/bin/env node
/**
 * Diagnoses the sign-up configuration, in the order it actually fails.
 *
 *   npm run doctor
 *
 * Reads web/.env.local (and the process environment), then asks Supabase what
 * it currently does with new sign-ups via the public settings endpoint. The
 * field that matters is `mailer_autoconfirm`:
 *
 *   true   Supabase hands back a session at sign-up. Our six-digit code can run.
 *   false  Supabase refuses the session until its own link is clicked. Our code
 *          never starts, and the learner is sent to the old check-email page.
 *
 * This is a read-only check with the public anon key. It changes nothing.
 */

import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const envPath = join(here, "..", ".env.local");

function loadEnvLocal() {
  if (!existsSync(envPath)) return {};
  const out = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const fileEnv = loadEnvLocal();
const env = (key) => process.env[key] ?? fileEnv[key] ?? "";

const url = env("NEXT_PUBLIC_SUPABASE_URL");
const anon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const mode = env("NEXT_PUBLIC_EMAIL_VERIFICATION_MODE") === "otp" ? "otp" : "off";
const brevoKey = env("BREVO_API_KEY");
const from = env("EMAIL_FROM");

const line = (label, value, ok) =>
  console.log(`  ${ok === undefined ? "·" : ok ? "✓" : "✗"} ${label.padEnd(26)} ${value}`);

console.log("\nGift of Words — sign-up configuration\n");

/* ---------------------------------------------------------------- 1. env */
console.log("Environment  (web/.env.local + shell)");
line(
  "Supabase URL",
  url || "(missing)",
  Boolean(url.startsWith("https://") || url.startsWith("http://")),
);
line("Anon key", anon ? `${anon.slice(0, 12)}… (${anon.length} chars)` : "(missing)", anon.length > 20);
line("Verification mode", mode, undefined);
const keyShape = !brevoKey
  ? { ok: undefined, note: "(missing — dev prints the code)" }
  : brevoKey.startsWith("xkeysib-")
    ? { ok: true, note: `${brevoKey.slice(0, 12)}… (v3 API key)` }
    : brevoKey.startsWith("xsmtpsib-")
      ? { ok: false, note: `${brevoKey.slice(0, 12)}… ✗ this is an SMTP password, not an API key` }
      : { ok: false, note: `${brevoKey.slice(0, 12)}… ✗ unrecognised — should start xkeysib-` };

line("Brevo API key", keyShape.note, keyShape.ok);
line("EMAIL_FROM", from || "(missing)", undefined);

/* ------------------------------------------------------- 2. what Supabase does */
if (!url || !anon) {
  console.log("\nCannot ask Supabase anything until the URL and anon key are set.\n");
  process.exit(1);
}

let settings;
try {
  const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
    headers: { apikey: anon, authorization: `Bearer ${anon}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  settings = await res.json();
} catch (error) {
  console.log(`\nCould not reach ${url}/auth/v1/settings — ${error.message}`);
  console.log("Check the URL, the anon key, and that the project is not paused.\n");
  process.exit(1);
}

console.log("\nSupabase auth settings");
const autoconfirm = settings.mailer_autoconfirm === true;
line(
  "mailer_autoconfirm",
  String(settings.mailer_autoconfirm),
  autoconfirm,
);
line(
  "email provider",
  settings.external?.email === false ? "disabled" : "enabled",
  settings.external?.email !== false,
);

/* ------------------------------------------------------------- 3. the verdict */
console.log("\nVerdict");

let problems = 0;

if (mode === "otp" && !autoconfirm) {
  problems++;
  console.log(
    [
      "",
      "  ✗ Sign-up cannot work in this state.",
      "",
      "    Supabase is still requiring its own confirmation link, so signUp()",
      "    returns no session — the six-digit flow never starts, and the learner",
      "    is sent to /signup/check-email instead.",
      "",
      "    Fix: Supabase → Authentication → Sign In / Providers → Email →",
      "         turn Confirm email OFF, then Save, then restart the dev server.",
      "",
    ].join("\n"),
  );
}

if (brevoKey && !brevoKey.startsWith("xkeysib-")) {
  problems++;
  console.log(
    [
      "",
      "  ✗ BREVO_API_KEY is not an API key.",
      "",
      "    Brevo has two secrets on two different pages, and they are easy to",
      "    mix up:",
      "",
      "      xkeysib-…    API v3 key      → Settings → SMTP & API → API Keys",
      "      xsmtpsib-…   SMTP password   → SMTP & API → SMTP tab",
      "",
      "    We send over the HTTP API, so it must be the xkeysib- one. An SMTP",
      "    password here produces a 401 and no mail.",
      "",
    ].join("\n"),
  );
}

if (mode === "off" && brevoKey) {
  console.log(
    [
      "",
      "  · Mode is 'off', so the key is unused — sign-up makes no mail at all.",
      "    Set NEXT_PUBLIC_EMAIL_VERIFICATION_MODE=otp (then restart the dev",
      "    server) when you want the six-digit step.",
      "",
    ].join("\n"),
  );
}

if (mode === "otp" && (!brevoKey || !from)) {
  problems++;
  console.log(
    [
      "",
      "  ! No sender configured. The flow will run, but the code goes to the",
      "    server console instead of an inbox. Look for:",
      "      [email] (dev, no sender configured) code for …",
      "",
    ].join("\n"),
  );
}

if (mode === "off") {
  console.log(
    [
      "",
      "  · Verification is off. Sign-up goes straight to /onboarding and no mail",
      "    is sent. Set NEXT_PUBLIC_EMAIL_VERIFICATION_MODE=otp to test the code.",
      "",
    ].join("\n"),
  );
}

if (mode === "otp" && autoconfirm && brevoKey && from) {
  console.log("\n  ✓ Configuration looks right. Sign up with a fresh address.\n");
}

if (problems === 0 && mode === "otp" && (!brevoKey || !from)) {
  console.log("  Next: add BREVO_API_KEY and EMAIL_FROM to send to a real inbox.\n");
  process.exit(0);
}

process.exit(problems > 0 ? 1 : 0);
