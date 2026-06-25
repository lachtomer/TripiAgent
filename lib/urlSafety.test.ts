import { describe, it, expect } from "vitest";
import {
  isSafeExternalUrl,
  resolvePlaceHref,
  placeTestIdSlug,
  resolveSavedAttractionLinks,
  buildActivityLocationMapsUrl,
} from "./urlSafety";

describe("urlSafety", () => {
  it("allows http and https URLs", () => {
    expect(isSafeExternalUrl("https://example.com/menu")).toBe(true);
    expect(isSafeExternalUrl("http://example.com")).toBe(true);
  });

  it("rejects javascript and data URLs", () => {
    expect(isSafeExternalUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeExternalUrl("data:text/html,hello")).toBe(false);
  });

  it("resolvePlaceHref prefers website over maps", () => {
    expect(
      resolvePlaceHref("https://osteria.example", "https://maps.google.com/x")
    ).toBe("https://osteria.example");
  });

  it("resolvePlaceHref falls back to maps when website missing or unsafe", () => {
    expect(resolvePlaceHref(undefined, "https://maps.google.com/x")).toBe(
      "https://maps.google.com/x"
    );
    expect(resolvePlaceHref("javascript:alert(1)", "https://maps.google.com/x")).toBe(
      "https://maps.google.com/x"
    );
  });

  it("resolvePlaceHref returns null when no safe URL", () => {
    expect(resolvePlaceHref(undefined, undefined)).toBe(null);
    expect(resolvePlaceHref("javascript:x", "data:x")).toBe(null);
  });

  it("placeTestIdSlug sanitizes awkward place_id characters", () => {
    expect(placeTestIdSlug("ChIJ+abc/def")).toBe("ChIJ_abc_def");
  });

  it("resolveSavedAttractionLinks uses coords for Target Bank entries", () => {
    const links = resolveSavedAttractionLinks({
      id: "bank-gardaland",
      name: "Gardaland",
      locationName: "Castelnuovo del Garda",
      lat: 45.4542,
      lng: 10.7137,
    });
    expect(links.mapsUrl).toBe(
      "https://www.google.com/maps/search/?api=1&query=45.4542,10.7137"
    );
    expect(resolvePlaceHref(links.websiteUrl, links.mapsUrl)).toContain("google.com/maps");
  });

  it("resolveSavedAttractionLinks uses place_id for bookmarked Google places", () => {
    const links = resolveSavedAttractionLinks({
      id: "ChIJmock123",
      name: "Colosseum",
      locationName: "Rome",
    });
    expect(links.mapsUrl).toContain("query_place_id=ChIJmock123");
  });

  it("resolveSavedAttractionLinks uses name search for custom POIs without coords", () => {
    const links = resolveSavedAttractionLinks({
      id: "custom-poi-abc",
      name: "Limone Ferry Port",
      locationName: "Limone",
    });
    expect(links.mapsUrl).toContain("query=Limone%20Ferry%20Port%2C%20Limone");
  });

  it("buildActivityLocationMapsUrl encodes location name for Google Maps search", () => {
    expect(buildActivityLocationMapsUrl("Verona")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Verona"
    );
    expect(buildActivityLocationMapsUrl("Monzambano, Lake Garda")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Monzambano%2C%20Lake%20Garda"
    );
  });

  it("buildActivityLocationMapsUrl returns null for empty input", () => {
    expect(buildActivityLocationMapsUrl("")).toBe(null);
    expect(buildActivityLocationMapsUrl("   ")).toBe(null);
  });

  it("resolveSavedAttractionLinks preserves explicit URLs when present", () => {
    const links = resolveSavedAttractionLinks({
      id: "place-1",
      name: "Test",
      maps_url: "https://maps.google.com/explicit",
    });
    expect(links.mapsUrl).toBe("https://maps.google.com/explicit");
  });
});
