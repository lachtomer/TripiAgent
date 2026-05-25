import { describe, it, expect } from "vitest";
import { checkMilanZTL } from "./ztl";

describe("Milan ZTL (Area C) Validator", () => {
  it("should detect active hours on a weekday (Monday 09:30)", () => {
    const result = checkMilanZTL("09:30", "2026-06-29"); // Monday
    expect(result.active).toBe(true);
    expect(result.costEuro).toBe(7.50);
    expect(result.message).toContain("ZTL (Area C) is active");
  });

  it("should detect inactive early hours on a weekday (Monday 06:15)", () => {
    const result = checkMilanZTL("06:15", "2026-06-29");
    expect(result.active).toBe(false);
    expect(result.costEuro).toBe(0);
    expect(result.message).toContain("ZTL (Area C) is inactive");
  });

  it("should detect inactive late hours on a weekday (Friday 20:00)", () => {
    const result = checkMilanZTL("20:00", "2026-06-26"); // Friday
    expect(result.active).toBe(false);
    expect(result.costEuro).toBe(0);
    expect(result.message).toContain("inactive outside active hours");
  });

  it("should detect inactive weekends (Saturday 12:00)", () => {
    const result = checkMilanZTL("12:00", "2026-06-27"); // Saturday
    expect(result.active).toBe(false);
    expect(result.costEuro).toBe(0);
    expect(result.message).toContain("inactive on weekends");
  });

  it("should detect inactive weekends (Sunday 15:00)", () => {
    const result = checkMilanZTL("15:00", "2026-06-28"); // Sunday
    expect(result.active).toBe(false);
    expect(result.costEuro).toBe(0);
    expect(result.message).toContain("inactive on weekends");
  });

  it("should fall back to safe-mode (active) for invalid date format", () => {
    const result = checkMilanZTL("12:00", "invalid-date-string");
    expect(result.active).toBe(true);
    expect(result.costEuro).toBe(7.50);
    expect(result.message).toContain("Invalid date format");
  });

  it("should fall back to safe-mode (active) for invalid time format", () => {
    const result = checkMilanZTL("not-a-time", "2026-06-29");
    expect(result.active).toBe(true);
    expect(result.costEuro).toBe(7.50);
    expect(result.message).toContain("Invalid time format");
  });
});
