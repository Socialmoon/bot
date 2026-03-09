"use client";

import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { AppLogo } from "@/components/app-logo";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Lightweight markdown renderer — bold, italic, line breaks
function renderMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  const lines = text.split("\n");
  lines.forEach((line, li) => {
    // Parse inline **bold** and *italic*
    const segments: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(line)) !== null) {
      if (m.index > last) segments.push(line.slice(last, m.index));
      if (m[1] !== undefined) segments.push(<strong key={m.index}>{m[1]}</strong>);
      else if (m[2] !== undefined) segments.push(<em key={m.index}>{m[2]}</em>);
      last = m.index + m[0].length;
    }
    if (last < line.length) segments.push(line.slice(last));
    parts.push(<span key={li}>{segments}</span>);
    if (li < lines.length - 1) parts.push(<br key={`br-${li}`} />);
  });
  return parts;
}

const ROW1 = [
  "How do you scale paid ads profitably?",
  "What ROI can I realistically expect?",
  "How much does SocialMoon cost?",
  "Do you work with early-stage startups?",
  "Can you help with Google Ads specifically?",
  "What's your approach to brand strategy?",
  "How does email marketing drive revenue?",
  "What's included in an SEO audit?",
];

const ROW2 = [
  "Why SocialMoon over other agencies?",
  "What results have you gotten for clients?",
  "How long until we see real results?",
  "What does a discovery call look like?",
  "Do you handle social media content creation?",
  "What platforms do you run ads on?",
  "Is pricing negotiable for startups?",
  "How do you measure campaign success?",
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

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        setMessages([...updated, { role: "assistant", content: data.error ?? "Sorry, something went wrong." }]);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        if (firstChunk) {
          firstChunk = false;
          setLoading(false); // hide thinking dots only when real text arrives
        }
        setMessages([...updated, { role: "assistant", content: accumulated }]);
      }
    } catch {
      setMessages([...updated, { role: "assistant", content: "Connection error. Please try again." }]);
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
      <header className="flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <AppLogo height={22} />
          <span className="text-xs hidden sm:block" style={{ color: "var(--fg-subtle)" }}>AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isEmpty && (
            <button
              onClick={() => setMessages([])}
              className="text-xs px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ color: "var(--fg-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-subtle)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <span className="hidden sm:inline">New chat</span>
              <span className="sm:hidden">✕</span>
            </button>
          )}
        </div>
      </header>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full pb-28 sm:pb-32">
            <AppLogo height={36} className="mb-4 sm:mb-6" />
            <h1 className="text-xl sm:text-2xl font-semibold mb-2 px-4 text-center">How can I help you today?</h1>
            <p className="text-sm mb-8 sm:mb-10 text-center max-w-xs sm:max-w-sm px-4" style={{ color: "var(--fg-muted)" }}>
              I&apos;m Luna — ask me about services, lead qualification, proposals, content strategy, or anything agency-related.
            </p>

            {/* Marquee slider */}
            <style>{`
              @keyframes marquee-left  { from { transform: translateX(0) } to { transform: translateX(-50%) } }
              @keyframes marquee-right { from { transform: translateX(-50%) } to { transform: translateX(0) } }
              .marquee-left  { animation: marquee-left  28s linear infinite; }
              .marquee-right { animation: marquee-right 32s linear infinite; }
              .marquee-wrap:hover .marquee-left,
              .marquee-wrap:hover .marquee-right { animation-play-state: paused; }

              @keyframes thinking-dot {
                0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
                40%            { transform: scale(1);   opacity: 1;   }
              }
              @keyframes thinking-glow {
                0%, 100% { box-shadow: 0 0 0px 0px rgba(99,102,241,0); }
                50%       { box-shadow: 0 0 12px 3px rgba(99,102,241,0.25); }
              }
              .thinking-bubble { animation: thinking-glow 2s ease-in-out infinite; }
              .thinking-dot-1 { animation: thinking-dot 1.2s ease-in-out infinite 0ms; }
              .thinking-dot-2 { animation: thinking-dot 1.2s ease-in-out infinite 200ms; }
              .thinking-dot-3 { animation: thinking-dot 1.2s ease-in-out infinite 400ms; }
            `}</style>

            <div
              className="w-full overflow-hidden space-y-2.5 sm:space-y-3 marquee-wrap"
              style={{
                maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              }}
            >
              {/* Row 1 — scrolls left */}
              <div className="flex gap-2 sm:gap-3 marquee-left" style={{ width: "max-content" }}>
                {[...ROW1, ...ROW1].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors duration-150"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--fg-muted)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.color = "var(--fg)"; e.currentTarget.style.borderColor = "var(--fg-subtle)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--fg-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {/* Row 2 — scrolls right */}
              <div className="flex gap-2 sm:gap-3 marquee-right" style={{ width: "max-content" }}>
                {[...ROW2, ...ROW2].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => send(s)}
                    className="flex-shrink-0 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-colors duration-150"
                    style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)", color: "var(--fg-muted)" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-muted)"; e.currentTarget.style.color = "var(--fg)"; e.currentTarget.style.borderColor = "var(--fg-subtle)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "var(--bg-subtle)"; e.currentTarget.style.color = "var(--fg-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Chat messages */
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-5 sm:py-8 space-y-4 sm:space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                {msg.role === "user" ? (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 bg-indigo-600 text-white">
                    Y
                  </div>
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 overflow-hidden" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                    <Image src="/logo.png" alt="Luna" width={28} height={28} className="object-contain" />
                  </div>
                )}
                {/* Bubble */}
                <div
                  className="max-w-[85%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { background: "var(--bg-subtle)", color: "var(--fg)", border: "1px solid var(--border)" }
                      : { background: "var(--bubble-ai-bg)", color: "var(--bubble-ai-fg)" }
                  }
                >
                  {msg.role === "assistant" ? renderMarkdown(msg.content) : msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 sm:gap-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ background: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
                  <Image src="/logo.png" alt="Luna" width={28} height={28} className="object-contain" />
                </div>
                <div className="thinking-bubble rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 flex items-center gap-2" style={{ background: "var(--bubble-ai-bg)" }}>
                  <span className="thinking-dot-1 w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="thinking-dot-2 w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="thinking-dot-3 w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="ml-1.5 text-xs" style={{ color: "var(--fg-subtle)" }}>Luna is thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="px-3 sm:px-4 pb-4 sm:pb-6 pt-2">
        <div className="max-w-3xl mx-auto">
          <div
            className="chat-input-wrap relative flex items-center gap-2 sm:gap-3 rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-150"
            style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)" }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message Luna..."
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent text-sm focus:outline-none resize-none max-h-32 sm:max-h-40 overflow-y-auto leading-normal"
              style={{ color: "var(--fg)", paddingTop: "2px", paddingBottom: "2px" }}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = t.scrollHeight + "px";
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className={`flex-shrink-0 w-8 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all duration-150 ${input.trim() ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          <p className="text-center text-xs mt-1.5 sm:mt-2 hidden sm:block" style={{ color: "var(--fg-subtle)" }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}


