import { create } from "zustand";
import { DEFAULT_ITALY_ITINERARY } from "@/components/ItineraryCard";
import { persist, createJSONStorage } from "zustand/middleware";
import { Activity, ChatMessage, ItineraryDay, LocationDetails, PackingItem, SavedAttraction, TravelLogistics, MorningBriefing, SerendipitySuggestion, UserProfile } from "@/types";
import { isBankAdminUser } from "@/lib/bankPermissions";
import { LAKE_GARDA_TEEN_TARGET_BANK } from "@/lib/lakeGardaTargetBank";
import {
  ITINERARY_TEMPLATE_VERSION,
  isPersistedItineraryStale,
} from "@/lib/itineraryTemplate";
import { DEFAULT_ACCOMMODATION_BOOKING } from "@/lib/defaultAccommodationBooking";

interface TripState {
  location: LocationDetails | null;
  chatMessages: ChatMessage[];
  itinerary: ItineraryDay[] | null;
  packingList: PackingItem[];
  pendingPrompt: string | null;
  unreadChat: boolean;
  tripStartDate: string | null;
  savedAttractions: SavedAttraction[];
  logistics: TravelLogistics;
  isPlanning: boolean;
  toast: { message: string; type: "success" | "error" | "info" } | null;
  morningBriefing: MorningBriefing | null;
  serendipitySuggestion: SerendipitySuggestion | null;
  completedActivityIds: string[];
  
  // User/mode fields
  users: UserProfile[];
  currentUser: string;
  userPackingLists: Record<string, PackingItem[]>;
  tripMode: "planning" | "in-trip";
  dayAnchors: Record<number, string>;

  // Common packing (group-wide) + per-user checkmarks on common items
  commonPackingList: PackingItem[];
  commonCheckmarks: Record<string, string[]>; // userId → checked item IDs

  setLocation: (location: LocationDetails) => void;
  setManualCity: (city: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  updateChatMessageText: (id: string, text: string) => void;
  clearChat: () => void;
  setItinerary: (itinerary: ItineraryDay[] | null) => void;
  setPackingList: (list: PackingItem[]) => void;
  togglePackingItem: (id: string) => void;
  setPendingPrompt: (prompt: string) => void;
  clearPendingPrompt: () => void;
  setUnreadChat: (val: boolean) => void;
  setTripStartDate: (date: string | null) => void;
  updateDayTitle: (dayNumber: number, title: string) => void;
  addActivity: (dayNumber: number, activity: Omit<Activity, "id">) => void;
  updateActivity: (dayNumber: number, activityId: string, updated: Partial<Omit<Activity, "id">>) => void;
  deleteActivity: (dayNumber: number, activityId: string) => void;
  replaceDayPlan: (dayNumber: number, activities: Activity[]) => void;
  saveAttraction: (attraction: SavedAttraction) => void;
  removeSavedAttraction: (id: string) => void;
  addAttractionToItinerary: (dayNumber: number, attractionId: string, time: string) => void;
  addPlaceToItinerary: (
    dayNumber: number,
    place: {
      time: string;
      title: string;
      description?: string;
      locationName?: string;
      lat?: number;
      lng?: number;
    }
  ) => void;
  updateLogistics: (updated: Partial<TravelLogistics>) => void;
  setIsPlanning: (val: boolean) => void;
  setToast: (toast: { message: string; type: "success" | "error" | "info" } | null) => void;
  setMorningBriefing: (briefing: MorningBriefing | null) => void;
  setSerendipitySuggestion: (suggestion: SerendipitySuggestion | null) => void;
  toggleActivityCompletion: (activityId: string) => void;
  resetStore: () => void;

  // New action methods
  setCurrentUser: (userId: string) => void;
  toggleTripMode: () => void;
  updateDayAnchor: (dayNumber: number, anchor: string) => void;
  voteAttraction: (attractionId: string, vote: "up" | "down" | null, userId: string) => void;
  swapItineraryDays: (dayA: number, dayB: number) => void;
  locale: "en";
  itineraryTemplateVersion: number;

  // Common packing actions
  addCommonPackingItem: (item: Omit<PackingItem, "id">) => void;
  removeCommonPackingItem: (id: string) => void;
  toggleCommonCheckmark: (itemId: string) => void;

  // Bookmark from search — bypasses admin check, sets toast internally
  toggleSearchBookmark: (place: SavedAttraction) => void;
}

const initialPackingList: PackingItem[] = [
  { id: "p1", name: "Passport & Documents", checked: false, category: "Essentials" },
  { id: "p2", name: "Italian Power Adapter", checked: false, category: "Electronics" },
  { id: "p3", name: "Comfortable Walking Shoes", checked: false, category: "Clothing" },
  { id: "p4", name: "Reusable Water Bottle", checked: false, category: "Essentials" },
];

const initialUsers: UserProfile[] = [
  { id: "u1", name: "Liran", role: "admin" },
  { id: "u2", name: "Ilanit", role: "user" },
  { id: "u3", name: "Yoav", role: "user" },
  { id: "u4", name: "Maya", role: "user" },
  { id: "u5", name: "Noam", role: "user" },
  { id: "u6", name: "Mor", role: "user" },
  { id: "u7", name: "Tomer", role: "admin" },
];

const initialLogistics: TravelLogistics = {
  flightConfirmationCode: "PQGFPN",
  carRentalVoucherCode: "",
  accommodationName: DEFAULT_ACCOMMODATION_BOOKING.name,
  vrboConfirmationCode: DEFAULT_ACCOMMODATION_BOOKING.vrboConfirmationCode,
  vrboPropertyId: DEFAULT_ACCOMMODATION_BOOKING.vrboPropertyId,
  accommodationBalanceDue: DEFAULT_ACCOMMODATION_BOOKING.balanceDueEuro,
};

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      location: null,
      chatMessages: [],
      itinerary: null,
      packingList: initialPackingList,
      pendingPrompt: null,
      unreadChat: false,
      tripStartDate: "2026-06-25",
      savedAttractions: LAKE_GARDA_TEEN_TARGET_BANK,
      logistics: initialLogistics,
      isPlanning: false,
      toast: null,
      morningBriefing: null,
      serendipitySuggestion: null,
      completedActivityIds: [],
      
      // New user/mode fields initialization
      users: initialUsers,
      currentUser: "u1",
      userPackingLists: {
        u1: initialPackingList,
        u2: initialPackingList,
        u3: initialPackingList,
        u4: initialPackingList,
        u5: initialPackingList,
        u6: initialPackingList,
        u7: initialPackingList,
      },
      tripMode: "planning",
      dayAnchors: {},
      locale: "en" as const,
      itineraryTemplateVersion: ITINERARY_TEMPLATE_VERSION,

      // Common packing fields
      commonPackingList: initialPackingList,
      commonCheckmarks: {},
      
      setLocation: (location) => set({ location }),
      setManualCity: (cityName) =>
         set({
          location: {
            coords: null,
            cityName,
            permissionState: "denied",
          },
        }),
      addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
      updateChatMessageText: (id, text) =>
        set((state) => ({
          chatMessages: state.chatMessages.map((msg) =>
            msg.id === id ? { ...msg, text: msg.text + text } : msg
          ),
        })),
      clearChat: () => set({ chatMessages: [] }),
      setItinerary: (itinerary) => set({ itinerary }),
      setPackingList: (packingList) =>
        set((state) => ({
          packingList,
          userPackingLists: {
            ...state.userPackingLists,
            [state.currentUser]: packingList,
          },
        })),
      togglePackingItem: (id) =>
        set((state) => {
          const nextList = state.packingList.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          );
          return {
            packingList: nextList,
            userPackingLists: {
              ...state.userPackingLists,
              [state.currentUser]: nextList,
            },
          };
        }),
      setPendingPrompt: (prompt) => set({ pendingPrompt: prompt }),
      clearPendingPrompt: () => set({ pendingPrompt: null }),
      setUnreadChat: (val) => set({ unreadChat: val }),
      setTripStartDate: (date) => set({ tripStartDate: date }),
      updateDayTitle: (dayNumber, title) =>
        set((state) => ({
          itinerary: state.itinerary
            ? state.itinerary.map((day) =>
                day.dayNumber === dayNumber ? { ...day, date: title } : day
              )
            : null,
        })),
      addActivity: (dayNumber, activity) =>
        set((state) => ({
          itinerary: state.itinerary
            ? state.itinerary.map((day) =>
                day.dayNumber === dayNumber
                  ? {
                      ...day,
                      activities: [
                        ...day.activities,
                        { ...activity, id: crypto.randomUUID() },
                      ],
                    }
                  : day
              )
            : null,
        })),
      updateActivity: (dayNumber, activityId, updated) =>
        set((state) => ({
          itinerary: state.itinerary
            ? state.itinerary.map((day) =>
                day.dayNumber === dayNumber
                  ? {
                      ...day,
                      activities: day.activities.map((act) =>
                        act.id === activityId ? { ...act, ...updated } : act
                      ),
                    }
                  : day
              )
            : null,
        })),
      deleteActivity: (dayNumber, activityId) =>
        set((state) => ({
          itinerary: state.itinerary
            ? state.itinerary.map((day) =>
                day.dayNumber === dayNumber
                  ? {
                      ...day,
                      activities: day.activities.filter((act) => act.id !== activityId),
                    }
                  : day
              )
            : null,
        })),
      replaceDayPlan: (dayNumber, activities) =>
        set((state) => ({
          itinerary: state.itinerary
            ? state.itinerary.map((day) =>
                day.dayNumber === dayNumber
                  ? {
                      ...day,
                      activities,
                    }
                  : day
              )
            : null,
        })),
      saveAttraction: (attraction) =>
        set((state) => {
          if (state.savedAttractions.some((a) => a.id === attraction.id)) return {};
          return {
            savedAttractions: [
              ...state.savedAttractions,
              { ...attraction, upvotes: attraction.upvotes || [], downvotes: attraction.downvotes || [] }
            ]
          };
        }),
      removeSavedAttraction: (id) =>
        set((state) => {
          const user = state.users.find((u) => u.id === state.currentUser);
          if (!isBankAdminUser(user)) {
            return {
              toast: { message: "Only admins can remove items from the target bank", type: "error" }
            };
          }
          return {
            savedAttractions: state.savedAttractions.filter((a) => a.id !== id),
            toast: { message: "Attraction removed from target bank", type: "success" }
          };
        }),
      addAttractionToItinerary: (dayNumber, attractionId, time) =>
        set((state) => {
          const attraction = state.savedAttractions.find((a) => a.id === attractionId);
          if (!attraction) return {};
          const baseItinerary = state.itinerary ?? DEFAULT_ITALY_ITINERARY;
          return {
            itinerary: baseItinerary.map((day) =>
              day.dayNumber === dayNumber
                ? {
                    ...day,
                    activities: [
                      ...day.activities,
                      {
                        id: crypto.randomUUID(),
                        time,
                        title: attraction.name,
                        description: attraction.description || `Visit ${attraction.name}`,
                        locationName: attraction.locationName ?? attraction.name,
                        lat: attraction.lat,
                        lng: attraction.lng,
                        sourceAttractionId: attractionId,
                      },
                    ],
                  }
                : day
            ),
          };
        }),
      addPlaceToItinerary: (dayNumber, place) =>
        set((state) => {
          const baseItinerary = state.itinerary ?? DEFAULT_ITALY_ITINERARY;
          return {
            itinerary: baseItinerary.map((day) =>
              day.dayNumber === dayNumber
                ? {
                    ...day,
                    activities: [
                      ...day.activities,
                      {
                        id: crypto.randomUUID(),
                        time: place.time,
                        title: place.title,
                        description: place.description || `Visit ${place.title}`,
                        locationName: place.locationName ?? place.title,
                        lat: place.lat,
                        lng: place.lng,
                      },
                    ],
                  }
                : day
            ),
          };
        }),
      updateLogistics: (updated) =>
        set((state) => ({
          logistics: { ...state.logistics, ...updated },
        })),
      setIsPlanning: (val) => set({ isPlanning: val }),
      setToast: (toast) => set({ toast }),
      setMorningBriefing: (briefing) => set({ morningBriefing: briefing }),
      setSerendipitySuggestion: (suggestion) => set({ serendipitySuggestion: suggestion }),
      toggleActivityCompletion: (activityId) =>
        set((state) => ({
          completedActivityIds: state.completedActivityIds.includes(activityId)
            ? state.completedActivityIds.filter((id) => id !== activityId)
            : [...state.completedActivityIds, activityId],
        })),
      resetStore: () =>
        set({
          location: null,
          chatMessages: [],
          itinerary: null,
          packingList: initialPackingList,
          pendingPrompt: null,
          unreadChat: false,
          tripStartDate: "2026-06-25",
          savedAttractions: LAKE_GARDA_TEEN_TARGET_BANK,
          logistics: initialLogistics,
          isPlanning: false,
          toast: null,
          morningBriefing: null,
          serendipitySuggestion: null,
          completedActivityIds: [],
          currentUser: "u1",
          userPackingLists: {
            u1: initialPackingList,
            u2: initialPackingList,
            u3: initialPackingList,
            u4: initialPackingList,
            u5: initialPackingList,
            u6: initialPackingList,
            u7: initialPackingList,
          },
          tripMode: "planning",
          dayAnchors: {},
          locale: "en" as const,
          itineraryTemplateVersion: ITINERARY_TEMPLATE_VERSION,
        }),

      // New actions implementations
      setCurrentUser: (userId) =>
        set((state) => {
          const updatedPackingLists = {
            ...state.userPackingLists,
            [state.currentUser]: state.packingList,
          };
          const nextPackingList = updatedPackingLists[userId] || initialPackingList;
          return {
            currentUser: userId,
            userPackingLists: updatedPackingLists,
            packingList: nextPackingList,
          };
        }),
      toggleTripMode: () =>
        set((state) => ({
          tripMode: state.tripMode === "planning" ? "in-trip" : "planning",
        })),
      updateDayAnchor: (dayNumber, anchor) =>
        set((state) => ({
          dayAnchors: {
            ...state.dayAnchors,
            [dayNumber]: anchor,
          },
        })),
      voteAttraction: (attractionId, vote, userId) =>
        set((state) => ({
          savedAttractions: state.savedAttractions.map((a) => {
            if (a.id !== attractionId) return a;
            const upvotes = (a.upvotes || []).filter((id) => id !== userId);
            const downvotes = (a.downvotes || []).filter((id) => id !== userId);
            if (vote === "up") {
              upvotes.push(userId);
            } else if (vote === "down") {
              downvotes.push(userId);
            }
            return { ...a, upvotes, downvotes };
          }),
        })),
      swapItineraryDays: (dayNumberA, dayNumberB) =>
        set((state) => {
          if (!state.itinerary) return {};
          const dayA = state.itinerary.find((d) => d.dayNumber === dayNumberA);
          const dayB = state.itinerary.find((d) => d.dayNumber === dayNumberB);
          if (!dayA || !dayB) return {};

          const newItinerary = state.itinerary.map((d) => {
            if (d.dayNumber === dayNumberA) {
              return { ...d, date: dayB.date, activities: dayB.activities };
            }
            if (d.dayNumber === dayNumberB) {
              return { ...d, date: dayA.date, activities: dayA.activities };
            }
            return d;
          });

          const nextDayAnchors = { ...state.dayAnchors };
          const anchorA = nextDayAnchors[dayNumberA] || "";
          const anchorB = nextDayAnchors[dayNumberB] || "";
          nextDayAnchors[dayNumberA] = anchorB;
          nextDayAnchors[dayNumberB] = anchorA;

          return {
            itinerary: newItinerary,
            dayAnchors: nextDayAnchors,
            toast: { message: `Swapped Day ${dayNumberA} and Day ${dayNumberB} successfully`, type: "success" },
          };
        }),
      // Common packing actions
      addCommonPackingItem: (item) =>
        set((state) => ({
          commonPackingList: [
            ...state.commonPackingList,
            { ...item, id: `common-${Date.now()}` },
          ],
        })),
      removeCommonPackingItem: (id) =>
        set((state) => ({
          commonPackingList: state.commonPackingList.filter((i) => i.id !== id),
        })),
      toggleCommonCheckmark: (itemId) =>
        set((state) => {
          const uid = state.currentUser;
          const current = state.commonCheckmarks[uid] ?? [];
          const next = current.includes(itemId)
            ? current.filter((id) => id !== itemId)
            : [...current, itemId];
          return {
            commonCheckmarks: {
              ...state.commonCheckmarks,
              [uid]: next,
            },
          };
        }),

      // Bookmark from search results — no admin check, toast set internally
      toggleSearchBookmark: (place) =>
        set((state) => {
          const exists = state.savedAttractions.some((a) => a.id === place.id);
          if (exists) {
            return {
              savedAttractions: state.savedAttractions.filter((a) => a.id !== place.id),
              toast: { message: "Removed from Locations", type: "info" as const },
            };
          }
          return {
            savedAttractions: [
              ...state.savedAttractions,
              { ...place, upvotes: place.upvotes ?? [], downvotes: place.downvotes ?? [] },
            ],
            toast: { message: "Saved to Locations ✓", type: "success" as const },
          };
        }),
    }),
    {
      name: "tripiagent-trip-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Self-healing migration for existing dev/production client local storage databases
          const needsUserUpgrade = !state.users || 
            state.users.length !== 7 || 
            state.users[0].name.startsWith("User") ||
            state.users[0].name === "User 1";

          if (needsUserUpgrade) {
            state.users = initialUsers;
            state.currentUser = "u1";
            state.userPackingLists = {
              u1: state.userPackingLists?.u1 || initialPackingList,
              u2: state.userPackingLists?.u2 || initialPackingList,
              u3: state.userPackingLists?.u3 || initialPackingList,
              u4: state.userPackingLists?.u4 || initialPackingList,
              u5: state.userPackingLists?.u5 || initialPackingList,
              u6: state.userPackingLists?.u6 || initialPackingList,
              u7: state.userPackingLists?.u7 || initialPackingList,
            };
            state.packingList = state.userPackingLists["u1"];
          }

          // One-time migration: seed commonPackingList and deduplicate personal lists
          if (!state.commonPackingList) {
            state.commonPackingList = initialPackingList;
            const commonIds = new Set(initialPackingList.map((i) => i.id));
            for (const uid of Object.keys(state.userPackingLists ?? {})) {
              state.userPackingLists[uid] = (state.userPackingLists[uid] ?? []).filter(
                (i) => !commonIds.has(i.id)
              );
            }
            state.packingList = (state.packingList ?? []).filter(
              (i) => !commonIds.has(i.id)
            );
          }
          if (!state.commonCheckmarks) {
            state.commonCheckmarks = {};
          }

          // Refresh default itinerary only when template version changes
          const needsItineraryRefresh =
            state.itineraryTemplateVersion !== ITINERARY_TEMPLATE_VERSION;

          if (needsItineraryRefresh) {
            state.itineraryTemplateVersion = ITINERARY_TEMPLATE_VERSION;
            if (!state.itinerary || isPersistedItineraryStale(state.itinerary)) {
              state.itinerary = null;
              state.savedAttractions = LAKE_GARDA_TEEN_TARGET_BANK;
            }
          }

          // Migrate legacy logistics fields → booking-only shape
          const legacy = state.logistics as TravelLogistics & {
            flightTlvMxpCode?: string;
            flightMxpTlvCode?: string;
          };
          if (!legacy.flightConfirmationCode) {
            legacy.flightConfirmationCode =
              legacy.flightTlvMxpCode ||
              legacy.flightMxpTlvCode ||
              initialLogistics.flightConfirmationCode;
          }
          state.logistics = {
            flightConfirmationCode: legacy.flightConfirmationCode,
            carRentalVoucherCode: legacy.carRentalVoucherCode ?? "",
            accommodationName:
              legacy.accommodationName ?? initialLogistics.accommodationName,
            vrboConfirmationCode:
              legacy.vrboConfirmationCode ?? initialLogistics.vrboConfirmationCode,
            vrboPropertyId:
              legacy.vrboPropertyId ?? initialLogistics.vrboPropertyId,
            accommodationBalanceDue:
              legacy.accommodationBalanceDue ?? initialLogistics.accommodationBalanceDue,
          };

          // Auto in-trip once trip start date is reached
          if (state.tripStartDate && state.tripMode === "planning") {
            const today = new Date().toISOString().slice(0, 10);
            if (today >= state.tripStartDate) {
              state.tripMode = "in-trip";
            }
          }

          // Feature 009: pin locale to "en" — coerce any legacy "he" value
          if ((state.locale as string) !== "en") {
            state.locale = "en";
          }
        }
      },
    }
  )
);
