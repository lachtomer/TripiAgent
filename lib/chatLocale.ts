const HEBREW_LETTER = /[\u0590-\u05FF]/g;

const OVERWHELMINGLY_HEBREW_RATIO = 0.75;

/**
 * True when the message is entirely Hebrew, or Hebrew is at least 75% of Hebrew+Latin letters.
 * Mixed messages with substantial English return false (English reply).
 */
export function isOverwhelminglyHebrew(text: string): boolean {
  const hebrewCount = text.match(HEBREW_LETTER)?.length ?? 0;
  const latinCount = (text.match(/[A-Za-z]/g) ?? []).length;
  const total = hebrewCount + latinCount;
  if (total === 0) return false;
  if (latinCount === 0) return hebrewCount > 0;
  return hebrewCount / total >= OVERWHELMINGLY_HEBREW_RATIO;
}

export type ResolveChatContextLocaleOptions = {
  isQuickPrompt?: boolean;
};

/**
 * Resolves TripContext.locale for POST /api/ai.
 * Never uses navigator.language — quick-prompts are always English;
 * typed messages use message script detection per spec 009 clarifications.
 */
export function resolveChatContextLocale(
  message: string,
  options?: ResolveChatContextLocaleOptions
): string {
  if (options?.isQuickPrompt) return "en";

  const trimmed = message.trim();
  if (!trimmed) return "en";

  return isOverwhelminglyHebrew(trimmed) ? "he" : "en";
}
