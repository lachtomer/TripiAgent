import { useState, useCallback, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTripStore } from "@/stores/tripStore";
import { ChatMessage, TripContext } from "@/types";
import { resolveChatContextLocale } from "@/lib/chatLocale";

export type SendMessageOptions = {
  isQuickPrompt?: boolean;
};

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
  const dayAnchors = useTripStore((state) => state.dayAnchors);
  const setIsPlanning = useTripStore((state) => state.setIsPlanning);
  const setToast = useTripStore((state) => state.setToast);

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
    async (text: string, options?: SendMessageOptions) => {
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
      setIsPlanning(true);     // freeze edits on the UI

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
        locale: resolveChatContextLocale(text, options),
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
            itinerary,
            dayAnchors,
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

        let fullTextResponse = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          if (chunkText) {
            // Mark stream as started on first non-empty chunk
            setStreamStarted(true);
            updateChatMessageText(modelMsgId, chunkText);
            fullTextResponse += chunkText;
          }
        }

        // Cache the successful plan response locally in browser
        try {
          const cacheKey = "tripiagent_chat_cache_" + text.toLowerCase().trim();
          localStorage.setItem(cacheKey, fullTextResponse);
        } catch (e) {
          console.warn("Failed to write to localStorage plan cache:", e);
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

          // Try loading from offline cache
          const cacheKey = "tripiagent_chat_cache_" + text.toLowerCase().trim();
          let cachedText: string | null = null;
          try {
            cachedText = localStorage.getItem(cacheKey);
          } catch (e) {
            console.warn("Failed to read from localStorage plan cache:", e);
          }

          if (cachedText) {
            setToast({ message: "Network offline; showing cached plan.", type: "info" });
            setStreamStarted(true);

            // Simulate chunk-by-chunk streaming of cached response for UX consistency
            const chunks = cachedText.match(/.{1,30}/g) || [cachedText];
            for (let i = 0; i < chunks.length; i++) {
              if (abortController.signal.aborted) break;
              await new Promise((resolve) => setTimeout(resolve, 30));
              updateChatMessageText(modelMsgId, chunks[i]);
            }
          } else {
            setToast({ message: "Could not reach agent; using last plan.", type: "error" });
            updateChatMessageText(
              modelMsgId,
              `\n\n[Error: Connection offline. Failed to retrieve response from AI assistant.]`
            );
          }
        }
      } finally {
        setLoading(false);
        setStreamStarted(false);
        setIsPlanning(false); // release planning lock
        if (abortControllerRef.current === abortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [addChatMessage, updateChatMessageText, setUnreadChat, location, itinerary, dayAnchors, messages, pathname, setIsPlanning, setToast]
  );

  return {
    messages,
    loading,
    streamStarted,
    sendMessage,
  };
}
