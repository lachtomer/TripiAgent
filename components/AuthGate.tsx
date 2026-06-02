"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const isHydrated = useIsHydrated();
  const signedIn = useAuthStore((s) => s.signedIn);
  const authUserId = useAuthStore((s) => s.currentUserId);
  const setCurrentUser = useTripStore((s) => s.setCurrentUser);
  const router = useRouter();
  const pathname = usePathname();

  // Sync tripStore.currentUser from authStore after both stores rehydrate
  useEffect(() => {
    if (isHydrated && signedIn && authUserId) {
      setCurrentUser(authUserId);
    }
  }, [isHydrated, signedIn, authUserId, setCurrentUser]);

  // Redirect unauthenticated users to /login (skip if already there)
  useEffect(() => {
    if (isHydrated && !signedIn && pathname !== "/login") {
      router.replace("/login");
    }
  }, [isHydrated, signedIn, pathname, router]);

  // Dark branded loading screen while hydrating — prevents white flash
  if (!isHydrated) {
    return (
      <div
        data-testid="auth-loading"
        className="min-h-screen bg-background flex items-center justify-center"
      >
        <span className="text-[#006400] dark:text-[#86df72] font-extrabold text-xl tracking-tight">
          TripiAgent
        </span>
      </div>
    );
  }

  // On the login route: always render (even when not signed in)
  if (pathname === "/login") {
    return <>{children}</>;
  }

  // All other routes: block rendering until signed in
  if (!signedIn) {
    return null;
  }

  return <>{children}</>;
}
