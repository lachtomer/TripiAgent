export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolvePlaceHref(websiteUrl?: string, mapsUrl?: string): string | null {
  if (websiteUrl && isSafeExternalUrl(websiteUrl)) return websiteUrl;
  if (mapsUrl && isSafeExternalUrl(mapsUrl)) return mapsUrl;
  return null;
}

/** Stable slug for data-testid (Google place_ids may contain awkward chars). */
export function placeTestIdSlug(placeId: string): string {
  return placeId.replace(/[^a-zA-Z0-9_-]/g, "_");
}
