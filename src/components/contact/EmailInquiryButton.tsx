"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Copy, Check, Mail, X } from "lucide-react";
import { getProjectInquiryEmailText } from "@/lib/constants";
import { cn } from "@/lib/utils";

type EmailInquiryButtonProps = {
  className?: string;
};

type CopiedField = "email" | "message" | null;

export function EmailInquiryButton({ className }: EmailInquiryButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<CopiedField>(null);
  const emailData = getProjectInquiryEmailText();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const copyText = async (text: string, field: Exclude<CopiedField, null>) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(field);
      setTimeout(() => setCopied(null), 2500);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "btn-main relative z-10 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all duration-300 active:scale-[0.97] sm:w-auto",
          className
        )}
      >
        Send Project Details <ArrowRight size={16} />
      </button>

      {open && (
        <>
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="email-popup-title"
              className="pointer-events-auto relative w-full max-w-md rounded-xl p-4 shadow-2xl sm:p-5"
              style={{ background: "var(--c-surface-solid)", border: "1px solid var(--c-border)" }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-lg transition hover:scale-105"
                style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)", color: "var(--c-text-dim)" }}
                aria-label="Close"
              >
                <X size={14} />
              </button>

              <div className="pr-8">
                <p id="email-popup-title" className="text-base font-bold" style={{ color: "var(--c-heading)" }}>
                  Copy and send via your email app
                </p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--c-text-muted)" }}>
                  Click copy, open Gmail or Outlook, paste the details, and send to us.
                </p>
              </div>

              <div className="mt-3 space-y-2">
                <div
                  className="rounded-lg p-3"
                  style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--c-text-muted)" }}>
                    Email Address
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-indigo-500">{emailData.email}</span>
                    <button
                      type="button"
                      onClick={() => copyText(emailData.email, "email")}
                      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition"
                      style={{ background: "rgba(99, 102, 241, 0.12)", color: "#6366f1", border: "1px solid rgba(99, 102, 241, 0.2)" }}
                    >
                      {copied === "email" ? <Check size={12} /> : <Copy size={12} />}
                      {copied === "email" ? "Copied!" : "Copy Email"}
                    </button>
                  </div>
                </div>

                <div
                  className="rounded-lg p-3"
                  style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--c-text-muted)" }}>
                    Message Template
                  </p>
                  <pre
                    className="mt-1.5 max-h-28 overflow-y-auto whitespace-pre-wrap text-[11px] leading-relaxed"
                    style={{ color: "var(--c-text-dim)" }}
                  >
                    {emailData.fullText}
                  </pre>
                  <button
                    type="button"
                    onClick={() => copyText(emailData.fullText, "message")}
                    className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md px-2.5 py-2 text-[11px] font-semibold transition sm:w-auto"
                    style={{ background: "rgba(20, 184, 166, 0.12)", color: "#14b8a6", border: "1px solid rgba(20, 184, 166, 0.2)" }}
                  >
                    {copied === "message" ? <Check size={12} /> : <Copy size={12} />}
                    {copied === "message" ? "Message Copied!" : "Copy Message"}
                  </button>
                </div>
              </div>

              <a
                href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailData.email)}&su=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 transition hover:text-teal-500"
              >
                <Mail size={14} /> Open in Gmail (optional)
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
