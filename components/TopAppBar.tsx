"use client";

import UserProfileSwitcher from "./UserProfileSwitcher";

export default function TopAppBar() {
  return (
    <header className="w-full sticky top-0 z-40 bg-[#f6fbee] dark:bg-[#0f172a] border-b border-[#bfcab7] dark:border-[#1e293b]/30 flex items-center justify-between px-4 h-16 shrink-0">
      <div className="flex items-center gap-3">
        <span className="font-headline-lg-mobile text-[#004900] dark:text-[#9df888] tracking-tight font-bold">
          TripiAgent
        </span>
      </div>
      <div className="flex items-center gap-2">
        <UserProfileSwitcher />
      </div>
    </header>
  );
}
