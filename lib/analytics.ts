export type AnalyticsPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: AnalyticsPayload[];
  }
}

export function trackEvent(event: string, payload: AnalyticsPayload = {}): void {
  if (typeof window === "undefined") return;

  const message = { event, ...payload };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(message);
  }

  window.dispatchEvent(
    new CustomEvent("tripiagent:analytics", {
      detail: message,
    })
  );

  if (process.env.NODE_ENV === "development") {
    console.info("[analytics]", message);
  }
}

