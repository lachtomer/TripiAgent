# Specification: Step 15 - RTL and Hebrew Support

## 1. Goal & Context
To support Hebrew-speaking travelers, TripiAgent will introduce a bilingual UI toggle (English & Hebrew) and full Right-to-Left (RTL) layout compatibility. While UI labels, buttons, headers, and navigation options will translate to Hebrew, destination-specific data (place names, Italian addresses, weather descriptions, flight codes, and logistics numbers) will remain in English/Italian. The layout must seamlessly adapt, ensuring LTR data blocks are properly formatted and readable inside the RTL Hebrew interface.

## 2. User Stories
*   **As a Hebrew-speaking traveler**, I want to switch the application language to Hebrew, so that I can easily read headers, button labels, and instructions.
*   **As a traveler using the Hebrew UI**, I want restaurant names, street addresses, and flight booking reference numbers to render from left to right (LTR), so that they are not garbled or structurally misordered by the browser's RTL rendering engine.

## 3. Functional Requirements
- [ ] **Global Language State:** Add `locale` ("en" | "he") state and `setLocale` action to the Zustand store (`stores/tripStore.ts`).
- [ ] **Bilingual Language Toggle:** Add a language selector button ("EN" / "עב") in `TopAppBar.tsx` to toggle between English and Hebrew.
- [ ] **HTML Direction Binding:** Dynamically bind the `dir` attribute (`ltr` or `rtl`) and `lang` attribute on the root html element in `app/layout.tsx` based on the active Zustand `locale`.
- [ ] **Translation Dictionary:** Implement a client-safe translation helper or dictionary mapping core UI strings (navigation tabs, section headers, search buttons, category badges, packing categories, and buttons) to Hebrew.
- [ ] **BiDi Isolation Wrappers:** Wrap all English/Italian dynamic values (place names, addresses, ratings, flight codes, car rental vouchers, and coordinates) in LTR containers (`dir="ltr" text-left`) to prevent mixed-direction garbling.
- [ ] **Tailwind Logical Properties Migration:** Refactor absolute styling, margins, padding, and text-alignments to use logical properties (`text-start`/`text-end`, `ps-*`/`pe-*`, `ms-*`/`me-*`, `start-*`/`end-*`) in all primary page views and components.
- [ ] **Icon Mirroring:** Mirror directional icons (like `ArrowRight` or navigation chevrons) on RTL layout states to point backward/forward logically.

## 4. UI & Form Factor Constraints
*   **Viewport:** Tailored to 390px mobile viewport.
*   **Layout Mirroring:** The bottom navigation, profile menu, and grids must swap sides cleanly. The floating action button (FAB) must reposition to the opposite side of the screen when in RTL.

## 5. Security & Edge Cases
*   **Edge Cases:**
    *   **Mixed Text Inputs:** Chat inputs and search boxes must use `dir="auto"` so they align correctly whether the user types in English or Hebrew.
    *   **Persisted Language Preferences:** The user's language selection must persist in `localStorage` across page refreshes.
