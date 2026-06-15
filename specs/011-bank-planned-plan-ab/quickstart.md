# Quickstart — 011 Target Bank Planned & Plan A/B

## Prerequisites

- Node 20+, repo at `C:\TripiAgent`
- Dev server on **http://localhost:9001**
- Active spec: `specs/011-bank-planned-plan-ab/`

---

## 1. Load default Lake Garda trip

1. Open **http://localhost:9001**
2. Ensure trip uses default itinerary (Jun 25–Jul 4) — reset from itinerary page if needed
3. Open **Locations** tab — Target Bank should list Lake Garda curated entries

---

## 2. Verify Planned badge & sort (after Step 3)

| Expect | Detail |
| --- | --- |
| **Planned** | Gardaland, Verona Arena, Rimbalzello, Aquaria Thermal Spa, … |
| **Unplanned** | CanevaWorld Aquapark, Movieland, Jungle Adventure, … |
| **Order** | Unplanned rows **above** Planned rows |
| **Filter** | “Unplanned only” hides Gardaland |

Tap a Planned row → should navigate to itinerary day anchor.

---

## 3. Verify Plan B on itinerary (after Step 5)

1. Open **Itinerary**
2. **Day 3** (Jun 27 — boat day): expand **“Backup options (Plan B)”**
3. See CanevaWorld / Movieland with reason lines
4. Tap **Add to this day** on one backup → activity appended; toast success
5. **Day 6** (Gardaland): Plan B shows theme-park alternates if still unplanned

---

## 4. Target Bank day picker (after Step 4)

1. On any day card, open **Add from Target Bank**
2. Planned entries show badge and cannot be selected
3. Unplanned entries add as before (`step18` flow)

---

## 5. Run tests

```bash
npm test -- bankPlanned planB
npm run test:e2e -- step25.bank-planned-plan-b
npm run lint && npm run build
```

---

## 6. Manual rain scenario (user story)

**Situation:** Jun 27 morning rain, boat rental cancelled.

1. Open Itinerary → Day 3 → Plan B
2. Choose CanevaWorld or Movieland → Add to day
3. Plan A boat activities remain; user decides manually what to skip
4. Return to Locations → newly added backup may show Planned if title/id matches

No full replan required.

---

## 7. Files to touch (reference)

| File | Purpose |
| --- | --- |
| `lib/bankPlanned.ts` | Planned detection + sort |
| `lib/planB.ts` | Day backup options |
| `lib/lakeGardaDayBackups.ts` | Curated day → bank ids |
| `components/SavedAttractionsList.tsx` | Badge, filter, sort |
| `components/PlanBDayPanel.tsx` | Plan B accordion |
| `components/ItineraryCard.tsx` | Wire Plan B per day |
| `e2e/step25.bank-planned-plan-b.smoke.spec.ts` | Smoke |

---

## 8. Next command

After reviewing this plan, run **`/speckit-tasks`** to generate `tasks.md`, then implement **Step 1** after **`confirmed`**.
