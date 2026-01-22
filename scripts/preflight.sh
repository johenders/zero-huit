#!/usr/bin/env bash
set -euo pipefail

printf "\n[Preflight] Lint...\n"
npm run lint

printf "\n[Preflight] Build...\n"
npm run build

cat <<'CHECKLIST'

[Preflight] Checks to do on the Vercel DEV URL
- Lighthouse (Mobile) → Performance, SEO, Best Practices
- Core Web Vitals: LCP / CLS / INP
- Forms + key links (contact, portfolio, about)
- OG/Twitter preview (use a share debugger)

CHECKLIST
