# Quickstart — 012 Calendar Day Guide & Itinerary Refresh

## Prerequisites

- Node 20+, repo at `C:\TripiAgent`
- Dev server **http://localhost:9001**
- Active spec: `specs/012-calendar-day-guide/`

---

## 1. Reset to default trip

1. Open **http://localhost:9001/itinerary**
2. Set trip start date **2026-06-25** if empty
3. Reset store if needed (fresh session / clear localStorage key `tripiagent-trip-storage`)

---

## 2. Verify updated day titles (after Step 4)

| Day | Expected title (substring) |
| --- | --- |
| 2 | `Jun 26` · Bergamo |
| 3 | `Jun 27` · Castellaro or Borghetto |
| 4 | `Jun 28` · Verona or Monte Baldo |
| 5 | `Jun 29` · Gardaland |
| 6 | `Jun 30` · Sirmione · Aquaria |
| 7 | `Jul 1` · CanevaWorld or Peschiera |
| 8 | `Jul 2` · Manerba |
| 9 | `Jul 3` · Serravalle or Milan |

**Must NOT appear** on default seed: Natura Viva Safari, Rimbalzello, Desenzano boat day title.

---

## 3. Verify Day Guide (after Step 3)

| Day | Check |
| --- | --- |
| 2 | Expand `#day-guide-2` → Bergamo must-see (Piazza Vecchia) + lunch La Bruschetta link |
| 3 | Taverna del Silenzio under Food |
| 4 | Banner + Option A Verona + Option B Monte Baldo |
| 6 | Optional Grotte di Catullo spot |
| 8 | Optional Manerba village |
| Today | If start date = today offset, today’s guide expanded by default |

Tap a food link → opens new tab (Maps or site).

---

## 4. Regression

- Plan B still shows on relevant days (Feature 011)
- Add from Target Bank works
- Edit activity / day title still works

---

## 5. Tests

```bash
npm test -- tripDayGuides
npm run test:e2e -- step26.calendar-day-guide step4h
npm run lint && npm run build
```

---

## 6. Content spot-check URLs

Manually verify one link per day opens (mobile or desktop):

- Day 2: visitbergamo.net or Bergamo Maps
- Day 5: gardaland.it
- Day 6: aquaria.it
- Day 7: canevaworld.it
