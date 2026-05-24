<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# TripiAgent — Agent instructions (all tools)

## Project contract (paste at start of every Antigravity / Cursor task)

```
PROJECT: TripiAgent — mobile AI travel PWA for Italy.
PATH: C:\tripiagent (same as C:\TripiAgent on Windows)

STACK: Next.js App Router, TS, Tailwind, shadcn (Slate), Zustand+persist, @ducanh2912/next-pwa
DEPLOY: Vercel.
LOCAL DEV PORT: 9001 only — http://localhost:9001
API keys server-only. No DB v1. Routes: /, /chat, /itinerary, /pack + /api/*
Accent #006400. Mobile 390px. Dark mode (next-themes).

WORK: One step only. List files changed. Wait for my "confirmed" before next step.
```

## Human workflow (non-negotiable)
- **One step at a time.** Finish a single step or sub-step (e.g. 4a only), list files changed, then **STOP** and wait for: `Step X confirmed` or feedback.
- **Correctness over speed.** Read existing code before editing; no guessed APIs.
- **Handoff to Cursor:** After each Antigravity chunk, leave a short `HANDOFF.md` update (see skill `handoff-to-cursor.md`).

## Stack (do not drift)
- Next.js App Router, TypeScript, Tailwind, shadcn (Slate), Zustand + persist
- PWA: `@ducanh2912/next-pwa` or Serwist — production only
- **Deploy: Vercel** (not Firebase App Hosting, not Vercel SPA rewrite to `/`)
- **Local Dev Port**: 9001 only — http://localhost:9001
- Routes: `/`, `/chat`, `/itinerary`, `/pack`
- API: `/api/ai`, `/api/places`, `/api/weather`, `/api/geocode` — keys **server-only**
- No DB v1; localStorage + Zustand
- Mobile 390px, bottom nav, accent `#006400`, dark mode (`next-themes`)
- Region default: Italy travel guide; `TRIP_REGION` env for later

## GitHub (not GitLab)
- Remote: GitHub.com — **never** assume `gitlab.com`
- Branch: `main` protected; feature branches `feat/`, `fix/`
- PR required; CI must pass before merge
- Conventional commits: `feat:`, `fix:`, `test:`, `chore:`

## Testing (required)
- **Unit/component:** Vitest + Testing Library — colocate `*.test.ts(x)` or `__tests__/`
- **E2E:** Playwright — `e2e/` — smoke: 4 tabs, nav, chat input visible
- Run before handoff: `npm run lint && npm run test && npm run build`
- New feature without tests = incomplete unless user explicitly waives

## Security
- Never commit `.env.local`; never expose API keys in client bundles
- Zod-validate all API inputs; rate limit on `/api/ai` (document serverless limitation)

## Design
- Follow Stitch `DESIGN.md` if present: primary `#006400`, 48px tap targets, safe-area bottom nav
