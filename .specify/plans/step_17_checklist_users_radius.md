# Implementation Plan: Checklist Hebrew translation, Shared Attractions, Scoped Packing Lists, Custom Users, and Dynamic Search Radius

This plan details the design and implementation for localizing the Trip Essentials Checklist panel, verifying shared attraction data, validating user-specific packing list scopes, populating the customized user profiles with automatic migration, and adding a dynamic search radius selector.

---

## 1. User Review Required & Open Questions

> [!WARNING]
> **Local Storage Migration**: Changing `initialUsers` inside `stores/tripStore.ts` does not automatically update existing dev or production client browsers due to local storage persistence (`tripiagent-trip-storage`). If old profile state remains stored, it will crash or ignore the new names. We have planned a self-healing migration trigger inside the store's hydration callback.
> 
> **Admin Restrictive deletion vs Shared Creation**: 
> * Any user can bookmark or add custom POIs to the shared Attraction Bank.
> * Only Admins (`Liran` and `Tomer`) can delete attractions from the bank.

---

## 2. Proposed Changes

### Component: Translations (`lib/translations.ts`)
#### [MODIFY] [translations.ts](file:///C:/TripiAgent/lib/translations.ts)
* Add translation keys for the "Trip Essentials Checklist" component headers and items in both English and Hebrew (`essentialsTitle`, `essentialsDesc`, `prepProgress`, `percentReady`, `loadingChecklist`, and item specific titles/subtexts).

```typescript
// Add to translations.en
essentialsTitle: "Trip Essentials Checklist",
essentialsDesc: "Critical documents, permits, and safety checks",
prepProgress: "Preparation Progress",
percentReady: "{progress}% Ready",
loadingChecklist: "Loading checklist...",
item_e1_task: "Passports & Flights",
item_e1_subtext: "TLV → MXP on Jun 25. Check validity > 6 months.",
item_e2_task: "Centauro Car Rental Voucher",
item_e2_subtext: "Group E2 pickup at Malpensa on Jun 26, 10:00.",
item_e3_task: "Villa Eunice Check-in Keys",
item_e3_subtext: "Monzambano base keys and lockbox instructions saved.",
item_e4_task: "Portable CO/Smoke Detector",
item_e4_subtext: "⚠️ Villa Eunice has no detectors — highly recommended to bring one.",
item_e5_task: "Milan Area C / ZTL Registration",
item_e5_subtext: "Required fee (€7.50) for entry before 19:30 on Jul 3.",
item_e6_task: "Aquaria Thermal Spa Booking",
item_e6_subtext: "Verify reservation for the lakeside thermal spa in Sirmione on Jun 29.",
createdByLabel: "Added by {name}",

// Add to translations.he
essentialsTitle: "רשימת חיוני נסיעה",
essentialsDesc: "מסמכים קריטיים, אישורים ובדיקות בטיחות",
prepProgress: "התקדמות ההכנה",
percentReady: "{progress}% מוכן",
loadingChecklist: "טוען רשימת משימות...",
item_e1_task: "דרכונים וטיסות",
item_e1_subtext: "נתב\"ג ← מלפנסה ב-25 ביוני. בדוק תוקף > 6 חודשים.",
item_e2_task: "שובר השכרת רכב Centauro",
item_e2_subtext: "איסוף קבוצה E2 במלפנסה ב-26 ביוני, 10:00.",
item_e3_task: "מפתחות כניסה לוילה יוניס",
item_e3_subtext: "מפתחות בסיס מונזמבנו והוראות כספת מפתח שמורות.",
item_e4_task: "גלאי פחמן חד-חמצני/עשן נייד",
item_e4_subtext: "⚠️ בוילה יוניס אין גלאים — מומלץ מאוד להביא אחד.",
item_e5_task: "רישום לאזור C מילאנו / ZTL",
item_e5_subtext: "תשלום חובה (€7.50) לכניסה לפני 19:30 ב-3 ביולי.",
item_e6_task: "הזמנת ספא תרמי אקוואריה",
item_e6_subtext: "אמת הזמנה לספא התרמי שעל גדות האגם בסירמיונה ב-29 ביוני.",
createdByLabel: "נוסף על ידי {name}",
```

---

### Component: Trip Essentials Checklist (`components/EssentialsChecklist.tsx`)
#### [MODIFY] [EssentialsChecklist.tsx](file:///C:/TripiAgent/components/EssentialsChecklist.tsx)
* Use the `useTranslation()` hook to load localized strings.
* Add `dir={locale === 'he' ? 'rtl' : 'ltr'}` to the `<Card>` element.
* Replace the hardcoded `ESSENTIALS_ITEMS` array structure: use dynamic translations mapped by ID (e.g. `t[`item_${item.id}_task` as keyof typeof t]`).

---

### Component: Store & User State (`stores/tripStore.ts`)
#### [MODIFY] [tripStore.ts](file:///C:/TripiAgent/stores/tripStore.ts)
* Update `initialUsers` to list:
  1. Liran (Admin)
  2. Ilanit (User)
  3. Yoav (User)
  4. Maya (User)
  5. Noam (User)
  6. Mor (User)
  7. Tomer (Admin)
* Expand initial `userPackingLists` state keys to populate default lists for all 7 users.
* Add an automatic store migration check within store persistence or initialization. If the first user is named `"User 1"`, replace state with the new custom profiles, update current user to `"u1"` (Liran), and reset default packing states to prevent storage clashes.
* Extend `SavedAttraction` interface to include optional `createdBy?: string` (storing the name of the user who saved the item).

---

### Component: Attraction Search (`components/AttractionSearch.tsx`)
#### [MODIFY] [AttractionSearch.tsx](file:///C:/TripiAgent/components/AttractionSearch.tsx)
* Add a `selectedRadius` state (number, defaults to 5).
* Add a `lastSearchCoords` state containing `{ lat, lng, cityName, keyword }` to cache the coordinates of the last successful search query.
* Render a search radius selector inside the UI Card below the category toggles using styling matching the Slate design (chips indicating `1 KM / 5 KM / 10 KM / 50 KM`).
* When a user changes the radius chip, immediately invoke the geocoded query with the new radius parameters if `lastSearchCoords` is present.
* Populate `createdBy` with active user's name when calling `saveAttraction`.

---

### Component: User Profile Switcher (`components/UserProfileSwitcher.tsx`)
#### [MODIFY] [UserProfileSwitcher.tsx](file:///C:/TripiAgent/components/UserProfileSwitcher.tsx)
* Update the profile avatar calculation to extract the first letter of the name (`activeUser.name.charAt(0)`) instead of the last character (`charAt(activeUser.name.length - 1)`).

---

### Component: Saved Attractions List (`components/SavedAttractionsList.tsx`)
#### [MODIFY] [SavedAttractionsList.tsx](file:///C:/TripiAgent/components/SavedAttractionsList.tsx)
* Render the `createdBy` field elegantly on the attraction list items (e.g., "Added by Liran" / "נוסף על ידי לירן") to confirm that the bank aggregates inputs across all profiles.
* Update custom POI creation to save with `createdBy` populated with the current user's name.

---

## 3. Verification Plan

### Automated Tests
* Update `stores/tripStore.test.ts` to assert that:
  * Switching user profiles loads correct user-specific packing checklist items.
  * Adding a bookmark or custom POI saves with a `createdBy` username metadata.
* Create a new Playwright smoke test `e2e/step17.smoke.spec.ts` asserting:
  * Hebrew locale switcher updates the "Trip Essentials Checklist" header and item labels.
  * Changing search radius options triggers correct place requests with selected radius parameter.

---

## 4. Brutal Review & 10X Product Ideas

### Brutal Review
* **RTL Layout Breaks**: Applying `dir="rtl"` is clean, but flex elements with hardcoded left or right margins (`mr-2`, `pl-4`) will cause visual misalignment. We must audit layout spacing and ensure margins use layout-safe classes (e.g. `gap` space, or `rtl:ml-2` overrides).
* **AI Generation Constraints**: If a user generates a packing list using AI, does it rewrite packing list items globally? We must lock AI generation scopes strictly to `currentUser` so that generating with AI for Maya doesn't overwrite Mor's manual entries.

### 10X Product Ideas (How to get more from this App)
1. **Interactive Collaborative Mapping (Google Maps API)**: Render the shared Attraction Bank on a real-time Google Map inside the `/itinerary` or `/` page. Group members can visualize proximity clusters.
2. **Real-time ZTL Proximity Warnings**: Use real-time geolocation coordinates inside the PWA to warn drivers when approaching ZTL zones in cities like Milan or Verona, showing a link to pay the €7.50 fee.
3. **Split Expenses & Group Ledger Tab**: Group travels in Italy require split payments (hotels, dining, ferry tickets). Add a shared ledger inside the app where the 7 users can log expenses, calculate split ratios, and track who owes whom.
4. **Italian Phrasebook & AI Voice Pronunciation**: Build a quick-access audio phrasebook focusing on essential travel Italian (ordering coffee/food, booking ferry, asking directions) translated from Hebrew.
5. **Offline PWA Data Hydration**: Cache critical itinerary details, ferries, and emergency numbers locally so the app works seamlessly at Lake Garda or high-altitude hiking paths without internet connection.
