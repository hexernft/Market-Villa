"use client";

import {
  FormEvent, useMemo, useState } from "react";
import {
  Bot, Loader2, Send, X } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

type StoreAiAssistantProps = {
  businessId: string;
  businessName: string;
};

export function StoreAiAssistant({
  businessId,
  businessName
}: StoreAiAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
  role: "assistant",
      content:
        "Hi, I can help answer questions about this store. What would you like to know?"
},
  ]);
  const [isSending, setIsSending] = useState(false);

  const title = useMemo(() => {
  return businessName ? `${businessName} Assistant` : "Store Assistant";
  }, [businessName]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

    const message = input.trim();

    if (!message || isSending) return;

    setInput("");
    setMessages((items) => [...items, {
  role: "user", content: message }]);
    setIsSending(true);

    try {
  const response = await fetch("/api/ai/store-chat", {
  method: "POST",
        headers: {
  "Content-Type": "application/json"
},
        body: JSON.stringify({
  businessId,
          message,
          history: messages.slice(-8)
})
});

      const result = await response.json();

      if (!response.ok) {
  throw new Error(result.error || "Unable to get AI response.");
      }

      setMessages((items) => [
        ...items,
        {
  role: "assistant",
          content:
            result.reply ||
            "I’m not fully sure about that. Please contact the store directly on WhatsApp."
},
      ]);
    } catch (error) {
  const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to reach the store assistant.";

      setMessages((items) => [
        ...items,
        {
  role: "assistant",
          content: errorMessage
},
      ]);
    } finally {
  setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80]">
      {isOpen ? (
        <div className="w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-[1.5rem] border border-white/40 bg-white shadow-[0_24px_90px_rgba(36,20,54,0.24)]">
          <div className="flex items-center justify-between bg-[#14532d] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/12">
                <Bot size={18} />
              </span>

              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-white/60">AI-powered help</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
              aria-label="Close store assistant"
            >
              <X size={17} />
            </button>
          </div>

          <div className="max-h-[22rem] min-h-[18rem] space-y-3 overflow-y-auto bg-[#f8f4ff] p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${
  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-6 ${
  message.role === "user"
                      ? "bg-[#16a34a] text-white"
                      : "bg-white text-[#241436] shadow-sm"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isSending ? (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm text-[#241436] shadow-sm">
                  <Loader2 size={15} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about products, delivery, prices..."
              className="min-h-11 flex-1 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
            />

            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-[#16a34a] text-white transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex min-h-16 items-center gap-3 rounded-full border border-white/40 bg-[#16a34a] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_60px_rgba(22,163,74,0.38)] ring-4 ring-[#16a34a]/15 transition hover:-translate-y-0.5 hover:bg-[#15803d]"
        >
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#16a34a] shadow-sm">
            <Bot size={20} />
          </span>
          <span className="leading-tight">Ask Store AI</span>
        </button>
      )}
    </div>
  );
}