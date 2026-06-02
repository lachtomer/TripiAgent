"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { checkPassword } from "@/lib/userPasswords";
import { useTripStore } from "@/stores/tripStore";
import { translations } from "@/lib/translations";

interface AuthState {
  signedIn: boolean;
  currentUserId: string | null;

  signIn: (userName: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      signedIn: false,
      currentUserId: null,

      signIn: (userName, password) => {
        const users = useTripStore.getState().users;
        const user = users.find(
          (u) => u.name.trim().toLowerCase() === userName.trim().toLowerCase()
        );

        // Deliberately do NOT distinguish "user not found" vs "wrong password" — FR-2
        const t = translations.en;
        if (!user || !checkPassword(user.name, password)) {
          return { ok: false, error: t.wrongPassword };
        }

        set({ signedIn: true, currentUserId: user.id });
        return { ok: true };
      },

      // Does NOT call tripStore.setCurrentUser — AuthGate.useEffect handles that sync
      signOut: () => set({ signedIn: false, currentUserId: null }),
    }),
    {
      name: "tripiagent-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
