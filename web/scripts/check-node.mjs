#!/usr/bin/env node
/**
 * Fails fast, with an instruction, when the runtime is too old.
 *
 * Tailwind 4's @tailwindcss/node (CommonJS) requires magic-string, which is
 * ESM-only. `require(ESM)` exists from Node 22.12 (and 20.19). Older runtimes
 * throw ERR_REQUIRE_ESM, which surfaces as an unrelated-looking CSS error three
 * layers down. This check turns that into one sentence.
 */

const MIN = { major: 22, minor: 12, label: "22.12" };
const BACKPORT = { major: 20, minor: 19, label: "20.19" };

const [major, minor] = process.versions.node.split(".").map(Number);

const modern = major > MIN.major || (major === MIN.major && minor >= MIN.minor);
const backported =
  major === BACKPORT.major && minor >= BACKPORT.minor;

if (modern || backported) process.exit(0);

const line = "─".repeat(64);
console.error(`
${line}
  Node ${process.versions.node} is too old for this project.

  Needs ${MIN.label} or newer (${BACKPORT.label}+ also works).
  Older versions cannot load Tailwind 4's ESM-only dependencies, and the
  error appears as a CSS build failure that has nothing to do with CSS.

  Upgrade, then delete node_modules and install again:

    Windows (PowerShell, no admin needed with winget):
        winget install OpenJS.NodeJS.LTS
        # close this terminal and open a new one, then:
        cd web
        Remove-Item -Recurse -Force node_modules
        npm ci
        npm run dev

    macOS / Linux:
        nvm install 22 && nvm use 22
        rm -rf node_modules && npm ci && npm run dev

  Check it took:  node -v      (expect v22.12.0 or later)
${line}
`);
process.exit(1);
