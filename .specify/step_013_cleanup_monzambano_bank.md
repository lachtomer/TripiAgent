# Step 013 (cleanup) — Remove Monzambano bank leftovers

**Status:** Implement  
**Depends on:** Step 013 Villa Bella Desenzano base

## Goal

Clear last Monzambano references from shipped Target Bank data after Desenzano base switch.

## Scope

1. `lib/lakeGardaTargetBank.ts` — `bank-dining-ponte`: Borghetto location + Mincio backup copy (not Monzambano welcome dinner)
2. `data/bank.json` — same description sync
3. `lib/lakeGardaTargetBank.test.ts` — assert no `Monzambano` / `Villa Eunice` in bank seed JSON

## Acceptance

- No `Monzambano` or `Villa Eunice` in `lib/` or `data/` except test fixtures explicitly allowed
- Welcome dinner remains **Ristorante Pace**, Desenzano
- Unit test green
