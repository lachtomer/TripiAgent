# aiParser — Itinerary → Bank Places (Tasks 4.3 / 4.8)

## Purpose
Parse raw itinerary text into bank place entries using Gemini when configured, with a deterministic local fallback for dev/CI/E2E.

## Module
- **Path:** `lib/aiParser.ts` (server-only; invoked via API route)
- **API:** `POST /api/bank/parse` — body `{ text: string, createdBy?: string }` → `{ places: ParsedPlace[] }`

## Behavior
1. Empty/whitespace input → `[]`
2. No `GEMINI_API_KEY` → `parseItineraryLocally()` (semicolon split, `{ name }` entries)
3. With API key → Gemini JSON schema response, Zod-validated `ParsedPlace[]`
4. Gemini/parse failure → fallback to local semicolon split

## ParsedPlace shape
```ts
{ name: string; category?: cultural|food|nature|shopping|nightlife; description?: string; lat?: number; lng?: number; createdBy?: string }
```

## Admin UI
`app/admin/bank/page.tsx` calls `/api/bank/parse` on Generate; preview shows name (+ category badge when present); Submit sends full objects to `/api/bank/places`.

## Tests
- **Unit:** `lib/aiParser.test.ts` — mock Gemini, local fallback, validation
- **E2E:** mock `/api/bank/parse` in `itinerary_import.smoke.spec.ts` for deterministic rows

## Security
`GEMINI_API_KEY` never imported in client components; parse route is server-only.
