"use client";

import { Menu } from "lucide-react";
import UserProfileSwitcher from "./UserProfileSwitcher";
import { useTripStore } from "@/stores/tripStore";
import { useIsHydrated } from "@/hooks/useIsHydrated";

export default function TopAppBar() {
  const isHydrated = useIsHydrated();
  const locale = useTripStore((s) => s.locale);
  const setLocale = useTripStore((s) => s.setLocale);

  const toggleLanguage = () => {
    setLocale(locale === "en" ? "he" : "en");
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-[#f6fbee] dark:bg-[#0f172a] border-b border-[#bfcab7] dark:border-[#1e293b]/30 flex items-center justify-between px-4 h-16 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          id="menu-button"
          data-testid="menu-button"
          className="text-[#004900] dark:text-[#9df888] hover:bg-[#f0f5e9] dark:hover:bg-[#1e293b] p-2 rounded-full transition-colors active:opacity-80 flex items-center justify-center focus:outline-none"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-headline-lg-mobile text-[#004900] dark:text-[#9df888] tracking-tight font-bold">
          TripiAgent
        </span>
      </div>
      <div className="flex items-center gap-2">
        {isHydrated && (
          <button
            onClick={toggleLanguage}
            id="lang-toggle-btn" data-testid="lang-toggle"
            className="flex items-center justify-center w-8 h-8 rounded-full border border-[#bfcab7] dark:border-[#1e293b]/30 text-xs font-bold text-[#004900] dark:text-[#9df888] hover:bg-[#f0f5e9] dark:hover:bg-[#1e293b] active:scale-95 transition-all select-none cursor-pointer focus:outline-none"
             title={locale === "en" ? "שנה עברית" : "Switch to English"}
            aria-label="Switch Language"
          >
            {locale === "en" ? "עב" : "EN"}
          </button>
        )}
        <UserProfileSwitcher />
      </div>
    </header>
  );
}
