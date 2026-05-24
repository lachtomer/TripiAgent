import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Activity, ChatMessage, ItineraryDay, LocationDetails, PackingItem, SavedAttraction, TravelLogistics } from "@/types";

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
  saveAttraction: (attraction: SavedAttraction) => void;
  removeSavedAttraction: (id: string) => void;
  addAttractionToItinerary: (dayNumber: number, attractionId: string, time: string) => void;
  updateLogistics: (updated: Partial<TravelLogistics>) => void;
  resetStore: () => void;
}

const initialPackingList: PackingItem[] = [
  { id: "p1", name: "Passport & Documents", checked: false, category: "Essentials" },
  { id: "p2", name: "Italian Power Adapter", checked: false, category: "Electronics" },
  { id: "p3", name: "Comfortable Walking Shoes", checked: false, category: "Clothing" },
  { id: "p4", name: "Reusable Water Bottle", checked: false, category: "Essentials" },
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
      setPackingList: (packingList) => set({ packingList }),
      togglePackingItem: (id) =>
        set((state) => ({
          packingList: state.packingList.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
          ),
        })),
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
      saveAttraction: (attraction) =>
        set((state) => {
          if (state.savedAttractions.some((a) => a.id === attraction.id)) return {};
          return { savedAttractions: [...state.savedAttractions, attraction] };
        }),
      removeSavedAttraction: (id) =>
        set((state) => ({
          savedAttractions: state.savedAttractions.filter((a) => a.id !== id),
        })),
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
        }),
    }),
    {
      name: "tripiagent-trip-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
