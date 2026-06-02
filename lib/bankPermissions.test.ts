import { describe, it, expect } from "vitest";
import { BANK_ADMIN_NAMES, isBankAdminName, isBankAdminUser } from "./bankPermissions";

describe("bankPermissions", () => {
  it("lists Liran and Tomer as bank admins", () => {
    expect(BANK_ADMIN_NAMES).toEqual(["Liran", "Tomer"]);
  });

  it("isBankAdminName accepts admin display names only", () => {
    expect(isBankAdminName("Liran")).toBe(true);
    expect(isBankAdminName("Tomer")).toBe(true);
    expect(isBankAdminName("Ilanit")).toBe(false);
    expect(isBankAdminName("")).toBe(false);
  });

  it("isBankAdminUser accepts admin role or admin name", () => {
    expect(isBankAdminUser({ name: "Liran", role: "admin" })).toBe(true);
    expect(isBankAdminUser({ name: "Tomer", role: "admin" })).toBe(true);
    expect(isBankAdminUser({ name: "Ilanit", role: "user" })).toBe(false);
    expect(isBankAdminUser(undefined)).toBe(false);
  });
});
