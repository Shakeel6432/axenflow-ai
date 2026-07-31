import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
} from "lucide-react";

export type ValidityBadgeKind = "Valid" | "Invalid" | "Risky" | "Unknown";

export function validityBadgeStyles(badge: ValidityBadgeKind) {
  switch (badge) {
    case "Valid":
      return { bg: "rgba(20,184,166,0.15)", color: "#14b8a6", label: "Valid" };
    case "Invalid":
      return { bg: "rgba(239,68,68,0.15)", color: "#ef4444", label: "Invalid" };
    case "Risky":
      return { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", label: "Risky" };
    default:
      return { bg: "rgba(148,163,184,0.15)", color: "#94a3b8", label: "Unknown" };
  }
}

export function ValidityBadge({ badge }: { badge: ValidityBadgeKind }) {
  const style = validityBadgeStyles(badge);
  return (
    <span
      className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-bold"
      style={{ background: style.bg, color: style.color }}
    >
      {style.label}
    </span>
  );
}

export function CheckRowIcon({
  ok,
  warn,
  bad,
}: {
  ok?: boolean;
  warn?: boolean;
  bad?: boolean;
}) {
  if (bad) return <XCircle size={16} className="shrink-0 text-red-500" />;
  if (warn) return <AlertTriangle size={16} className="shrink-0 text-amber-500" />;
  if (ok) return <CheckCircle2 size={16} className="shrink-0 text-teal-500" />;
  return <HelpCircle size={16} className="shrink-0 text-slate-400" />;
}
