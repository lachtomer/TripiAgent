"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, MessageCircle, Calendar, Luggage } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTripStore } from "@/stores/tripStore";

export default function BottomNav() {
  const pathname = usePathname();
  const unreadChat = useTripStore((s) => s.unreadChat);

  const navItems = [
    { label: "Explore", href: "/", icon: MapPin },
    { label: "Chat", href: "/chat", icon: MessageCircle },
    { label: "Itinerary", href: "/itinerary", icon: Calendar },
    { label: "Pack", href: "/pack", icon: Luggage },
  ];

  return (
    <nav
      id="bottom-nav"
      className="fixed bottom-0 left-0 right-0 w-full max-w-[390px] md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto z-50 border-t border-x border-border/60 bg-background/90 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex h-16 w-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          const showDot = item.href === "/chat" && unreadChat && !isActive;

          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-link-${item.label.toLowerCase()}`}
              className={cn(
                "relative flex h-14 min-w-[56px] flex-col items-center justify-center rounded-xl transition-all duration-200 px-3 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive
                  ? "text-primary dark:text-[#86df72] bg-primary/5 dark:bg-[#86df72]/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "h-6 w-6 transition-transform duration-200",
                    isActive ? "scale-110" : ""
                  )}
                />
                {showDot && (
                  <span
                    id="chat-unread-dot"
                    className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary dark:bg-[#86df72] ring-2 ring-background dark:ring-zinc-950 animate-pulse"
                    aria-label="New message"
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium mt-0.5 transition-all duration-200",
                  isActive ? "font-bold" : ""
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-primary dark:bg-[#86df72]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
