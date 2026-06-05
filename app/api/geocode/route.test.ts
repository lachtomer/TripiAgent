import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

describe("GET /api/geocode", () => {
  const envBackup = process.env.GOOGLE_PLACES_API_KEY;
  const fetchBackup = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_PLACES_API_KEY = "mock-google-key";
  });

  afterEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = envBackup;
    global.fetch = fetchBackup;
  });

  it("returns placeTypes and matchedName on forward geocode", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        status: "OK",
        results: [
          {
            name: "Verona",
            formatted_address: "Verona, VR, Italy",
            types: ["locality", "political"],
            geometry: { location: { lat: 45.4384, lng: 10.9916 } },
          },
        ],
      }),
    } as Response);

    const request = new NextRequest("http://localhost:9001/api/geocode?query=Verona");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toMatchObject({
      lat: 45.4384,
      lng: 10.9916,
      cityName: "Verona",
      placeTypes: ["locality", "political"],
      matchedName: "Verona",
    });
  });

  it("returns amusement_park types for venue forward geocode", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        status: "OK",
        results: [
          {
            name: "Gardaland",
            formatted_address: "Castelnuovo del Garda, VR, Italy",
            types: ["amusement_park", "point_of_interest", "establishment"],
            geometry: { location: { lat: 45.454, lng: 10.7137 } },
          },
        ],
      }),
    } as Response);

    const request = new NextRequest("http://localhost:9001/api/geocode?query=Gardaland");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.placeTypes).toContain("amusement_park");
    expect(data.matchedName).toBe("Gardaland");
    expect(data.cityName).toBe("Gardaland");
  });

  it("returns 404 when forward geocode has zero results", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ status: "ZERO_RESULTS", results: [] }),
    } as Response);

    const request = new NextRequest("http://localhost:9001/api/geocode?query=NowhereXYZ");
    const response = await GET(request);

    expect(response.status).toBe(404);
  });
});
