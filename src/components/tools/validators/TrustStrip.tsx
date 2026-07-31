import type { LucideIcon } from "lucide-react";

export function TrustStrip({
  items,
}: {
  items: readonly { icon: LucideIcon; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold"
          style={{
            background: "var(--c-hover-bg)",
            color: "var(--c-text-dim)",
            border: "1px solid var(--c-border)",
          }}
        >
          <Icon size={12} className="text-indigo-400" />
          {label}
        </span>
      ))}
    </div>
  );
}
