"use client";

import { useCallback, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Paperclip, Send, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/contact/Turnstile";

const MAX_FILES = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPT = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip";

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function ContactForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onToken = useCallback((token: string) => setTurnstileToken(token), []);
  const onExpire = useCallback(() => setTurnstileToken(""), []);

  const fileLabel = useMemo(
    () => (files.length ? `${files.length} file${files.length > 1 ? "s" : ""} selected` : "Add PDF, DOC, PNG, JPG, or ZIP"),
    [files.length]
  );

  const onFilesChange = (list: FileList | null) => {
    if (!list?.length) return;
    setErrorMsg("");
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_FILES) {
        setErrorMsg(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        setErrorMsg(`"${file.name}" is over 5MB.`);
        continue;
      }
      if (next.some((f) => f.name === file.name && f.size === file.size)) continue;
      next.push(file);
    }
    setFiles(next.slice(0, MAX_FILES));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setFiles([]);
    setHoneypot("");
    setTurnstileToken("");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const form = new FormData();
      form.set("fullName", fullName);
      form.set("email", email);
      form.set("phone", phone);
      form.set("message", message);
      form.set("website", honeypot);
      form.set("turnstileToken", turnstileToken);
      form.set("cf-turnstile-response", turnstileToken);
      for (const file of files) {
        form.append("attachments", file);
      }

      const res = await fetch("/api/contact", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("success");
      resetForm();
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="glass-card rounded-2xl px-6 py-10 text-center sm:px-8">
        <CheckCircle2 className="mx-auto mb-3 text-teal-500" size={40} />
        <h3 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
          Message sent
        </h3>
        <p className="mt-2 text-sm" style={{ color: "var(--c-text-muted)" }}>
          Thanks. We will respond within 24 hours.
        </p>
        <button
          type="button"
          className="mt-5 text-sm font-semibold text-indigo-500 hover:text-teal-500"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  const busy = status === "loading";

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      encType="multipart/form-data"
      className="glass-card relative w-full space-y-4 rounded-2xl p-5 sm:p-6"
    >
      {status === "error" && (
        <div
          className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0" aria-hidden tabIndex={-1}>
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
            Full Name *
          </label>
          <input
            className="form-input"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={busy}
            autoComplete="name"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
            Email *
          </label>
          <input
            className="form-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            autoComplete="email"
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
          Phone
        </label>
        <input
          className="form-input"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={busy}
          autoComplete="tel"
          placeholder="Optional"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
          Message *
        </label>
        <textarea
          className="form-input min-h-[88px] resize-y"
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={busy}
          placeholder="Tell us about your project..."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold tracking-wide" style={{ color: "var(--c-text-dim)" }}>
          Attachments
          <span className="ml-1 font-normal opacity-70">(optional · max {MAX_FILES} · 5MB each)</span>
        </label>
        <label
          className="flex cursor-pointer flex-col items-start justify-center gap-0.5 rounded-xl border border-dashed px-4 py-3 transition hover:border-indigo-500/50"
          style={{ borderColor: "var(--c-border)", background: "var(--c-hover-bg)" }}
        >
          <div className="flex items-center gap-2">
            <Paperclip size={16} className="text-indigo-500" />
            <span className="text-sm font-medium" style={{ color: "var(--c-heading)" }}>
              {fileLabel}
            </span>
          </div>
          <span className="pl-6 text-xs" style={{ color: "var(--c-text-muted)" }}>
            PDF, DOC, DOCX, PNG, JPG, ZIP · max {MAX_FILES} files
          </span>
          <input
            type="file"
            className="hidden"
            accept={ACCEPT}
            multiple
            disabled={busy || files.length >= MAX_FILES}
            onChange={(e) => {
              onFilesChange(e.target.files);
              e.target.value = "";
            }}
          />
        </label>

        {files.length > 0 && (
          <ul className="mt-2.5 space-y-1.5">
            {files.map((file, i) => (
              <li
                key={`${file.name}-${file.size}-${i}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                style={{ background: "var(--c-hover-bg)", color: "var(--c-text-dim)" }}
              >
                <Paperclip size={12} className="shrink-0 text-indigo-500" />
                <span className="min-w-0 flex-1 truncate font-medium" style={{ color: "var(--c-heading)" }}>
                  {file.name}
                </span>
                <span className="shrink-0 tabular-nums">{formatBytes(file.size)}</span>
                <button
                  type="button"
                  className="rounded p-0.5 text-red-400 transition hover:bg-red-500/10"
                  onClick={() => removeFile(i)}
                  disabled={busy}
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Turnstile action="contact" onToken={onToken} onExpire={onExpire} />

      <Button type="submit" disabled={busy} className="w-full justify-center">
        {busy ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send size={16} /> Send Message
          </>
        )}
      </Button>
    </form>
  );
}
