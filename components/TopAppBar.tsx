"use client";

import { Menu, User } from "lucide-react";

export default function TopAppBar() {
  return (
    <header className="w-full sticky top-0 z-40 bg-[#f6fbee] dark:bg-[#0f172a] border-b border-[#bfcab7] dark:border-[#1e293b]/30 flex items-center justify-between px-4 h-16 shrink-0">
      <div className="flex items-center gap-3">
        <button 
          id="menu-button"
          className="text-[#004900] dark:text-[#9df888] hover:bg-[#f0f5e9] dark:hover:bg-[#1e293b] p-2 rounded-full transition-colors active:opacity-80 flex items-center justify-center focus:outline-none"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-headline-lg-mobile text-[#004900] dark:text-[#9df888] tracking-tight font-bold">
          TripiAgent
        </span>
      </div>
      <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-zinc-800 text-[#004900] dark:text-[#9df888] flex items-center justify-center border border-[#bfcab7] dark:border-[#1e293b]/30 hover:opacity-90 transition-opacity cursor-pointer shrink-0">
        <User className="h-5 w-5" />
      </div>
    </header>
  );
}
