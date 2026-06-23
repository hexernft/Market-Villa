"use client";

import { FormEvent, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const suggestions = [
  "How do I publish?",
  "How do I add products?",
  "How does billing work?",
];

async function readSupportResponse(response: Response) {
  const responseText = await response.text();

  if (!responseText.trim()) {
    return {
      error: response.ok
        ? "AI support returned an empty response. Please try again."
        : "AI support is unavailable right now. Please try again shortly.",
    };
  }

  try {
    return JSON.parse(responseText) as { error?: string; reply?: string };
  } catch {
    return {
      error: response.ok
        ? "AI support returned an unreadable response. Please try again."
        : "AI support is unavailable right now. Please try again shortly.",
    };
  }
}

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

  async function sendSupportMessage(value: string) {
    const cleanMessage = value.trim();

    if (!cleanMessage || isSending) {
      return;
    }

    setMessage("");
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "user",
        content: cleanMessage,
      },
    ]);
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

      const data = await readSupportResponse(response);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to contact AI support.");
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          role: "assistant",
          content:
            data?.reply || "I could not generate a response. Please try again.",
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendSupportMessage(message);
  }

  return (
    <>
      {!isOpen ? (
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open support chat"
          title="Support"
          whileHover={{ y: -2, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="support-widget-trigger fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-[#7c3aed] p-0 text-white shadow-[0_0_34px_rgba(124,58,237,0.75)] ring-4 ring-[#7c3aed]/25 transition hover:-translate-y-0.5 hover:bg-[#6d28d9] hover:shadow-[0_0_44px_rgba(124,58,237,0.9)] md:h-14 md:w-14"
          style={{
            width: "3rem",
            height: "3rem",
            minHeight: 0,
            padding: 0,
            border: "1px solid rgba(255,255,255,0.7)",
            borderRadius: "9999px",
            backgroundColor: "#7c3aed",
            boxShadow: "0 0 34px rgba(124, 58, 237, 0.75)",
          }}
        >
          <MessageCircle
            aria-hidden="true"
            className="h-6 w-6 fill-white text-white md:h-7 md:w-7"
            strokeWidth={2.35}
          />
        </motion.button>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <button
              type="button"
              aria-label="Close support chat"
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-[#26143d]/45 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ opacity: 0, y: 28, scale: 0.98, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 28, scale: 0.98, filter: "blur(10px)" }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-5 right-5 flex h-[min(620px,calc(100vh-2.5rem))] w-[min(420px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-200"
            >
              <div className="bg-[#26143d] px-5 py-2.5 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--mv-violet)] text-white">
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

              <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-2.5">
                {messages.map((chatMessage, index) => {
                  const isUser = chatMessage.role === "user";

                  return (
                    <motion.div
                      key={`${chatMessage.role}-${index}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28 }}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                          isUser
                            ? "bg-[var(--mv-violet)] text-white"
                            : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
                        }`}
                      >
                        {chatMessage.content}
                      </div>
                    </motion.div>
                  );
                })}

                {isSending ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
                      <span className="support-typing-dot" />
                      <span className="support-typing-dot animation-delay-150" />
                      <span className="support-typing-dot animation-delay-300" />
                    </div>
                  </motion.div>
                ) : null}
              </div>

              <div className="border-t border-slate-200 bg-white px-4 pt-3">
                <div className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => sendSupportMessage(suggestion)}
                      disabled={isSending}
                      className="shrink-0 rounded-full border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-[var(--mv-violet)] transition hover:bg-purple-100 disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-4 pt-0">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-2 shadow-sm focus-within:border-[var(--mv-violet)]">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="Ask support..."
                    disabled={isSending}
                  />

                  <motion.button
                    type="submit"
                    disabled={isSending || !message.trim()}
                    whileTap={{ scale: 0.94 }}
                    className="grid h-10 w-10 place-items-center rounded-full bg-[var(--mv-violet)] text-white transition hover:bg-[var(--mv-purple-hover)] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Send support message"
                  >
                    <Send size={16} />
                  </motion.button>
                </div>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                  AI support can help with setup, billing, products, orders, and
                  domains.
                </p>
              </form>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}


