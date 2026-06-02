# Bank Admin Permissions (bank_tasks Task 4)

## Requirement (BR-7)
Only **Liran** and **Tomer** (`ADMIN_USER_NAMES`) may delete bank entries. All trip users may add entries via `/admin/bank` or POST `/api/bank/places`.

## Enforcement layers
| Layer | Add | Delete |
|-------|-----|--------|
| `SavedAttractionsList` | All users | Delete button visible only when `isBankAdmin(user)` |
| `tripStore.removeSavedAttraction` | — | Blocks non-admins with error toast |
| `POST /api/bank/places` | All (no auth v1) | — |
| `DELETE /api/bank/places` | — | Requires `requestedBy` in body; 403 if not admin |
| `/admin/bank` stored list | — | Remove control only for admins |

## Module
`lib/bankPermissions.ts` — `BANK_ADMIN_NAMES`, `isBankAdminName()`, `isBankAdminUser()`

## API
`DELETE /api/bank/places` — body `{ index: number, requestedBy: string }` → 200 `{ success: true }` | 403 | 400

## Notes
- v1 has no server session; `requestedBy` is the display name from `UserProfileSwitcher` (trusted client, same as existing trip store pattern).
- Admin role in `tripStore.users` aligns with `BANK_ADMIN_NAMES` (Liran u1, Tomer u7).
