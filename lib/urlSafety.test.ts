import { describe, it, expect } from "vitest";
import { isSafeExternalUrl, resolvePlaceHref, placeTestIdSlug } from "./urlSafety";

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
});
