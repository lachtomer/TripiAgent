# Bank Feature Specification

**Feature name:** Attraction Bank (Bank)
**Owner:** TripiAgent Team
**Target branch:** `main`

## 1. Purpose & Scope
The Bank feature provides a shared repository of attractions (places) that can be curated by admins and used by all users to build itineraries. It includes:
- A server‑side API for creating, reading, and persisting attraction entries.
- An admin UI (`/admin/bank`) for bulk import via itinerary text, preview, edit, and submit.
- A Zustand store (`bankStore`) that persists the bank data client‑side.
- UI components (`PlaceCard`, preview table) that display entries with category badges and actionable buttons.

## 2. Functional Requirements
| ID | Requirement | Acceptance Criteria |
|----|-------------|----------------------|
| **BR‑1** | **API – POST `/api/bank/places`** | Accepts a JSON body matching `placesBatchSchema`. Returns **201** with created entries. Validates with Zod. |
| **BR‑2** | **API – GET `/api/bank/places`** | Returns the full list of stored places. Should be cached for 5 min. |
| **BR‑3** | **Admin UI – Textarea input** | A `<textarea id="itinerary-input">` allows pasting raw itinerary text. |
| **BR‑4** | **Generate button** | Clicking **Generate Bank Entries** calls `lib/aiParser.ts` via **POST `/api/bank/parse`** → Gemini → returns `Place[]` and populates a preview table (`#preview-table`). Falls back to semicolon split when Gemini is unavailable. |
| **BR‑5** | **Preview table** | Shows one row per parsed place with columns: name, category badge, optional “Add” checkbox. Table initially hidden until generation succeeds. |
| **BR‑6** | **Submit button** | Sends the preview payload to **POST `/api/bank/places`**. On success shows a success toast and clears the textarea. |
| **BR‑7** | **Admin permissions** | Only `BANK_ADMIN_NAMES` (`Liran`, `Tomer` in `lib/bankPermissions.ts`) can delete entries via UI or **DELETE `/api/bank/places`**; all users can add via the admin UI. |
| **BR‑8** | **Zustand persistence** | `bankStore` uses `persist` to `localStorage` under key `bank-store`. Data survives page reloads. |
| **BR‑9** | **Responsive design** | UI must be mobile‑first, fitting within 390 px width, with tap targets ≥ 48 px. Accent color `#006400` applied to badges and buttons. |
| **BR‑10** | **Accessibility** | All interactive elements have `aria-label`s, proper role attributes, and focus outlines. |

## 3. API Contracts
### POST `/api/bank/places`
```json
{
  "places": [
    {
      "name": "string",
      "category": "enum(placeCategoryEnum)",
      "description": "string",
      "lat": "number",
      "lng": "number",
      "createdBy": "string"
    }
  ]
}
```
- **Response 201**: `{ "success": true, "created": <number> }`
- **Response 400**: Zod validation errors.

### GET `/api/bank/places`
- **Response 200**: `{ "places": Place[] }`
- **Cache‑Control**: `max-age=300`.

## 4. Data Model (`lib/schemas.ts`)
```ts
export const placeCategoryEnum = z.enum(["cultural", "food", "nature", "shopping", "nightlife"]);
export const placeSchema = z.object({
  name: z.string(),
  category: placeCategoryEnum,
  description: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  createdBy: z.string()
});
export const placesBatchSchema = z.object({
  places: z.array(placeSchema)
});
```

## 5. UI Wireframes (high‑level description)
1. **Admin Bank Page (`app/(admin)/bank/page.tsx`)**
   - Header with title *"Attraction Bank"*.
   - `<textarea id="itinerary-input" placeholder="Paste itinerary…" />`.
   - **Generate Bank Entries** button (accent background, `#006400`).
   - Hidden `<table id="preview-table">` that becomes visible after generation.
   - Each row shows: place name, category badge (green), optional delete icon (admins only).
   - **Submit** button (disabled until preview has at least one row).
2. **PlaceCard component**
   - Shows place name, category badge, and a *Pre‑Book* button.
   - Uses Tailwind utilities for spacing, dark‑mode support, and hover animations.

## 6. State Management (`stores/bankStore.ts`)
```ts
export const useBankStore = create<BankState>()(
  persist(
    (set, get) => ({
      places: [],
      load: async () => { const res = await fetch('/api/bank/places'); const { places } = await res.json(); set({ places }); },
      add: (newPlaces) => set(state => ({ places: [...state.places, ...newPlaces] })),
      remove: (id) => set(state => ({ places: state.places.filter(p => p.id !== id) })),
    }),
    { name: 'bank-store' }
  )
);
```
- Expose selectors for `places`, `add`, `remove`, and `load`.

## 7. Acceptance Tests
- **Unit** (`tests/api/bank/places.test.ts`): validate Zod schema, 201/400 responses, persisted JSON file.
- **Unit** (`lib/aiParser.test.ts`): mock Gemini, ensure output matches `Place[]`, local fallback.
- **Component** (`components/PlaceCard.test.tsx`): renders badge with correct color, button disabled state.
- **Playwright smoke** (`e2e/bank/itinerary_import.smoke.spec.ts`): already present – verifies UI flow.
- **Accessibility** (`e2e/bank/accessibility.test.ts`): run axe‑core, ensure no violations.
- **Persistence** (`tests/store/bankStore.test.ts`): write to store, reload module, assert data remains.

## 8. Non‑Functional Requirements
- **Performance**: API responses ≤ 200 ms for ≤ 100 places.
- **Security**: Server‑only API keys; verify `process.env.GEMINI_API_KEY` is not bundled client‑side.
- **Internationalisation**: All UI strings go through the existing `useTranslation` hook; locale prop propagates to API calls.
- **PWA**: Bank page must be cached by the service worker for offline access (static assets only).
- **Observability**: Bank UI emits analytics events (`bank_*`) through `lib/analytics.ts` for generate/submit/delete flows.

## 9. Concurrency Strategy (Optimistic Locking)

To prevent silent overwrites when multiple admins edit the bank concurrently, the Bank API will use optimistic locking with a monotonic `version`.

### Versioned storage shape
```json
{
  "version": 12,
  "places": [ ... ]
}
```

### Contract updates
- `GET /api/bank/places` returns `{ version: number, places: Place[] }`.
- Mutating requests include `expectedVersion`:
  - `POST /api/bank/places` body: `{ expectedVersion: number, places: Place[] }`
  - `DELETE /api/bank/places` body: `{ expectedVersion: number, index: number, requestedBy: string }`
- Server behavior:
  - If `expectedVersion !== currentVersion`, return **409 Conflict** with `{ error: "Version conflict", currentVersion }`.
  - On success, apply mutation and increment version by 1.

### Client behavior (`bankStore`)
- Keep last seen `version` from `load()`.
- Send `expectedVersion` on `add()` / `remove()`.
- On `409`, auto-refresh with `load()` and show a user-facing message:
  - “Bank was updated by another admin. Data was refreshed; please retry.”

### Acceptance criteria
- Two parallel writes with same `expectedVersion` result in one success and one `409`.
- No successful write can overwrite newer data without first reloading.
- E2E coverage includes conflict simulation (mock stale `expectedVersion` path).

## 10. Open Questions / Risks
- **Storage size** – bank data persisted to a JSON file on the server; will it scale beyond a few hundred entries?
- **Rate limiting** – ensure `/api/bank/places` respects the global rate‑limit middleware.

---
*Prepared by Antigravity – please review and confirm.*
