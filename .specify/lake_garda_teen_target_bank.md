# Lake Garda Teen Target Bank (15–18)

**Status:** Step 1 — seed curated Target Bank for Jun 2026 Monzambano trip  
**Scope:** Group `savedAttractions` default seed + clean admin `data/bank.json` mirror

## Goal

Replace empty / junk bank entries with a curated list for teens 15–18, base Monzambano. Remove low-fit items from the prior brainstorm; add missed high-value stops.

## Remove (not in seed)

- Mantova / Palazzo Ducale — culture-heavy, weak teen appeal
- Passive guided lake boat tours
- Lake diving / snorkeling
- Grotte di Catullo (standalone)
- MAG Museo Alto Garda
- Limone sul Garda (standalone — cover via ferry day combo only)
- Generic hiking-only entries without activity hook

## Keep / seed

| Place | Why |
|-------|-----|
| Gardaland | Top teen day |
| CanevaWorld Aqua Paradise | Water park |
| Movieland Park | Movie-themed rides |
| Rimbalzello Adventure Park | Ropes / zip |
| Monte Baldo Cable Car (Malcesine) | Views + adventure hub |
| Paragliding Tandem (Monte Baldo) | Adrenaline 16+ |
| Riva del Garda — SUP & water sports | Active lake day |
| Torbole — windsurfing | Sports capital north shore |
| Verona Arena | Already on itinerary |
| Sirmione — Scaligero Castle | Short historic stop |
| Aquaria Thermal Spa | Group booking Jun 29 |
| Malcesine | Combine with Monte Baldo |
| Desenzano — self-drive boat rental | Active vs guided tour |

## Add (missed)

| Place | Why |
|-------|-----|
| Natura Viva Safari Park | Safari/zoo ~40 min, strong teen appeal |
| Vittoriale degli Italiani | Eccentric estate, warship — older teens |
| Jungle Adventure Park (Lazise) | Ropes near Gardaland |

## Files

- `lib/lakeGardaTargetBank.ts` — canonical `SavedAttraction[]`
- `stores/tripStore.ts` — initial + reset seed
- `data/bank.json` — dedupe and mirror for admin API
- `stores/tripStore.test.ts` — adjust admin-delete test for seeded bank

## Out of scope

- Itinerary day rewrites (Mantova swap) — separate step after user confirms
