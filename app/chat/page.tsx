"use client";

import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { AppLogo } from "@/components/app-logo";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What kind of projects has SocialMoon worked on?",
  "What ROI can I realistically expect?",
  "Is your pricing negotiable?",
  "How long until I see results?",
  "What makes SocialMoon different from other agencies?",
  "I need help scaling my paid ads — where do I start?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updated = [...messages, userMessage];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      setMessages([
        ...updated,
        { role: "assistant", content: data.message ?? "Sorry, something went wrong." },
      ]);
    } catch {
      setMessages([
        ...updated,
        { role: "assistant", content: "Connection error. Please try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3.5" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-3">
          <AppLogo height={28} />
          <span className="text-xs" style={{ color: "var(--fg-subtle)" }}>AI Assistant</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {!isEmpty && (
            <button
              onClick={() => setMessages([])}
              className="text-xs px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--fg-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              New chat
            </button>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full px-4 pb-32">
            <AppLogo height={40} className="mb-6" />
            <h1 className="text-2xl font-semibold mb-2">How can I help you today?</h1>
            <p className="text-sm mb-10 text-center max-w-sm" style={{ color: "var(--fg-muted)" }}>
              I&apos;m SocialMoon&apos;s AI — ask me about services, lead qualification, proposals, content strategy, or anything agency-related.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-left text-sm rounded-xl px-4 py-3 transition-colors"
                  style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--fg)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-muted)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                {msg.role === "user" ? (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 bg-indigo-600 text-white">
                    Y
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 overflow-hidden" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                    <Image src="/logo.png" alt="Luna" width={28} height={28} className="object-contain" />
                  </div>
                )}
                {/* Bubble */}
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                  style={
                    msg.role === "user"
                      ? { background: "var(--bg-subtle)", color: "var(--fg)", border: "1px solid var(--border)" }
                      : { background: "var(--bubble-ai-bg)", color: "var(--bubble-ai-fg)" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                  <Image src="/logo.png" alt="Luna" width={28} height={28} className="object-contain" />
                </div>
                <div className="rounded-2xl px-4 py-3" style={{ background: "var(--bubble-ai-bg)" }}>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0ms]" style={{ background: "var(--fg-subtle)" }}/>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:150ms]" style={{ background: "var(--fg-subtle)" }}/>
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:300ms]" style={{ background: "var(--fg-subtle)" }}/>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-4 pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          <div
            className="relative flex items-end gap-3 rounded-2xl px-4 py-3 transition-colors"
            style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message SocialMoon..."
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent text-sm focus:outline-none resize-none max-h-40 overflow-y-auto leading-relaxed"
              style={{ color: "var(--fg)" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="flex-shrink-0 w-8 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "var(--fg-subtle)" }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}


