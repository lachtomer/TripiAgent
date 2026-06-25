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

  it("includes south-lake optional towns from guide gap analysis", () => {
    const ids = LAKE_GARDA_TEEN_TARGET_BANK.map((e) => e.id);
    expect(ids).toContain("bank-bardolino");
    expect(ids).toContain("bank-garda-village");
    expect(ids).toContain("bank-limone");
    expect(ids).toContain("bank-navigarda");
  });

  it("includes hike options for Tibetan Bridge and Paganella traverse", () => {
    const ids = LAKE_GARDA_TEEN_TARGET_BANK.map((e) => e.id);
    expect(ids).toContain("bank-tibetan-bridge");
    expect(ids).toContain("bank-paganella-traverse");

    const tibetan = LAKE_GARDA_TEEN_TARGET_BANK.find((e) => e.id === "bank-tibetan-bridge");
    expect(tibetan?.locationName).toBe("Torri del Benaco");
    expect(tibetan?.description).toMatch(/Ponte Tibetano/i);

    const paganella = LAKE_GARDA_TEEN_TARGET_BANK.find(
      (e) => e.id === "bank-paganella-traverse"
    );
    expect(paganella?.locationName).toBe("Molveno");
    expect(paganella?.description).toMatch(/5–5\.5 hr/);
  });

  it("includes consolidated guide south-lake gaps", () => {
    const ids = LAKE_GARDA_TEEN_TARGET_BANK.map((e) => e.id);
    expect(ids).toContain("bank-salo");
    expect(ids).toContain("bank-padenghe-beach");
    expect(ids).toContain("bank-ottella-winery");
    expect(ids).toContain("bank-isola-garda");
    expect(ids).toContain("bank-olive-oil-museum");
    expect(ids).toContain("bank-desenzano");
  });
});
