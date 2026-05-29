import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getDistanceMeters, getProgressiveNearbyPlaces } from "./places";

describe("places utilities", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should calculate correct Haversine distance in meters", () => {
    // Distance between Milan Duomo (45.4642, 9.1900) and Milan Cadorna (45.4682, 9.1760)
    const dist = getDistanceMeters(45.4642, 9.1900, 45.4682, 9.1760);
    expect(dist).toBeGreaterThan(1000);
    expect(dist).toBeLessThan(2000);
  });

  it("should scan progressively: 1000m -> 2500m -> 5000m when results are sparse", async () => {
    const fetchedRadii: number[] = [];

    // Mock global fetch to return different amounts of results based on radius in request URL
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      const urlObj = new URL(url);
      const radius = parseInt(urlObj.searchParams.get("radius") || "0", 10);
      fetchedRadii.push(radius);

      let results: { place_id: string; name: string; geometry: { location: { lat: number; lng: number } } }[] = [];
      if (radius === 1000) {
        // Return 1 result (sparse, should trigger retry)
        results = [{ place_id: "p1", name: "Spot 1", geometry: { location: { lat: 45.4, lng: 9.1 } } }];
      } else if (radius === 2500) {
        // Return 2 results (still sparse, should trigger retry)
        results = [
          { place_id: "p1", name: "Spot 1", geometry: { location: { lat: 45.4, lng: 9.1 } } },
          { place_id: "p2", name: "Spot 2", geometry: { location: { lat: 45.4, lng: 9.1 } } }
        ];
      } else if (radius === 5000) {
        // Return 5 results (acceptable)
        results = Array.from({ length: 5 }, (_, i) => ({
          place_id: `p${i}`,
          name: `Spot ${i}`,
          geometry: { location: { lat: 45.4, lng: 9.1 } }
        }));
      }

      return {
        ok: true,
        json: async () => ({ status: "OK", results }),
      } as Response;
    });

    const data = await getProgressiveNearbyPlaces(45.4642, 9.1900, "restaurant", "mock-key", "Pizza");

    // Must query all three radiuses progressively because the first two were sparse
    expect(fetchedRadii).toEqual([1000, 2500, 5000]);
    expect(data.length).toBe(5);
  });

  it("should stop scan early if 1000m has enough results", async () => {
    const fetchedRadii: number[] = [];

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      const urlObj = new URL(url);
      const radius = parseInt(urlObj.searchParams.get("radius") || "0", 10);
      fetchedRadii.push(radius);

      // Return 3 results on 1000m
      const results = Array.from({ length: 3 }, (_, i) => ({
        place_id: `p${i}`,
        name: `Spot ${i}`,
        geometry: { location: { lat: 45.4, lng: 9.1 } }
      }));

      return {
        ok: true,
        json: async () => ({ status: "OK", results }),
      } as Response;
    });

    const data = await getProgressiveNearbyPlaces(45.4642, 9.1900, "restaurant", "mock-key", "Pizza");

    // Must stop at 1000m and not query 2500m or 5000m
    expect(fetchedRadii).toEqual([1000]);
    expect(data.length).toBe(3);
  });
});
