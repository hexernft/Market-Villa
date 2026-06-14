"use client";

import { FormEvent, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I am your Market Villa support assistant. Ask me about setup, products, orders, payments, domains, or publishing your store.",
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (!cleanMessage || isSending) {
      return;
    }

    setMessage("");

    const nextMessages: ChatMessage[] = [
      ...messages,
      {
        role: "user",
        content: cleanMessage,
      },
    ];

    setMessages(nextMessages);
    setIsSending(true);

    try {
      const response = await fetch("/api/ai/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: cleanMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to contact AI support.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            data?.reply ||
            "I could not generate a response. Please try again.",
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to contact AI support.";

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open support chat"
          title="Support"
          className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-0 overflow-hidden rounded-full bg-[var(--mv-orange)] p-2.5 text-white shadow-soft ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:gap-2.5 hover:bg-[var(--mv-orange-hover)] hover:px-3.5"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white">
            <MessageCircle size={20} />
          </span>

          <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-xs font-semibold opacity-0 transition-all duration-300 group-hover:max-w-20 group-hover:pr-1 group-hover:opacity-100">
            Support
          </span>
        </button>
      ) : null}

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close support chat"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
          />

          <aside className="absolute bottom-5 right-5 flex h-[min(620px,calc(100vh-2.5rem))] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="bg-slate-950 px-5 py-4 text-white">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--mv-orange)] text-white">
                    <Bot size={20} />
                  </span>

                  <div>
                    <p className="text-sm font-semibold">
                      Market Villa Support
                    </p>
                    <p className="mt-1 text-xs text-slate-300">
                      AI assistant online
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white hover:bg-white/15"
                  aria-label="Close support chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4">
              {messages.map((chatMessage, index) => {
                const isUser = chatMessage.role === "user";

                return (
                  <div
                    key={`${chatMessage.role}-${index}`}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                        isUser
                          ? "bg-[var(--mv-orange)] text-white"
                          : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
                      }`}
                    >
                      {chatMessage.content}
                    </div>
                  </div>
                );
              })}

              {isSending ? (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
                    <Loader2 size={15} className="animate-spin" />
                    Thinking...
                  </div>
                </div>
              ) : null}
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="border-t border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm focus-within:border-[var(--mv-orange)]">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                  placeholder="Ask support..."
                  disabled={isSending}
                />

                <button
                  type="submit"
                  disabled={isSending || !message.trim()}
                  className="grid h-10 w-10 place-items-center rounded-full bg-[var(--mv-orange)] text-white transition hover:bg-[var(--mv-orange-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send support message"
                >
                  {isSending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                AI support can help with setup, billing, products, orders, and domains.
              </p>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}