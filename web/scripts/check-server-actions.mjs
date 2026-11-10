#!/usr/bin/env node
/**
 * Guards the rule that broke sign-up (M-025).
 *
 * A file starting with "use server" may export ONLY async functions. Exporting
 * a plain object from one compiles fine, builds fine, and then throws at runtime
 * the moment a form submits:
 *
 *   A "use server" file can only export async functions, found object.
 *
 * Types are erased, so `export type` / `export interface` are legal. Values are
 * not. Initial state belongs in a sibling module (lib/auth/state.ts).
 *
 *   node scripts/check-server-actions.mjs
 *
 * Exits non-zero and names the file and the export.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["app", "components", "lib"];
const problems = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full);
    else if (/\.(ts|tsx|mts)$/.test(entry)) check(full);
  }
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}

function check(file) {
  const raw = readFileSync(file, "utf8");
  const src = stripComments(raw);

  // Only the file's own directive counts — a nested function cannot set it.
  if (!/^\s*["']use server["']\s*;?/.test(src)) return;

  const offenders = [];

  for (const m of src.matchAll(/export\s+(const|let|var)\s+([A-Za-z_$][\w$]*)/g)) {
    offenders.push(`${m[1]} ${m[2]}`);
  }
  for (const m of src.matchAll(/export\s+(function|class)\s+([A-Za-z_$][\w$]*)/g)) {
    const before = src.slice(Math.max(0, m.index - 10), m.index);
    if (!/\basync\s+$/.test(before)) offenders.push(`${m[1]} ${m[2]}`);
  }
  if (/export\s+default\s+(?!async\s+function)/.test(src)) {
    offenders.push("default export");
  }

  if (offenders.length) problems.push({ file, offenders });
}

for (const root of ROOTS) {
  try {
    walk(root);
  } catch {
    // A missing root is not a failure — the repo layout may change.
  }
}

if (problems.length) {
  console.error("\n✗ \"use server\" files may only export async functions:\n");
  for (const { file, offenders } of problems) {
    console.error(`  ${file}`);
    for (const o of offenders) console.error(`    → export ${o}`);
  }
  console.error(
    "\nMove the value into a sibling module (see lib/auth/state.ts) and import it from both sides.\n",
  );
  process.exit(1);
}

console.log("✓ every \"use server\" module exports only async functions");
