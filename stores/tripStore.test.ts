import { describe, it, expect, beforeEach } from "vitest";
import { useTripStore } from "./tripStore";

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
    expect(useTripStore.getState().savedAttractions).toHaveLength(1);

    // User 1 (role: user) attempts to delete -> should fail
    useTripStore.getState().removeSavedAttraction("place-garda");
    expect(useTripStore.getState().savedAttractions).toHaveLength(1);
    expect(useTripStore.getState().toast?.type).toBe("error");

    // Switch to User 3 (role: admin) and delete -> should succeed
    useTripStore.getState().setCurrentUser("u3");
    useTripStore.getState().removeSavedAttraction("place-garda");
    expect(useTripStore.getState().savedAttractions).toHaveLength(0);
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

  it("should handle locale changes and reset correctly", () => {
    const store = useTripStore.getState();
    expect(store.locale).toBe("en"); // Default is en
    
    // Set locale to he
    store.setLocale("he");
    expect(useTripStore.getState().locale).toBe("he");
    
    // Reset store resets locale to en
    useTripStore.getState().resetStore();
    expect(useTripStore.getState().locale).toBe("en");
  });
});
