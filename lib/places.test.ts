import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getDistanceMeters,
  getProgressiveNearbyPlaces,
  PLACE_DETAILS_ENRICHMENT_CAP,
  buildGoogleMapsUrl,
} from "./places";

describe("places utilities", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should calculate correct Haversine distance in meters", () => {
    const dist = getDistanceMeters(45.4642, 9.1900, 45.4682, 9.1760);
    expect(dist).toBeGreaterThan(1000);
    expect(dist).toBeLessThan(2000);
  });

  it("should scan progressively: 1000m -> 2500m -> 5000m when results are sparse", async () => {
    const fetchedRadii: number[] = [];

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/place/details/json")) {
        return {
          ok: true,
          json: async () => ({ status: "OK", result: {} }),
        } as Response;
      }

      const urlObj = new URL(url);
      const radius = parseInt(urlObj.searchParams.get("radius") || "0", 10);
      fetchedRadii.push(radius);

      let results: { place_id: string; name: string; geometry: { location: { lat: number; lng: number } } }[] = [];
      if (radius === 1000) {
        results = [{ place_id: "p1", name: "Spot 1", geometry: { location: { lat: 45.4, lng: 9.1 } } }];
      } else if (radius === 2500) {
        results = [
          { place_id: "p1", name: "Spot 1", geometry: { location: { lat: 45.4, lng: 9.1 } } },
          { place_id: "p2", name: "Spot 2", geometry: { location: { lat: 45.4, lng: 9.1 } } },
        ];
      } else if (radius === 5000) {
        results = Array.from({ length: 5 }, (_, i) => ({
          place_id: `p${i}`,
          name: `Spot ${i}`,
          geometry: { location: { lat: 45.4, lng: 9.1 } },
        }));
      }

      return {
        ok: true,
        json: async () => ({ status: "OK", results }),
      } as Response;
    });

    const data = await getProgressiveNearbyPlaces(45.4642, 9.1900, "restaurant", "mock-key", "Pizza");

    expect(fetchedRadii).toEqual([1000, 2500, 5000]);
    expect(data.length).toBe(5);
    expect(data[0].maps_url).toBe(buildGoogleMapsUrl("p0"));
  });

  it("should stop scan early if 1000m has enough results", async () => {
    const fetchedRadii: number[] = [];

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/place/details/json")) {
        return {
          ok: true,
          json: async () => ({ status: "OK", result: {} }),
        } as Response;
      }

      const urlObj = new URL(url);
      const radius = parseInt(urlObj.searchParams.get("radius") || "0", 10);
      fetchedRadii.push(radius);

      const results = Array.from({ length: 3 }, (_, i) => ({
        place_id: `p${i}`,
        name: `Spot ${i}`,
        geometry: { location: { lat: 45.4, lng: 9.1 } },
      }));

      return {
        ok: true,
        json: async () => ({ status: "OK", results }),
      } as Response;
    });

    const data = await getProgressiveNearbyPlaces(45.4642, 9.1900, "restaurant", "mock-key", "Pizza");

    expect(fetchedRadii).toEqual([1000]);
    expect(data.length).toBe(3);
  });

  it("should attach website_url from Place Details when available", async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/place/details/json")) {
        const placeId = new URL(url).searchParams.get("place_id") ?? "";
        const website =
          placeId === "p0" ? "https://osteria.example/menu" : undefined;
        return {
          ok: true,
          json: async () => ({
            status: "OK",
            result: website
              ? { website, url: "https://maps.google.com/?cid=123" }
              : {},
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({
          status: "OK",
          results: [{ place_id: "p0", name: "Osteria", geometry: { location: { lat: 45.4, lng: 9.1 } } }],
        }),
      } as Response;
    });

    const data = await getProgressiveNearbyPlaces(45.4642, 9.1900, "restaurant", "mock-key");

    expect(data[0].website_url).toBe("https://osteria.example/menu");
    expect(data[0].maps_url).toBe("https://maps.google.com/?cid=123");
  });

  it("should strip unsafe website URLs from Place Details", async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/place/details/json")) {
        return {
          ok: true,
          json: async () => ({
            status: "OK",
            result: { website: "javascript:alert(1)" },
          }),
        } as Response;
      }

      return {
        ok: true,
        json: async () => ({
          status: "OK",
          results: [
            { place_id: "p0", name: "Cafe", geometry: { location: { lat: 45.4, lng: 9.1 } } },
            { place_id: "p1", name: "Bar", geometry: { location: { lat: 45.4, lng: 9.1 } } },
            { place_id: "p2", name: "Bistro", geometry: { location: { lat: 45.4, lng: 9.1 } } },
          ],
        }),
      } as Response;
    });

    const data = await getProgressiveNearbyPlaces(45.4642, 9.1900, "restaurant", "mock-key");

    expect(data[0].website_url).toBeUndefined();
    expect(data[0].maps_url).toBe(buildGoogleMapsUrl("p0"));
  });

  it(`should cap Place Details enrichment at ${PLACE_DETAILS_ENRICHMENT_CAP} calls`, async () => {
    const detailsCalls: string[] = [];

    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/place/details/json")) {
        const placeId = new URL(url).searchParams.get("place_id") ?? "";
        detailsCalls.push(placeId);
        return {
          ok: true,
          json: async () => ({ status: "OK", result: {} }),
        } as Response;
      }

      const results = Array.from({ length: 20 }, (_, i) => ({
        place_id: `place-${i}`,
        name: `Spot ${i}`,
        geometry: { location: { lat: 45.4, lng: 9.1 } },
      }));

      return {
        ok: true,
        json: async () => ({ status: "OK", results }),
      } as Response;
    });

    const data = await getProgressiveNearbyPlaces(45.4642, 9.1900, "restaurant", "mock-key");

    expect(data.length).toBe(20);
    expect(detailsCalls.length).toBe(PLACE_DETAILS_ENRICHMENT_CAP);
    expect(data[8].website_url).toBeUndefined();
    expect(data[8].maps_url).toBe(buildGoogleMapsUrl("place-8"));
    expect(data[19].maps_url).toBe(buildGoogleMapsUrl("place-19"));
  });
});
