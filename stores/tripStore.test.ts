import { describe, it, expect, beforeEach } from "vitest";
import { useTripStore } from "./tripStore";
import { LAKE_GARDA_TEEN_TARGET_BANK } from "@/lib/lakeGardaTargetBank";

describe("tripStore Zustand store", () => {
  beforeEach(() => {
    // Reset store before each test
    useTripStore.getState().resetStore();
  });

  it("should switch current user and segregate packing lists", () => {
    const store = useTripStore.getState();
    expect(store.currentUser).toBe("u1");
    expect(store.packingList).toHaveLength(4);

    // Modify User 1 packing list
    store.togglePackingItem("p1");
    expect(useTripStore.getState().packingList.find((i) => i.id === "p1")?.checked).toBe(true);

    // Switch to User 2 (should have initial clean list)
    store.setCurrentUser("u2");
    expect(useTripStore.getState().currentUser).toBe("u2");
    expect(useTripStore.getState().packingList.find((i) => i.id === "p1")?.checked).toBe(false);

    // Switch back to User 1 (should retain checked item)
    useTripStore.getState().setCurrentUser("u1");
    expect(useTripStore.getState().currentUser).toBe("u1");
    expect(useTripStore.getState().packingList.find((i) => i.id === "p1")?.checked).toBe(true);
  });

  it("should add attraction to itinerary with coordinates from target bank", () => {
    const store = useTripStore.getState();
    store.saveAttraction({
      id: "poi-uffizi",
      name: "Uffizi Gallery",
      locationName: "Florence",
      lat: 43.7678,
      lng: 11.2553,
    });
    store.addAttractionToItinerary(2, "poi-uffizi", "14:00");
    const day2 = useTripStore.getState().itinerary?.find((d) => d.dayNumber === 2);
    const added = day2?.activities.find((a) => a.title === "Uffizi Gallery");
    expect(added?.lat).toBe(43.7678);
    expect(added?.lng).toBe(11.2553);
    expect(added?.time).toBe("14:00");
  });

  it("should add place to itinerary via addPlaceToItinerary", () => {
    const store = useTripStore.getState();
    store.addPlaceToItinerary(1, {
      time: "13:00",
      title: "Gelato Shop",
      locationName: "Rome",
      lat: 41.9,
      lng: 12.5,
    });
    const day1 = useTripStore.getState().itinerary?.find((d) => d.dayNumber === 1);
    expect(day1?.activities.some((a) => a.title === "Gelato Shop" && a.lat === 41.9)).toBe(true);
  });

  it("should have custom users initialized and save attractions with creator tag", () => {
    const store = useTripStore.getState();
    expect(store.users).toHaveLength(7);
    expect(store.users[0].name).toBe("Liran");
    expect(store.users[0].role).toBe("admin");
    expect(store.users[6].name).toBe("Tomer");
    expect(store.users[6].role).toBe("admin");

    const mockAttraction = {
      id: "place-verona",
      name: "Juliet's House",
      createdBy: "Tomer",
    };
    store.saveAttraction(mockAttraction);
    const attraction = useTripStore.getState().savedAttractions.find((a) => a.id === "place-verona");
    expect(attraction?.createdBy).toBe("Tomer");
  });

  it("should handle upvotes and downvotes on attractions", () => {
    const store = useTripStore.getState();
    const mockAttraction = {
      id: "place-rome",
      name: "Rome Colosseum",
    };

    store.saveAttraction(mockAttraction);
    let attraction = useTripStore.getState().savedAttractions.find((a) => a.id === "place-rome");
    expect(attraction).toBeDefined();
    expect(attraction?.upvotes).toEqual([]);

    // Vote Up
    useTripStore.getState().voteAttraction("place-rome", "up", "u1");
    attraction = useTripStore.getState().savedAttractions.find((a) => a.id === "place-rome");
    expect(attraction?.upvotes).toEqual(["u1"]);

    // Vote Down (should remove from upvotes and add to downvotes)
    useTripStore.getState().voteAttraction("place-rome", "down", "u1");
    attraction = useTripStore.getState().savedAttractions.find((a) => a.id === "place-rome");
    expect(attraction?.upvotes).toEqual([]);
    expect(attraction?.downvotes).toEqual(["u1"]);
  });

  it("should guard attraction deletion from bank to admins only", () => {
    const store = useTripStore.getState();
    const mockAttraction = {
      id: "place-garda",
      name: "Lake Garda Castle",
    };

    store.saveAttraction(mockAttraction);
    const seededCount = LAKE_GARDA_TEEN_TARGET_BANK.length;
    expect(useTripStore.getState().savedAttractions).toHaveLength(seededCount + 1);

    // Switch to User 2 (Ilanit, role: user) and attempt to delete -> should fail
    useTripStore.getState().setCurrentUser("u2");
    useTripStore.getState().removeSavedAttraction("place-garda");
    expect(useTripStore.getState().savedAttractions).toHaveLength(seededCount + 1);
    expect(useTripStore.getState().toast?.type).toBe("error");

    // Switch to User 7 (Tomer, role: admin) and delete -> should succeed
    useTripStore.getState().setCurrentUser("u7");
    useTripStore.getState().removeSavedAttraction("place-garda");
    expect(useTripStore.getState().savedAttractions).toHaveLength(seededCount);
    expect(useTripStore.getState().toast?.type).toBe("success");
  });

  it("should swap days and anchors with validation checks", () => {
    const store = useTripStore.getState();
    
    // Setup itinerary
    const initialItinerary = [
      {
        dayNumber: 1,
        date: "Monday",
        activities: [
          { id: "a1", time: "10:00", title: "Morning Walk", description: "Walk near hotel" }
        ]
      },
      {
        dayNumber: 2,
        date: "Tuesday",
        activities: [
          { id: "a2", time: "12:00", title: "Lunch at Milan", description: "Pasta in Milan" }
        ]
      }
    ];

    store.setItinerary(initialItinerary);
    store.updateDayAnchor(1, "Rome");
    store.updateDayAnchor(2, "Milan");

    // Swap Days
    useTripStore.getState().swapItineraryDays(1, 2);

    const updated = useTripStore.getState().itinerary;
    expect(updated).not.toBeNull();
    
    const day1 = updated?.find((d) => d.dayNumber === 1);
    const day2 = updated?.find((d) => d.dayNumber === 2);

    // Activities and titles should be swapped
    expect(day1?.activities[0].id).toBe("a2");
    expect(day1?.date).toBe("Tuesday");
    expect(day2?.activities[0].id).toBe("a1");
    expect(day2?.date).toBe("Monday");

    // Anchors should be swapped
    expect(useTripStore.getState().dayAnchors[1]).toBe("Milan");
    expect(useTripStore.getState().dayAnchors[2]).toBe("Rome");
  });

  it("should always have Hebrew locale and keep it after reset", () => {
    const store = useTripStore.getState();
    // Feature 008: locale is always "he"
    expect(store.locale).toBe("he");

    // Reset store preserves "he"
    useTripStore.getState().resetStore();
    expect(useTripStore.getState().locale).toBe("he");
  });
});
