# Specification: User Login & Layered Trip Persistence

## 1. Goal & Context

TripiAgent today keeps trip data on a single device without tying it to a recognizable person. Travelers can switch display names, but anyone using the same phone or browser shares one undifferentiated blob of plans. That breaks down when:

- The **group** should share one itinerary while each person keeps **their own** packing and preferences.
- A traveler signs in as **Tomer** and expects their personal slice to persist across sessions without mixing with another account’s personal data on a shared phone.

This feature introduces **named sign-in** (username and password; password may equal username, e.g. `Tomer` / `Tomer`) and a **layered persistence model**:

| Layer | What persists | Who sees / edits it |
|-------|----------------|---------------------|
| **Group trip** | Itinerary, target/saved bank, trip dates, destination context, group chat | All signed-in members of the same trip |
| **Common packing** | Items everyone should bring (shared list) | Whole group; edits visible to all |
| **Personal** | Per-traveler packing items and checkmarks, locale, “who I am” in the group, personal signals on bank items | Only the signed-in traveler |
| **Account** | Credentials, role (e.g. admin), link to group trip data | The individual who signed in |

**Example:** Tomer and Liran both see the same Day 3 itinerary. The group shares “power adapter” on the common packing list. Tomer has a personal “inhaler” item only on his list; Liran has personal “contact lenses” only on hers.

**Out of scope** (separate feature — *Multi-Trip Workspaces*): multiple independent trips or destinations per person (e.g. Italy 2026 vs. Japan 2027). See backlog F-2.

**Target audience:** Small travel groups using TripiAgent on mobile.

---

## 2. User Scenarios & Testing

### Scenario 1: First-time sign-in

**Given** no signed-in user,  
**When** Tomer signs in with valid credentials,  
**Then** he sees the group trip (shared itinerary and bank) plus his personal packing slice and common packing,  
**And** edits to the itinerary are visible to any other group member who signs in on this or another device (within v1 same-device scope for persistence delivery).

### Scenario 2: Shared itinerary, personal packing

**Given** Tomer is signed in and adds an activity to Day 2,  
**When** Liran signs in on the same device (after Tomer signs out),  
**Then** Liran sees Tomer’s Day 2 activity on the shared itinerary,  
**And** Liran sees the common packing list unchanged,  
**And** Liran does **not** see Tomer’s personal packing items or Tomer’s personal checkmarks.

### Scenario 3: Common vs. personal packing

**Given** the group has a common item “Sunscreen” and Tomer has a personal item “EpiPen”,  
**When** Tomer checks off “Sunscreen”,  
**Then** the common item shows as packed for the group (or for Tomer’s view of the common list per product rules),  
**And** Liran still sees “EpiPen” only when signed in as Tomer, not on her personal list.

### Scenario 4: Returning user

**Given** Tomer previously signed in and changed itinerary, common packing, and personal packing,  
**When** Tomer signs in again later on the same device,  
**Then** shared itinerary and bank match the last group state,  
**And** Tomer’s personal packing state is fully restored,  
**And** common packing state matches what the group last saved.

### Scenario 5: Wrong password

**Given** the sign-in screen is shown,  
**When** credentials are invalid,  
**Then** sign-in fails with a clear message and no trip data is shown.

### Scenario 6: Sign-out on a shared phone

**Given** Tomer is signed in,  
**When** he signs out,  
**Then** the next person must sign in before viewing or editing trip data.

### Scenario 7: Migration from anonymous use

**Given** anonymous local data exists from before login,  
**When** the first traveler signs in,  
**Then** they may attach that data as the group trip plus map personal slices to their account (one-time flow).

---

## 3. User Stories

- **As a group planner**, I want one itinerary we all share so we are aligned on where we go each day.
- **As a traveler**, I want to sign in so my personal packing and preferences stay mine on a shared phone.
- **As a group**, we want a common packing list for shared essentials (charger, first-aid kit) so we do not duplicate planning.
- **As an individual**, I want personal packing items (medication, clothing size-specific gear) that other members do not need to see on their lists.
- **As an admin**, I want bank moderation permissions only when I am signed in as an admin account.
- **As a household**, I want sign-out so the next person must authenticate before editing our trip.

---

## 4. Functional Requirements

### Sign-in & sign-out

- [ ] **FR-1** Dedicated sign-in before trip features when unauthenticated.
- [ ] **FR-2** Username and password required; invalid combinations rejected without revealing whether the username exists.
- [ ] **FR-3** Password may equal username for v1 trusted groups (e.g. `Tomer` / `Tomer`).
- [ ] **FR-4** Sign-out returns to sign-in; in-memory access to trip data ends until the next successful sign-in.
- [ ] **FR-5** Active signed-in identity is visible in the app chrome.

### Group-shared persistence

- [ ] **FR-6** The following are stored once per **group trip** and are the same for every signed-in member of that trip:
  - Itinerary (days, activities, structure)
  - Target / saved attraction bank (shared entries)
  - Trip start date and destination / location context used for planning
  - Group chat history for the active trip (if used)
  - Trip planning vs. in-trip mode (group-level default)
- [ ] **FR-7** Any signed-in member may edit shared itinerary and bank subject to existing role rules (e.g. only admins remove bank entries).
- [ ] **FR-8** Changes to group-shared data while any member is signed in are saved automatically and appear for the next member who signs in.

### Common + personal packing

- [ ] **FR-9** Packing supports two lists: **common** (group) and **personal** (per signed-in traveler).
- [ ] **FR-10** Common packing items are visible to all group members; add, remove, and check-off behavior for common items follows one consistent group rule (documented in planning: e.g. anyone can add; check-off may be per-user or group-wide—default: check-off is per-user on common items so “I packed the sunscreen” does not falsely mark it for everyone).
- [ ] **FR-11** Personal packing items are visible and editable only for the signed-in traveler; other members never see them on their personal list.
- [ ] **FR-12** Personal and common packing state restore correctly on sign-in for that traveler and group trip.

### Per-user (non-packing) persistence

- [ ] **FR-13** Per signed-in traveler within the group trip: locale / language preference, active “who I am” label in the group, and personal interest/vote signals on bank items (if applicable).
- [ ] **FR-14** Activity completion markers, if shown, are stored per traveler on top of the shared itinerary (one traveler marking “done” does not force “done” for others unless product defines group completion separately).

### Account & security

- [ ] **FR-15** Initial account roster covers existing named travelers (e.g. Tomer, Liran); provisioning process defined in planning.
- [ ] **FR-16** Admin-only actions require signed-in admin identity.
- [ ] **FR-17** Passwords are not shown in plain text after entry; failed attempts are rate-limited or delayed appropriately.
- [ ] **FR-18** Actionable error messages only (no internal codes).

### Migration

- [ ] **FR-19** First sign-in after upgrade may attach anonymous local data to the group trip and assign personal slices to the signing-in account.
- [ ] **FR-20** New accounts without history receive the standard empty / default group trip experience.

---

## 5. Success Criteria

- **SC-1** Two travelers signing in sequentially on one device see **identical** shared itinerary and bank after either edits the itinerary.
- **SC-2** The same two travelers see **different** personal packing lists; neither sees the other’s personal items.
- **SC-3** A common packing item added by one member appears for the second member after sign-in switch without re-entry.
- **SC-4** Personal packing checkmarks for Tomer are unchanged after Liran signs in and out and Tomer signs back in (three cycles).
- **SC-5** Sign-in completes to the home experience in under 10 seconds on a typical mobile connection (excluding first asset load).
- **SC-6** Invalid credentials rejected within 3 seconds with a user-visible message.
- **SC-7** Pilot users report they can tell who is signed in and whether they are editing shared vs. personal packing.

---

## 6. Key Entities

| Entity | Description |
|--------|-------------|
| **Account** | Username, credential, display name, role (traveler / admin). |
| **Session** | Currently signed-in account on this device. |
| **Group trip** | One shared planning context: itinerary, bank, dates, destination, group chat, common packing. |
| **Common packing list** | Group-wide items and their state. |
| **Personal packing list** | Items and checkmarks owned by one account within the group trip. |
| **Personal preferences** | Locale, group-member label, personal bank signals. |
| **Anonymous legacy blob** | Pre-feature data offered for one-time migration into group + personal slices. |

---

## 7. Assumptions

- v1 **same device** persistence for how group + personal data is stored; cross-device sync is future work.
- One **active group trip** per device session in v1; multi-trip switching is F-2.
- Small, trusted group; username-as-password is acceptable.
- Passwordless profile switcher is replaced by sign-in; switching identity on a shared phone uses sign-out / sign-in.
- “Per-user check-off on common items” is the default unless planning chooses group-wide check-off for common items.

---

## 8. UI & Form Factor Constraints

- Sign-in / sign-out optimized for **390px** mobile; large tap targets.
- UI distinguishes **shared** surfaces (itinerary, bank) from **personal** surfaces (my packing) so users know what affects the whole group.
- Accent and dark mode match TripiAgent.

---

## 9. Edge Cases

- **Concurrent edits:** Last save wins for group itinerary, or planning defines merge rules; users see a non-technical notice if their edit was overwritten.
- **Only personal data exists after migration:** Group trip starts from defaults; personal slice still attaches.
- **Sign-in during AI planning:** Finish or cancel planning before swapping account to avoid mixed state.
- **Admin signs out mid-delete:** Operation completes or rolls back atomically before session ends.
- **Empty common list:** Personal packing still works.
- **Corrupted slice:** Fall back to defaults for that slice only (group vs. personal).

---

## 10. Dependencies

- Existing group member profiles and packing UX (extend with common vs. personal).
- Existing bank admin rules (bind to signed-in admin).
- **F-2 Multi-Trip Workspaces** (backlog) for multiple destinations/trips per account.

---

## 11. Out of Scope

- Multiple trips or destinations per account (F-2).
- Self-service registration, password reset email, OAuth.
- Cross-device cloud sync.
- Real-time collaborative cursors or live multi-user editing sessions.
