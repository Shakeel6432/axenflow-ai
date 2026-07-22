"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { fillCustomPrompt, formatOutreachTemplate, type OutreachInput } from "@/lib/outreach";

type ChatMsg = {
  role: "user" | "assistant";
  content: string;
  template?: string | null;
};

const SUGGESTIONS = [
  "Short casual cold email",
  "Formal B2B cold email",
  "Phone call script",
  "Make it shorter",
];

type Props = {
  lead: OutreachInput;
  prompt: string;
  onPromptChange: (next: string) => void;
  onFilledPreview: (text: string) => void;
};

export function OutreachChatbot({ lead, prompt, onPromptChange, onFilledPreview }: Props) {
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content:
        "Hi! Tell me what kind of outreach message you want. Example: short cold email, phone script, or follow-up.",
    },
  ]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, chatBusy]);

  async function send(messageRaw?: string) {
    const message = (messageRaw ?? chatInput).trim();
    if (!message || chatBusy) return;
    setChatInput("");
    const nextHistory = [...messages, { role: "user" as const, content: message }];
    setMessages(nextHistory);
    setChatBusy(true);
    try {
      const res = await fetch("/api/tools/ai-outreach/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          currentPrompt: prompt,
          history: nextHistory
            .filter((m) => m.role === "user" || m.role === "assistant")
            .map((m) => ({ role: m.role, content: m.content }))
            .slice(-8),
          lead,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const raw = String(data.error || "");
        const friendly = /rate limit|tokens per minute|tpm|busy right now/i.test(raw)
          ? "The AI is busy right now. Please wait a few seconds and try again."
          : raw || "Something went wrong. Please try again.";
        throw new Error(friendly);
      }

      const reply = String(data.reply || "").trim() || "Done.";
      const updated =
        typeof data.updatedPrompt === "string" && data.updatedPrompt.trim()
          ? data.updatedPrompt.trim()
          : null;

      if (updated) {
        const formatted = formatOutreachTemplate(updated);
        onPromptChange(formatted);
        const filled = fillCustomPrompt(formatted, lead);
        onFilledPreview(`Subject: ${filled.subject}\n\n${filled.body}`);
        setShowDraft(true);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: reply, template: formatted },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setChatBusy(false);
    }
  }

  return (
    <section
      className="overflow-hidden rounded-2xl"
      style={{ border: "1px solid var(--c-border)", background: "var(--c-card, #0f1117)" }}
    >
      <div
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #14b8a6 100%)" }}
      >
        <div>
          <div className="text-sm font-semibold text-white">Step 1 · Chat with AI</div>
          <div className="text-xs text-white/85">Create or edit your template</div>
        </div>
        <button
          type="button"
          onClick={() => setShowDraft((v) => !v)}
          className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25"
        >
          {showDraft ? "Hide draft" : "View draft"}
        </button>
      </div>

      {showDraft && (
        <div className="border-b px-4 py-3" style={{ borderColor: "var(--c-border)" }}>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            rows={7}
            className="w-full rounded-xl px-3 py-2 font-mono text-xs outline-none"
            style={{
              border: "1px solid var(--c-border)",
              background: "var(--c-hover-bg)",
              color: "var(--c-heading)",
            }}
          />
        </div>
      )}

      <div ref={scrollerRef} className="h-[320px] space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div
            key={`${m.role}-${i}`}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed"
              style={
                m.role === "user"
                  ? { background: "#6366f1", color: "#fff" }
                  : {
                      background: "var(--c-hover-bg)",
                      color: "var(--c-heading)",
                      border: "1px solid var(--c-border)",
                    }
              }
            >
              <div className="whitespace-pre-wrap">{m.content}</div>
              {m.template && (
                <div
                  className="mt-2 max-h-56 overflow-y-auto rounded-lg px-3 py-2 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-words"
                  style={{
                    background: "rgba(20,184,166,0.12)",
                    color: "var(--c-text-dim)",
                    border: "1px solid rgba(20,184,166,0.25)",
                  }}
                >
                  {formatOutreachTemplate(m.template)}
                </div>
              )}
            </div>
          </div>
        ))}
        {chatBusy && (
          <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>
            Thinking...
          </p>
        )}
        {!chatBusy && messages.length <= 1 && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                className="rounded-full px-3 py-1.5 text-xs font-medium"
                style={{
                  border: "1px solid var(--c-border)",
                  color: "var(--c-heading)",
                  background: "var(--c-hover-bg)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t px-3 py-3" style={{ borderColor: "var(--c-border)" }}>
        <div
          className="flex items-end gap-2 rounded-2xl px-2 py-1.5"
          style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
        >
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            rows={1}
            placeholder="Describe the email or script you want..."
            disabled={chatBusy}
            className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
            style={{ color: "var(--c-heading)" }}
          />
          <button
            type="button"
            disabled={chatBusy || !chatInput.trim()}
            onClick={() => void send()}
            className="mb-1 rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "#14b8a6" }}
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
