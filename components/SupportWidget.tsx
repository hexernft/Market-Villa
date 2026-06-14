"use client";

import { FormEvent, useState } from "react";
import { Bot, HelpCircle, MessageCircle, Send, X } from "lucide-react";

const quickPrompts = [
  "How do I add products?",
  "How do I connect a domain?",
  "How do I publish my store?",
];

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
        "Hi, I am your Market Villa support assistant. Ask me about setup, products, orders, payments, or domains.",
    },
  ]);

  function sendMessage(content: string) {
    const cleanMessage = content.trim();

    if (!cleanMessage) return;

    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: cleanMessage,
      },
      {
        role: "assistant",
        content:
          "AI support will be connected here soon. For now, check the Help Center or contact support for setup assistance.",
      },
    ]);

    setMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(message);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open support chat"
        title="Support"
        className="group fixed bottom-5 right-5 z-50 inline-flex items-center gap-0 overflow-hidden rounded-full bg-[var(--mv-orange)] p-2.5 text-white shadow-soft ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:gap-2.5 hover:bg-[var(--mv-orange-hover)] hover:px-3.5"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white">
          <MessageCircle size={16} />
        </span>

        <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-xs font-semibold opacity-0 transition-all duration-300 group-hover:max-w-20 group-hover:pr-1 group-hover:opacity-100">
          Support
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[70]">
          <button
            type="button"
            aria-label="Close support chat"
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
          />

          <aside className="absolute bottom-0 right-0 flex h-[88vh] w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-soft md:bottom-5 md:right-5 md:h-[42rem] md:w-[24rem] md:rounded-[2rem]">
            <header className="border-b border-slate-200 bg-slate-950 p-5 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950">
                    <Bot size={20} />
                  </span>

                  <div>
                    <p className="text-sm font-semibold">Market Villa Support</p>
                    <p className="mt-1 text-xs text-slate-300">
                      AI drawer ready for integration
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
            </header>

            <div className="border-b border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <HelpCircle size={14} />
                Quick help
              </p>

              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-950 hover:text-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-white p-4">
              {messages.map((item, index) => {
                const isUser = item.role === "user";

                return (
                  <div
                    key={`${item.role}-${index}`}
                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-6 ${
                        isUser
                          ? "bg-slate-950 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.content}
                    </div>
                  </div>
                );
              })}
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-slate-200 bg-white p-4"
            >
              <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-2">
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                  placeholder="Ask support..."
                />

                <button
                  type="submit"
                  className="grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-white hover:bg-slate-800"
                  aria-label="Send support message"
                >
                  <Send size={16} />
                </button>
              </div>

              <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                Connect your AI support API here when ready.
              </p>
            </form>
          </aside>
        </div>
      ) : null}
    </>
  );
}


