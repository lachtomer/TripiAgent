"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Shield } from "lucide-react";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";

export default function UserProfileSwitcher() {
  const isHydrated = useIsHydrated();
  const users = useTripStore((s) => s.users);
  const currentUser = useTripStore((s) => s.currentUser);
  const setCurrentUser = useTripStore((s) => s.setCurrentUser);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (!isHydrated) {
    return (
      <div className="w-10 h-10 rounded-full bg-muted animate-pulse shrink-0" />
    );
  }

  const activeUser = users.find((u) => u.id === currentUser) || users[0];

  const handleSelectUser = (id: string) => {
    setCurrentUser(id);
    setIsOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary/10 dark:bg-zinc-800 border border-[#bfcab7] dark:border-[#1e293b]/30 hover:bg-primary/15 dark:hover:bg-zinc-700/80 transition-all select-none cursor-pointer focus:outline-none"
        aria-label="Switch user profile"
      >
        <div className="w-6.5 h-6.5 rounded-full bg-[#006400] dark:bg-[#86df72] text-white dark:text-zinc-950 flex items-center justify-center font-bold text-xs">
          {activeUser.name.charAt(activeUser.name.length - 1)}
        </div>
        <span className="text-xs font-bold text-[#004900] dark:text-[#9df888] hidden sm:inline">
          {activeUser.name}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-[#004900]/70 dark:text-[#9df888]/70" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-outline-variant/30 bg-background/95 backdrop-blur-md shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-250">
          <div className="px-3.5 py-1.5 border-b border-outline-variant/10">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
              Switch Profile
            </span>
          </div>

          <div className="mt-1 space-y-0.5 px-1.5">
            {users.map((user) => {
              const isSelected = user.id === currentUser;
              const isAdmin = user.role === "admin";

              return (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#006400]/10 text-[#006400] dark:bg-[#86df72]/15 dark:text-[#86df72]"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      isSelected
                        ? "bg-[#006400] text-white dark:bg-[#86df72] dark:text-zinc-950"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {user.name.charAt(user.name.length - 1)}
                    </div>
                    <div>
                      <div>{user.name}</div>
                      {isAdmin && (
                        <div className="flex items-center gap-0.5 text-[8px] font-extrabold text-amber-600 dark:text-amber-400 uppercase mt-0.2">
                          <Shield className="h-2 w-2" /> Admin
                        </div>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
