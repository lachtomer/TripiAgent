import { describe, it, expect } from "vitest";
import {
  isOverwhelminglyHebrew,
  resolveChatContextLocale,
} from "./chatLocale";

describe("chatLocale", () => {
  describe("resolveChatContextLocale", () => {
    it("returns en for quick-prompt sends regardless of message script", () => {
      expect(
        resolveChatContextLocale("מה יש בקרבת מקום?", { isQuickPrompt: true })
      ).toBe("en");
      expect(
        resolveChatContextLocale("What's near me?", { isQuickPrompt: true })
      ).toBe("en");
    });

    it("returns he for overwhelmingly Hebrew user-typed messages", () => {
      expect(resolveChatContextLocale("מה יש בקרבת מקום?")).toBe("he");
      expect(resolveChatContextLocale("איפה כדאי לאכול ארוחת צהריים?")).toBe("he");
    });

    it("returns en for English user-typed messages", () => {
      expect(resolveChatContextLocale("What's near me?")).toBe("en");
      expect(resolveChatContextLocale("Find lunch under 15 euros")).toBe("en");
    });

    it("returns en for mixed Hebrew and English messages", () => {
      expect(
        resolveChatContextLocale("What is the best gelato near Piazza delle Erbe?")
      ).toBe("en");
      expect(resolveChatContextLocale("Hello מה קורה")).toBe("en");
    });

    it("returns en for empty or whitespace-only messages", () => {
      expect(resolveChatContextLocale("")).toBe("en");
      expect(resolveChatContextLocale("   ")).toBe("en");
    });
  });

  describe("isOverwhelminglyHebrew", () => {
    it("is true for entirely Hebrew text", () => {
      expect(isOverwhelminglyHebrew("שלום")).toBe(true);
    });

    it("is false for entirely Latin text", () => {
      expect(isOverwhelminglyHebrew("Hello world")).toBe(false);
    });

    it("is false for mixed text below overwhelming threshold", () => {
      expect(isOverwhelminglyHebrew("Hello מה קורה")).toBe(false);
    });
  });
});
