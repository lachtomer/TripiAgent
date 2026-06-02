# Specification: Lake Garda Teen Itinerary & Target Bank Refresh

## Summary

Refresh `DEFAULT_ITALY_ITINERARY` and Target Bank seed data to match the approved Jun 2026 Monzambano trip plan for teens 15–18: nature day, shopping en route to Milan, 10:00–19:00 day trips, max ~3h walking, restaurant recommendations embedded in activity descriptions.

## Requirements

- **FR-1** Replace Mantova day with Gardaland (Jun 30).
- **FR-2** Reschedule lake days per approved plan (boat + Rimbalzello, Verona + Natura Viva, Monte Baldo nature day, Borghetto + Sigurtà, Serravalle shopping Jul 3).
- **FR-3** All attraction and dining recommendation POIs appear in Target Bank (`lakeGardaTargetBank.ts`) and admin `data/bank.json`.
- **FR-4** Activity descriptions include restaurant names and booking notes where relevant.
- **FR-5** Essentials checklist reflects new advance bookings (Gardaland, Taverna del Silenzio, boat rental).

## Out of scope

- Persist migration for existing localStorage itineraries (document reset in quickstart).
- Live API integrations for bookings.
