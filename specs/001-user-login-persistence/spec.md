# Specification: User Login & Persisted Trip Selections

## 1. Goal & Context

TripiAgent today keeps trip data on a single device without tying it to a recognizable person. Travelers can switch display names, but anyone using the same phone or browser shares one blob of saved plans, packing progress, chat context, and attraction picks. That breaks down when the app should remember **Tomer’s** choices separately from another traveler’s, or when the same person returns on a new visit and expects their work to still be there.

This feature introduces **named sign-in** (username and password) so each traveler has their own saved trip state. Passwords may be as simple as matching the username (e.g. user `Tomer` / password `Tomer`) for trusted, small-group use. After sign-in, **selections**—itinerary edits, saved attractions, packing checkmarks, active traveler profile within the group, trip mode, locale, and related preferences—must load for that account and stay isolated from other accounts on the same device.

**Out of scope for this feature** (separate specification): supporting multiple independent trips or destinations per account (e.g. Italy vs. Japan, or “Family Rome 2026” vs. “Work Milan 2027”). See follow-up feature *Multi-Trip Workspaces*.

**Target audience:** Small travel groups and individual planners using TripiAgent on mobile.

---

## 2. User Scenarios & Testing

### Scenario 1: First-time sign-in on a device

**Given** the app has no signed-in user (or only anonymous local data),  
**When** the traveler enters username `Tomer` and password `Tomer` and confirms sign-in,  
**Then** they see the main app with Tomer’s saved trip state if it exists, or a sensible empty starting state if Tomer is new on this device,  
**And** subsequent changes to itinerary, saved attractions, and packing selections are stored under Tomer’s account.

### Scenario 2: Returning user on the same device

**Given** Tomer previously signed in and saved selections on this device,  
**When** Tomer signs out and later signs in again with the same credentials,  
**Then** all selections from the prior session are restored (itinerary structure, saved attractions, packing progress, group member profile choice, trip mode, and language preference).

### Scenario 3: Two accounts on one device

**Given** Tomer is signed in and has customized selections,  
**When** Tomer signs out and another traveler signs in as `Liran` with valid credentials,  
**Then** Liran sees only Liran’s data, not Tomer’s,  
**And** when Tomer signs back in, Tomer’s prior selections are unchanged.

### Scenario 4: Wrong password

**Given** the sign-in screen is shown,  
**When** the traveler enters a valid username with an incorrect password,  
**Then** sign-in fails with a clear, non-technical message,  
**And** no other account’s data is exposed or modified.

### Scenario 5: Sign-out

**Given** a signed-in user,  
**When** they choose sign-out,  
**Then** they return to the sign-in experience,  
**And** the next person cannot access the previous user’s trip data without signing in.

### Scenario 6: Migration from anonymous use

**Given** existing anonymous trip data on the device from before login existed,  
**When** the traveler signs in for the first time,  
**Then** they are offered a one-time choice to attach existing local data to their account or start fresh (default: attach if the account has no saved data yet).

---

## 3. User Stories

- **As a traveler**, I want to sign in with my name and password so that my trip plans belong to me and not to whoever used the phone last.
- **As a traveler**, I want my itinerary, saved places, and packing checkmarks to still be there when I open the app again after closing it, so I do not redo planning work.
- **As a group trip member**, I want my personal packing list and “who I am” selection in the group to stay tied to my login, so switching accounts does not mix our bags.
- **As an admin traveler** (e.g. bank moderators), I want my elevated permissions to apply only when I am signed in as that person, so permissions follow identity—not a shared dropdown label.
- **As a household sharing one phone**, I want sign-out so the next person must use their own login before seeing private trip details.

---

## 4. Functional Requirements

### Sign-in & sign-out

- [ ] **FR-1** The app provides a dedicated sign-in flow before trip features are available when no user is authenticated.
- [ ] **FR-2** Sign-in accepts a username and password; both fields are required.
- [ ] **FR-3** The system validates credentials against registered accounts; invalid combinations are rejected without revealing whether the username exists.
- [ ] **FR-4** Accounts may use a password identical to the username (e.g. `Tomer` / `Tomer`) for v1 trusted deployments.
- [ ] **FR-5** Signed-in users can sign out; sign-out clears access to the previous account’s in-memory session until the correct credentials are entered again.
- [ ] **FR-6** The active signed-in identity is visible in the app chrome (e.g. display name) so users know whose data they are editing.

### Persisted selections (per account)

- [ ] **FR-7** The following are persisted per signed-in account and restored on sign-in on the same device:
  - Itinerary days, activities, and completion markers
  - Saved / target-bank attractions and personal interest signals
  - Packing lists per group member profile within the trip
  - Active group member profile selection
  - Trip planning vs. in-trip mode
  - Locale / language preference
  - Trip start date and location context used for planning
  - Chat message history for the active trip (if present)
- [ ] **FR-8** Changes to any of the above while signed in are saved automatically without a separate “Save” action.
- [ ] **FR-9** Data for account A is never shown to account B on the same device without B’s successful sign-in.

### Account model (v1)

- [ ] **FR-10** Initial account roster includes at least the travelers already used in the product (e.g. Tomer, Liran, and other named group members); additional accounts may be added through a controlled process defined in implementation planning.
- [ ] **FR-11** Admin-only actions (e.g. removing shared bank entries) are permitted only when the signed-in identity matches an admin account.

### Migration & empty states

- [ ] **FR-12** On first sign-in after upgrade, if anonymous local trip data exists, the user can attach it to their account or discard it.
- [ ] **FR-13** New accounts with no prior data receive the same default trip starter experience new users get today (no broken screens).

### Security & usability (proportionate to v1)

- [ ] **FR-14** Passwords are not shown in plain text in the UI after entry.
- [ ] **FR-15** Repeated failed sign-in attempts are rate-limited or delayed enough to deter casual guessing on a shared device.
- [ ] **FR-16** Error messages are short and actionable (e.g. “Username or password incorrect”) without stack traces or internal codes.

---

## 5. Success Criteria

- **SC-1** A traveler who signs in, changes at least three selection types (e.g. itinerary activity, saved attraction, packing item), signs out, and signs back in sees 100% of those changes restored on the same device.
- **SC-2** Two different accounts used sequentially on one device show zero cross-leakage of itinerary or packing data in manual acceptance testing (minimum three switch cycles).
- **SC-3** Sign-in with valid credentials completes and reaches the home experience in under 10 seconds on a typical mobile connection (excluding first-load asset download).
- **SC-4** Invalid credentials are rejected within 3 seconds with a user-visible message; no partial trip data from another account is rendered.
- **SC-5** At least 90% of pilot users (e.g. Tomer and Liran) report they can tell whose account is active without opening settings.
- **SC-6** After migration from anonymous data, users who choose “keep my data” retain all pre-login selections without manual re-entry.

---

## 6. Key Entities

| Entity | Description |
|--------|-------------|
| **Account** | A unique username, secret credential, display name, and role (e.g. traveler vs. admin). |
| **Session** | The currently signed-in account on this device until sign-out or credential expiry (if used). |
| **Trip selections bundle** | The persisted set of planning and in-trip choices listed in FR-7, owned by one account on this device. |
| **Group member profile** | A traveler identity within a shared trip (packing list, labels); still scoped under the signed-in account’s bundle. |
| **Anonymous legacy blob** | Pre-feature local data eligible for one-time attachment to an account. |

---

## 7. Assumptions

- v1 targets **same-device persistence** per account; syncing the same account across multiple phones or browsers is a future enhancement (see Multi-Trip Workspaces and platform roadmap).
- The user group is small and trusted; simple passwords (including username-as-password) are acceptable for this release.
- No payment, legal identity, or enterprise SSO is required.
- Existing “passwordless profile switcher” behavior is superseded by sign-in: switching people on one device requires sign-out and a different login.
- Server-side account storage may be introduced later; this spec requires **behavioral** isolation and durability from the traveler’s perspective, not a specific storage technology.

---

## 8. UI & Form Factor Constraints

- Sign-in and sign-out flows are optimized for a **390px mobile** viewport with large tap targets.
- Sign-in is reachable on cold start when unauthenticated; sign-out is reachable from profile or settings without buried navigation.
- Accent and dark-mode conventions match the rest of TripiAgent.

---

## 9. Edge Cases

- **Empty password or username:** Block submit; inline validation.
- **Account exists but has no saved bundle:** Show defaults; do not error.
- **Corrupted or partial saved bundle:** Fall back to defaults for missing slices; optional single recovery message.
- **Sign-in during active AI planning:** Complete or cancel in-flight planning before swapping account data to avoid mixed state.
- **Shared device, forgot sign-out:** Next opener sees sign-in screen, not last user’s itinerary (after session ends on sign-out or app data clear).
- **Renamed display name vs. username:** Username remains stable key; display name may differ for UI.

---

## 10. Dependencies

- Existing multi–group-member profile and packing behavior (per-member lists within one trip).
- Existing admin rules for shared target bank (must bind to signed-in admin identity).
- Follow-up specification: **Multi-Trip Workspaces** for multiple destinations or concurrent trips per person.

---

## 11. Out of Scope

- Multiple trips or destinations per account (separate feature).
- Self-service registration, password reset email, or OAuth social login.
- Cross-device cloud sync and backup.
- Fine-grained sharing links or collaborative real-time editing between accounts.
