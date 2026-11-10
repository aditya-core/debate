#!/usr/bin/env node
/**
 * Style-coverage audit.
 *
 * Catches the failure mode that broke the preview on 9 Nov 2026: the page
 * renders, the markup is correct, and the stylesheet is *served* — but it is
 * not the stylesheet that matches the markup, so the page arrives unstyled.
 *
 * The check is blunt and effective: every class in the rendered HTML must
 * exist as a rule in the CSS the page actually links to.
 *
 *   node scripts/audit-styles.mjs [baseUrl]
 *
 * Exits non-zero if anything is missing. Run it against a running server.
 */

const BASE = process.argv[2] ?? "http://localhost:3000";
const ROUTES = [
  "/",
  "/develop",
  "/legal",
  "/signup",
  "/signin",
  "/signup/check-email?email=you@example.com&guardian=1",
];

// `group` / `peer` are markers used by variant selectors and never have rules.
const MARKERS = new Set(["group", "peer"]);

const SPECIAL = new Set(`:/[]().%,#!&*+~>'"=@`);

function escapeClass(token) {
  return [...token]
    .map((ch) => (SPECIAL.has(ch) ? `\\${ch}` : ch))
    .join("");
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

let failures = 0;

for (const route of ROUTES) {
  const html = await fetchText(BASE + route);
  const cssHrefs = [...html.matchAll(/href="([^"]+\.css[^"]*)"/g)].map((m) => m[1]);

  if (cssHrefs.length === 0) {
    console.error(`✗ ${route}: no stylesheet is linked at all`);
    failures++;
    continue;
  }

  const css = (await Promise.all(cssHrefs.map((h) => fetchText(BASE + h)))).join("\n");

  const classes = new Set();
  for (const m of html.matchAll(/class="([^"]*)"/g)) {
    for (const token of m[1].split(/\s+/)) {
      if (token) classes.add(token);
    }
  }

  const missing = [];
  for (const token of classes) {
    if (MARKERS.has(token) || token.startsWith("__")) continue;
    if (!css.includes("." + escapeClass(token))) missing.push(token);
  }

  if (missing.length) {
    failures++;
    console.error(`✗ ${route}: ${missing.length} of ${classes.size} classes have no CSS`);
    for (const m of missing.slice(0, 15)) console.error(`    ${m}`);
  } else {
    console.log(`✓ ${route}: ${classes.size} classes, all matched`);
  }
}

if (failures) {
  console.error(`\n${failures} route(s) failed the style audit.`);
  process.exit(1);
}

console.log("\nAll routes render with a stylesheet that matches their markup.");
