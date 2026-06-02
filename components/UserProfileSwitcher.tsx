"use client";

import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { useTripStore } from "@/stores/tripStore";
import { useAuthStore } from "@/stores/authStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { useTranslation } from "@/lib/translations";

export default function UserProfileSwitcher() {
  const isHydrated = useIsHydrated();
  const users = useTripStore((s) => s.users);
  const currentUser = useTripStore((s) => s.currentUser);
  const signOut = useAuthStore((s) => s.signOut);
  const { t } = useTranslation();
  const router = useRouter();

  if (!isHydrated) {
    return (
      <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
    );
  }

  const activeUser = users.find((u) => u.id === currentUser) || users[0];
  const isAdmin = activeUser?.role === "admin";

  const handleSignOut = () => {
    signOut();
    router.push("/login");
  };

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Identity chip */}
      <div
        data-testid="user-identity-chip"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 dark:bg-zinc-800 border border-[#bfcab7] dark:border-[#1e293b]/30 select-none"
      >
        <div className="w-6 h-6 rounded-full bg-[#006400] dark:bg-[#86df72] text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs shrink-0">
          {activeUser.name.charAt(0)}
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-xs font-bold text-[#004900] dark:text-[#9df888]">
            {activeUser.name}
          </span>
          {isAdmin && (
            <span className="flex items-center gap-0.5 text-[8px] font-extrabold text-amber-600 dark:text-amber-400 uppercase">
              <Shield className="h-2 w-2" /> Admin
            </span>
          )}
        </div>
      </div>

      {/* Sign-out button */}
      <button
        data-testid="sign-out-btn"
        onClick={handleSignOut}
        className="p-1.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all cursor-pointer focus:outline-none"
        aria-label={t.signOut}
        title={t.signOut}
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
