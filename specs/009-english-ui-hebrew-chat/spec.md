# Specification: English UI Only — Hebrew Supported in Chat

## 1. Goal & Context

TripiAgent currently pins the entire application interface to **Hebrew** with permanent right-to-left layout (Feature 008). Travelers who prefer English for navigation, labels, and forms must read Hebrew chrome even when they plan to use English with the AI assistant.

Product direction: **English is the only application language** for all screens, navigation, buttons, checklists, and static copy. **Hebrew remains supported in the AI chat** — users may type in Hebrew (or English), and the assistant replies in the language of the message. The rest of the app does not offer Hebrew UI or a global language switcher.

**Target personas:** English-primary planners and in-trip travelers. Hebrew-speaking family members can still converse with the assistant in Hebrew without changing app chrome.

**Relationship to prior work:** Reverses the user-facing outcome of Feature 008 (`specs/008-hebrew-ui-english-chat`) while **keeping** bidirectional text handling for chat messages, place names, flight codes, and Italian addresses inside an English left-to-right shell.

## Clarifications

### Session 2026-06-03

- Q: When a single chat message mixes Hebrew and English, which language should the assistant use for the full reply? → A: English reply unless the message is entirely or overwhelmingly Hebrew.
- Q: For chat requests before the user has typed (e.g. quick-prompt chips), what should the assistant language hint be? → A: Always English hint (matches pinned UI), even if the device/browser locale is Hebrew.
- Q: How should hardcoded Hebrew outside the translation switcher (toasts, hybrid labels, map copy) be handled? → A: Convert all user-visible and accessibility strings to English.
- Q: For English-only UI, what should happen to RTL layout mirroring from Feature 008? → A: Standard LTR layout everywhere except chat bubbles and isolated direction islands.
- Q: How should existing user-entered trip content in Hebrew display after this change? → A: Show as stored with appropriate text direction; only system chrome must be English.

---

## 2. User Stories

- **As an English-speaking traveler**, I want every screen label, nav item, and button in English with left-to-right layout, **so that** I can plan and use the trip without reading Hebrew chrome.
- **As a traveler**, I want to ask the AI assistant questions in **Hebrew or English**, **so that** I can use the language that fits the moment without changing the rest of the app.
- **As a traveler**, I want place names, flight codes, and Italian addresses to display correctly when mixed with English UI text, **so that** codes and foreign names stay readable.
- **As a returning user** who previously used Hebrew UI, I want the app to open in English automatically after this update, **so that** I am not stuck on Hebrew labels without a toggle.

---

## 3. Functional Requirements

### A. No global language switcher

- [ ] The application does not expose a control to switch the whole UI between Hebrew and English (top bar, login, settings, pack, or elsewhere).
- [ ] Users cannot restore Hebrew application chrome through in-app settings in this release.

### B. Pin application UI to English

- [ ] All user-visible static strings (navigation, page titles, subtitles, buttons, empty states, checklist labels, form labels, toasts, and confirmation copy) appear in **English**.
- [ ] **No hardcoded Hebrew chrome** remains in production UI — including strings bypassing the translation catalog (bookmark toasts, hybrid bilingual labels, map headings, and accessibility labels/ARIA text).
- [ ] The primary reading direction for the application shell is **left-to-right** on all main routes after the app loads.
- [ ] **Revert RTL shell mirroring** from Feature 008: navigation order, FAB placement, drawers, and icons use **standard LTR layout** (not mirrored RTL chrome).
- [ ] Default and persisted application language is **English**. Users who previously had Hebrew UI stored on the device see English chrome on next open without being prompted to choose a language.
- [ ] Hebrew translation catalogs are not offered as a selectable application language in production.

### C. Chat — Hebrew and English supported

- [ ] The chat screen title, placeholder, and quick-prompt chips use **English** chrome copy (consistent with the rest of the app).
- [ ] Chat input accepts and displays **Hebrew and English** text with correct direction per message (mixed-direction input behaves naturally).
- [ ] User and assistant message bodies render with direction appropriate to the message content (Hebrew paragraphs read right-to-left; English left-to-right).
- [ ] The assistant responds in the **same language the user used** when the message is **entirely or overwhelmingly Hebrew** (Hebrew reply) or **entirely or overwhelmingly English** (English reply).
- [ ] **Mixed-language messages** (Hebrew and English in one message without a clear dominant language): the assistant replies in **English**, except when the message is **entirely or overwhelmingly Hebrew** — then the reply is in Hebrew.
- [ ] **Quick-prompt and pre-typed sends** (user has not composed free text): the assistant language hint is **always English**, regardless of device/browser locale.
- [ ] **User-typed sends:** the language hint is derived from the **message content** (not browser locale and not a global UI toggle), so overwhelmingly Hebrew input can still receive Hebrew replies per §3.C.
- [ ] Browser/system locale must **not** override English UI pinning or quick-prompt English hints.

### D. Mixed-direction and user-generated content

- [ ] Dynamic values such as addresses, voucher codes, coordinates, and Italian place names remain readable when embedded in English UI (appropriate isolation for codes and foreign names).
- [ ] **User-entered trip data** (saved attraction names, custom POIs, packing items, activity titles/descriptions, logistics notes) **displays as stored**, including Hebrew text entered under Feature 008, with **appropriate per-field text direction** (`auto` or equivalent).
- [ ] This feature does **not** require users to re-enter or translate their saved Hebrew content; only **system-owned chrome** must switch to English.
- [ ] Search and investigate inputs that accept free text continue to support mixed Hebrew/English typing where already supported.

### E. Login and onboarding

- [ ] Login and first-run screens use the same English chrome as the rest of the app.

### F. Scope boundaries

- [ ] This feature does **not** require translating third-party place or weather data into English.
- [ ] This feature does **not** add per-traveler UI language preferences in the auth or group model.
- [ ] Screen information architecture (prep hub, six tabs, routes) is unchanged unless copy updates are required for English-only wording.

---

## 4. UI & Form Factor Constraints

- **Viewport:** 390px mobile-first; bottom navigation labels must fit in English without truncation on a standard phone width.
- **Layout:** Permanent left-to-right for main routes with **standard LTR mirroring** (no RTL nav/FAB inversion); isolated right-to-left islands only inside chat bubbles or dynamic values that require it.
- **Accessibility:** Document `lang` and `dir` reflect English LTR for the shell.
- **Chat:** English chrome; message body language follows user input.
- **Chat regions:** Allow mixed languages in message bodies; shell remains English LTR.

---

## 5. Security & Edge Cases

- **Persistence:** Legacy Hebrew-only UI preference stored on the device must not leave the app showing Hebrew navigation after upgrade.
- **Offline:** English labels and user-entered chat history remain available offline; language behavior does not depend on network for UI pinning.
- **Regression:** Bookmark, itinerary, logistics, packing, and discover flows behave as before aside from language and direction defaults.
- **Mixed chat:** A message combining Hebrew and English (without being overwhelmingly Hebrew) must not produce a fully Hebrew assistant reply.
- **Hebrew browser:** Device locale `he` / `he-IL` with an English quick-prompt still sends an English language hint and yields an English assistant reply.
- **Hebrew user data:** Hebrew saved attraction or activity titles remain visible and readable inside English LTR chrome; they are not deleted or forced to English.
- **Automated checks:** Any tests that assume Hebrew navigation labels, Hebrew toasts, Hebrew-only document direction, or bilingual hybrid labels must be updated to expect English defaults.

---

## 6. Assumptions

1. **No server-side user locale** in v1 — language pinning is client-side only.
2. **No per-user locale** in the auth store for this feature — group trips share English UI.
3. **Hebrew strings may remain** in the codebase for tests or future use but are not user-selectable in production UI.
4. **Feature 007** (place suggestion links) and **Feature 006** (prep screen reorg) are independent; this spec only changes language and direction defaults plus chat bilingual behavior.
5. **Voice input** and automatic language detection beyond existing assistant behavior are out of scope.

---

## 7. Success Criteria

1. **No toggle:** Visual inspection on mobile confirms no application-wide language control.
2. **English chrome:** Bottom navigation and page titles show English on cold load without visiting settings; no Hebrew or bilingual hybrid labels in visible chrome or accessibility strings.
3. **Left-to-right shell:** Main routes present a left-to-right reading experience for headings and body copy after the app loads; bottom navigation and primary actions follow standard LTR placement (not RTL-mirrored).
4. **Hebrew chat:** User can send a Hebrew-only message on the chat screen and receive a Hebrew reply; English-only message receives an English reply; mixed Hebrew/English message receives an English reply (manual smoke or automated check).
5. **Quick-prompt English:** Tapping an English quick-prompt on a Hebrew-locale device produces an English assistant reply (smoke or automated check).
6. **Migration:** User who previously used Hebrew UI opens the app and sees English navigation without using a toggle.
7. **Regression:** Bookmark, itinerary, logistics, and packing flows complete successfully aside from language pinning.

---

## 8. Key Entities

| Entity | Description | Persistence |
| --- | --- | --- |
| Application UI language | Single production value: English | Device storage; legacy Hebrew coerced to English on load |
| Chat message | User or assistant text; language per message | Trip conversation history on device |
| User-generated trip content | Titles, notes, POI names (any language) | Device storage; shown as stored, not migrated to English |
| Assistant language hint | Informs reply language for a turn | English for quick-prompts; for typed messages, derived from message content (never browser override) |

---

## 9. Out of Scope

- Removing Hebrew translation data from the repository entirely
- Translating external place or weather API strings to English
- Per-traveler UI locale in authentication or group profiles
- Reintroducing a global EN/עב language toggle
- Voice input or new automatic language-detection product beyond current assistant behavior
