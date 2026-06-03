import { describe, it, expect } from "vitest";
import { scanForHebrewChrome } from "./noHebrewChrome";

describe("scanForHebrewChrome", () => {
  it("finds no Hebrew in production UI paths (app, components, stores, lib except translations.he catalog)", () => {
    const violations = scanForHebrewChrome(process.cwd());
    expect(violations).toEqual([]);
  });
});
