# Step 019 — Hikes: Tibetan Bridge & Paganella traverse

**Status:** Implement  
**Sources:**
- [Tibetan Bridge Crero / Torri del Benaco](https://www.gardaclick.com/en/to-do/tibetan-bridge-crero)
- [Traversata Paganella Canfedin Monte Gazza](https://www.lagoparkmolveno.it/traversata-paganella-canfedin-monte-gazza.html)

## Goal

Add two hike options to Target Bank and day guides — **additive only**.

## Scope

1. **Torri del Benaco — Tibetan Bridge (Crero/Pai)** — easy–moderate ~1.5–2 hr loop, east shore (~50 min from Desenzano)
2. **Paganella — Canfedin / Monte Gazza traverse** — medium ~5–5.5 hr ridge from Andalo cable car (Molveno area; full day, ~2 hr drive from base)

3. `lib/lakeGardaTargetBank.ts` + `data/bank.json`
4. `lib/tripDayGuides.ts` — optional hike blocks on Day 4 (Tibetan) and Day 4 optional ambitious (Paganella)
5. `lib/lakeGardaDayBackups.ts` — Plan B links
6. Tests

## Acceptance

- No removals from itinerary or bank
- Hikes discoverable in Target Bank and Day 4 day guide
- Unit tests green
