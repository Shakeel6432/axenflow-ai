import { ShieldCheck } from "lucide-react";

export function PrivacyBadge() {
  return (
    <div
      className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
      style={{
        background: "rgba(20,184,166,0.1)",
        border: "1px solid rgba(45,212,191,0.28)",
        color: "var(--c-text-dim)",
      }}
    >
      <ShieldCheck className="mt-0.5 shrink-0 text-teal-400" size={18} />
      <p>
        <span className="font-semibold" style={{ color: "var(--c-heading)" }}>
          100% private · browser-only.{" "}
        </span>
        Files are processed entirely in your browser. Nothing is uploaded to our servers.
      </p>
    </div>
  );
}
