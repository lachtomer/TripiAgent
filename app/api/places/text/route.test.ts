import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import { searchPlacesByText } from "@/lib/places";
import { PlacesResponseSchema } from "@/lib/schemas";

vi.mock("@/lib/places", async () => {
  const actual = await vi.importActual<typeof import("@/lib/places")>("@/lib/places");
  return {
    ...actual,
    searchPlacesByText: vi.fn(),
  };
});

describe("GET /api/places/text", () => {
  const envBackup = process.env.GOOGLE_PLACES_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GOOGLE_PLACES_API_KEY = "mock-google-key";
  });

  afterEach(() => {
    process.env.GOOGLE_PLACES_API_KEY = envBackup;
  });

  it("returns places for a valid name query", async () => {
    const mockPlaces = [
      {
        place_id: "gardaland-1",
        name: "Gardaland",
        rating: 4.6,
        maps_url: "https://www.google.com/maps/search/?api=1&query_place_id=gardaland-1",
      },
    ];
    vi.mocked(searchPlacesByText).mockResolvedValue(mockPlaces);

    const request = new NextRequest(
      "http://localhost:9001/api/places/text?q=Gardaland&lat=45.44&lng=10.71&type=tourist_attraction&radius=50000"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(mockPlaces);
    expect(PlacesResponseSchema.safeParse(data).success).toBe(true);
    expect(searchPlacesByText).toHaveBeenCalledWith(
      "Gardaland",
      45.44,
      10.71,
      "tourist_attraction",
      "mock-google-key",
      50000
    );
  });

  it("returns 400 when q is too short", async () => {
    const request = new NextRequest(
      "http://localhost:9001/api/places/text?q=ab&lat=45.44&lng=10.71"
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid query parameters format");
  });

  it("returns 404 when no places match after widen", async () => {
    vi.mocked(searchPlacesByText).mockResolvedValue([]);

    const request = new NextRequest(
      "http://localhost:9001/api/places/text?q=ZZZNoSuchPlace&lat=45.44&lng=10.71"
    );
    const response = await GET(request);

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("No places found for this name");
  });

  it("returns 400 when required params are missing", async () => {
    const request = new NextRequest(
      "http://localhost:9001/api/places/text?q=Gardaland&lat=45.44"
    );
    const response = await GET(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Missing q, lat, or lng parameter");
  });

  it("returns 500 when API key is missing", async () => {
    delete process.env.GOOGLE_PLACES_API_KEY;

    const request = new NextRequest(
      "http://localhost:9001/api/places/text?q=Gardaland&lat=45.44&lng=10.71"
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Server API configuration missing");
  });
});
