# Step: Bookings page — flight times & booking-only content

## Goal
Rename "Logistics & Bookings" → **Bookings**; show Wizz Air schedule from Jun 19 confirmation email; keep only booking-related fields.

## Flights (Wizz Air, confirmation PQGFPN)
| Leg | Date | Depart | Arrive | Flight |
|-----|------|--------|--------|--------|
| TLV → MXP | Thu Jun 25 | 18:55 TLV | 22:10 MXP | W5 6404 (4h 15m) |
| MXP → TLV | Sat Jul 4 | 13:05 MXP | 18:00 TLV | W4 6403 (3h 55m) |

## Keep
- Flight schedule (read-only) + Wizz confirmation code (editable)
- Centauro car rental voucher
- EssentialsChecklist: Aquaria, Gardaland, Taverna, Manerba boat only

## Remove from bookings page
- Villa lockbox, Milan ZTL checkbox
- Portable CO/Smoke detector checklist item

## Files
- `lib/defaultFlightBookings.ts` (new)
- `types/index.ts`, `stores/tripStore.ts`
- `components/LogisticsCard.tsx` → booking-focused UI
- `lib/translations.ts`, `app/bookings/page.tsx`
- `components/EssentialsChecklist.tsx`
- E2E: step10, step15, step17, step20, travelAgentPersona
