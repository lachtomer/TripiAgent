"use client";

import { useSyncExternalStore } from "react";

// Returns true only on the client after hydration.
// useSyncExternalStore provides a server snapshot (false) and client snapshot (true)
// without needing useState + useEffect, avoiding the react-hooks/set-state-in-effect lint rule.
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},  // subscribe: no-op, value is stable
    () => true,      // getSnapshot (client): hydrated
    () => false,     // getServerSnapshot: not hydrated
  );
}
