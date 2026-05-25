# Feature Specification — Step 2b: Ferry Schedules & ZTL Rules

This specification defines the static data layers and validation rules required to prevent the travel agent from hallucinating timetables and congestion zone rules.

---

## 1. Requirements

### 1.1 Lake Garda Ferry Dataset & API
- **Data File:** `public/data/lake_garda_ferries_2026.json`
- **Contents:** Structured JSON containing:
  - Key routes: Desenzano ↔ Sirmione ↔ Peschiera, Riva ↔ Limone ↔ Malcesine.
  - Seasonal service window: Summer service active from June 1 to September 30.
  - Approximate departure and arrival times.
- **Server Endpoint:** `/api/ferries/route.ts`
  - A GET API route that loads the static JSON file and returns the route schedule matching query parameters (e.g. `origin`, `destination`).
  - Zod schema validation for query inputs.

### 1.2 Milan ZTL (Area C) Validator
- **Helper Utility:** `lib/ztl.ts`
  - Export a function `checkMilanZTL(timeStr: string, dateStr: string): ZtlCheckResult`
  - **Area C Rules:** Congestion charges are active Monday through Friday from 7:30 to 19:30. Inactive on weekends and public holidays.
  - Return whether entry requires a paid voucher ticket, active times, and cost (constant €7.50).
- **Unit Tests:** `lib/ztl.test.ts`
  - Unit tests using Vitest to assert correct ZTL status for active weekdays, inactive weekend times, and late-night entries.

---

## 2. Technical Blueprint

### Directory Structure & New Files
- `public/data/lake_garda_ferries_2026.json` [NEW]
- `app/api/ferries/route.ts` [NEW]
- `lib/ztl.ts` [NEW]
- `lib/ztl.test.ts` [NEW]

---

## 3. Tool Binding (For Step 2c)
The agent will be declared with two tool functions:
1. `searchFerrySchedule(origin: string, destination: string)` which calls `/api/ferries`.
2. `verifyMilanZTL(dateTimeStr: string)` which calls the `checkMilanZTL` utility.

---

## 4. Verification Plan

### Automated Tests
- Run Vitest: `npx vitest run lib/ztl.test.ts`
- Run linting: `npm run lint`

### Manual Verification
- Query `/api/ferries?origin=Sirmione&destination=Desenzano` via a browser/fetch call to ensure it returns correctly structured JSON.
