#!/usr/bin/env bash
# One-time setup for the screenshot rig.
# Chromium cannot be downloaded from Google's CDN in this sandbox; @sparticuz/chromium
# ships a headless build inside its tarball, so we unpack that and point LD_LIBRARY_PATH at it.
set -euo pipefail
cd "$(dirname "$0")"
npm i --no-audit --no-fund puppeteer-core @sparticuz/chromium >/dev/null
mkdir -p .cache
node -e "const fs=require('fs'),z=require('zlib');fs.writeFileSync('.cache/al2023.tar', z.brotliDecompressSync(fs.readFileSync('node_modules/@sparticuz/chromium/bin/al2023.tar.br')));"
mkdir -p al2023 && tar -xf .cache/al2023.tar -C al2023
echo "ready — shoot with: LD_LIBRARY_PATH=$PWD/al2023/lib node shot.mjs <url> <out.png>"
