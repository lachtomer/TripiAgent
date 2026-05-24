import { useState, useCallback, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTripStore } from "@/stores/tripStore";
import { ChatMessage, TripContext } from "@/types";

export function useChat() {
  const pathname = usePathname();
  const [loading, setLoading] = useState<boolean>(false);
  // streamStarted: true once the first chunk of a stream arrives.
  // Used to distinguish "waiting for first byte" from "streaming".
  const [streamStarted, setStreamStarted] = useState<boolean>(false);

  const messages = useTripStore((state) => state.chatMessages);
  const addChatMessage = useTripStore((state) => state.addChatMessage);
  const updateChatMessageText = useTripStore((state) => state.updateChatMessageText);
  const setUnreadChat = useTripStore((state) => state.setUnreadChat);

  const location = useTripStore((state) => state.location);
  const itinerary = useTripStore((state) => state.itinerary);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup abort controller on component unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Abort active stream if one is currently running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // 1. Add user message
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text,
        timestamp: Date.now(),
      };
      addChatMessage(userMsg);

      // 2. Add empty model response message to populate in UI
      const modelMsgId = crypto.randomUUID();
      const modelMsg: ChatMessage = {
        id: modelMsgId,
        role: "model",
        text: "",
        timestamp: Date.now(),
      };
      addChatMessage(modelMsg);

      setLoading(true);
      setStreamStarted(false); // reset: show typing dots until first chunk

      // 3. Construct TripContext payload
      const now = new Date();
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      const itinerarySummary = itinerary
        ? itinerary
            .map((d) => `Day ${d.dayNumber}: ${d.activities.map((a) => a.title).join(", ")}`)
            .join("; ")
        : null;

      const context: TripContext = {
        coords: location?.coords || null,
        cityName: location?.cityName || null,
        localTime: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dayOfWeek: daysOfWeek[now.getDay()],
        weather: null,
        itinerarySummary,
        locale: typeof navigator !== "undefined" ? navigator.language : "en-US",
      };

      // Map chat history payload
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: text,
            history: historyPayload,
            context,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          if (response.status === 429) {
            const errData = await response.json();
            throw new Error(errData.message || "Rate limit exceeded");
          }
          throw new Error("Failed to send message to AI assistant");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) {
          throw new Error("Failed to initialize stream reader");
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          if (chunkText) {
            // Mark stream as started on first non-empty chunk
            setStreamStarted(true);
            updateChatMessageText(modelMsgId, chunkText);
          }
        }

        // Stream completed — mark unread if not on the chat page
        if (pathname !== "/chat") {
          setUnreadChat(true);
        }
      } catch (err) {
        const error = err as Error;
        if (error.name === "AbortError") {
          console.log("AI stream request aborted by client.");
        } else {
          console.error("AI chat error:", error);
          updateChatMessageText(
            modelMsgId,
            `\n\n[Error: ${error.message || "Failed to retrieve response from AI assistant."}]`
          );
        }
      } finally {
        setLoading(false);
        setStreamStarted(false);
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [addChatMessage, updateChatMessageText, setUnreadChat, location, itinerary, messages, pathname]
  );

  return {
    messages,
    loading,
    streamStarted,
    sendMessage,
  };
}
