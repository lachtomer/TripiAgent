# E2E Test Plan — Target Environment (Production)

**Target URL:** https://tripiagent.vercel.app  
**Local parity:** http://localhost:9001  
**Feature:** specs/003-lake-garda-itinerary-refresh

## Preconditions

- Clear `localStorage` key `tripiagent-trip-storage` before first prod smoke (or use incognito).
- Playwright config uses port 9001 locally; prod tests are manual or separate `BASE_URL` job.

## Smoke Matrix (post-deploy)

| # | Flow | Steps | Expected |
|---|------|-------|----------|
| 1 | Itinerary load | Open `/itinerary` | Days show **Jun 30 – Gardaland**, **Jul 1 – Monte Baldo**, **Jul 3 – Shopping** |
| 2 | Activity detail | Expand **Gardaland Theme Park** | Description mentions SEA LIFE; time 10:00 |
| 3 | Target Bank | Sidebar / saved list | **26** entries incl. Serravalle, Taverna del Silenzio |
| 4 | Day picker | Day 6 → Add from Target Bank | Gardaland row visible; add to day works |
| 5 | Activity nearby | Expand Jun 28 Natura Viva → Explore nearby | Panel opens; mocked/live places load |
| 6 | Essentials | Home or checklist card | Items e7–e9 (Gardaland, Taverna, boat) visible |
| 7 | Admin bank API | `GET /api/bank/places` | 26 places, no duplicate Sirmione/Verona junk |
| 8 | PWA / mobile | 390px viewport `/itinerary` | Day cards scroll; no layout break |

## Automated E2E (CI / local)

```bash
npm run lint
npm test
npx playwright test e2e/step4h.smoke.spec.ts e2e/step18.target-bank-day-picker.smoke.spec.ts
npm run build
```

### Recommended new spec (backlog)

`e2e/step19.itinerary-garda-refresh.smoke.spec.ts`:

- Seed empty itinerary via store reset init script.
- Assert `text=Jun 30 – Gardaland` visible.
- Assert `text=Monte Baldo Nature Day` visible.
- Assert target bank contains `Serravalle Designer Outlet`.

## Regression watchlist

- `e2e/step4h.smoke.spec.ts` — still expects `Jun 28 – Verona` (title unchanged).
- Persisted users with old itinerary in localStorage will **not** auto-migrate — document in release notes.

## Sign-off criteria

- All automated commands green.
- Prod smoke rows 1–3 pass on tripiagent.vercel.app within 15 min of deploy.
- No console errors on `/itinerary` first load.
