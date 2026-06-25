import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import { LAKE_GARDA_TEEN_TARGET_BANK } from "./lakeGardaTargetBank";

const STALE_BASE_TERMS = [/monzambano/i, /villa eunice/i];

function assertNoStaleBaseTerms(text: string, label: string) {
  for (const pattern of STALE_BASE_TERMS) {
    expect(text, `${label} must not match ${pattern}`).not.toMatch(pattern);
  }
}

describe("lakeGardaTargetBank", () => {
  it("seed bank has no Monzambano or Villa Eunice references", () => {
    const serialized = JSON.stringify(LAKE_GARDA_TEEN_TARGET_BANK);
    assertNoStaleBaseTerms(serialized, "LAKE_GARDA_TEEN_TARGET_BANK");
  });

  it("data/bank.json has no Monzambano or Villa Eunice references", () => {
    const raw = readFileSync(join(process.cwd(), "data", "bank.json"), "utf8");
    assertNoStaleBaseTerms(raw, "data/bank.json");
  });

  it("welcome dinner seed points to Desenzano Pace, not Mincio backup", () => {
    const pace = LAKE_GARDA_TEEN_TARGET_BANK.find((e) => e.id === "bank-dining-pace");
    expect(pace?.locationName).toBe("Desenzano del Garda");
    expect(pace?.description).toMatch(/welcome dinner/i);

    const ponte = LAKE_GARDA_TEEN_TARGET_BANK.find((e) => e.id === "bank-dining-ponte");
    expect(ponte?.locationName).toBe("Borghetto sul Mincio");
    expect(ponte?.description).not.toMatch(/welcome dinner/i);
  });
});
