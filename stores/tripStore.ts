import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Activity, ChatMessage, ItineraryDay, LocationDetails, PackingItem, SavedAttraction, TravelLogistics, MorningBriefing, SerendipitySuggestion, UserProfile } from "@/types";

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
  
  // New user/mode fields
  users: UserProfile[];
  currentUser: string;
  userPackingLists: Record<string, PackingItem[]>;
  tripMode: "planning" | "in-trip";
  dayAnchors: Record<number, string>;

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
  locale: "en" | "he";
  setLocale: (locale: "en" | "he") => void;
}

const initialPackingList: PackingItem[] = [
  { id: "p1", name: "Passport & Documents", checked: false, category: "Essentials" },
  { id: "p2", name: "Italian Power Adapter", checked: false, category: "Electronics" },
  { id: "p3", name: "Comfortable Walking Shoes", checked: false, category: "Clothing" },
  { id: "p4", name: "Reusable Water Bottle", checked: false, category: "Essentials" },
];

const initialUsers: UserProfile[] = [
  { id: "u1", name: "User 1", role: "user" },
  { id: "u2", name: "User 2", role: "user" },
  { id: "u3", name: "User 3", role: "admin" },
];

const initialLogistics: TravelLogistics = {
  flightTlvMxpCode: "",
  flightMxpTlvCode: "",
  carRentalVoucherCode: "",
  villaEuniceLockboxCode: "",
  milanZtlPaid: false,
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
      savedAttractions: [],
      logistics: initialLogistics,
      isPlanning: false,
      toast: null,
      morningBriefing: null,
      serendipitySuggestion: null,
      completedActivityIds: [],
      
      // New user/mode fields initialization
      users: initialUsers,
      currentUser: "u1",
      userPackingLists: { u1: initialPackingList },
      tripMode: "planning",
      dayAnchors: {},
      locale: "en",
      
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
          if (user?.role !== "admin") {
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
          if (!attraction || !state.itinerary) return {};
          return {
            itinerary: state.itinerary.map((day) =>
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
                        locationName: attraction.locationName,
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
          savedAttractions: [],
          logistics: initialLogistics,
          isPlanning: false,
          toast: null,
          morningBriefing: null,
          serendipitySuggestion: null,
          completedActivityIds: [],
          currentUser: "u1",
          userPackingLists: { u1: initialPackingList },
          tripMode: "planning",
          dayAnchors: {},
          locale: "en",
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
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: "tripiagent-trip-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
