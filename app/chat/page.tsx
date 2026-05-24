"use client";

import { useEffect } from "react";
import { useTripStore } from "@/stores/tripStore";
import ChatInterface from "@/components/ChatInterface";

export default function ChatPage() {
  const setUnreadChat = useTripStore((s) => s.setUnreadChat);

  // Clear the unread indicator the moment this page mounts
  useEffect(() => {
    setUnreadChat(false);
  }, [setUnreadChat]);

  return (
    <div className="flex flex-col flex-1 p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Travel Chat</h1>
        <p className="text-xs text-muted-foreground mt-0.5">AI local recommendations &amp; translation helper</p>
      </div>

      <ChatInterface />
    </div>
  );
}
