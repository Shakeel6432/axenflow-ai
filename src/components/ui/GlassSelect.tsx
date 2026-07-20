"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type GlassSelectOption = {
  value: string;
  label: string;
};

type GlassSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: GlassSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function GlassSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className,
  "aria-label": ariaLabel,
}: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);
  const label = selected?.label || placeholder;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  return (
    <div ref={rootRef} className={cn("glass-select relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        className={cn(
          "form-input glass-select-trigger flex w-full items-center justify-between gap-2 text-left",
          open && "glass-select-trigger-open",
          disabled && "cursor-not-allowed opacity-55"
        )}
        onClick={() => {
          if (!disabled) setOpen((v) => !v);
        }}
      >
        <span className={cn("truncate", !selected && "opacity-70")} style={{ color: "var(--c-heading)" }}>
          {label}
        </span>
        <ChevronDown
          size={16}
          className={cn("shrink-0 transition-transform duration-200", open && "rotate-180")}
          style={{ color: "var(--c-text-muted)" }}
        />
      </button>

      {open && !disabled && (
        <ul
          id={listId}
          role="listbox"
          className="glass-select-menu absolute left-0 right-0 z-50 mt-2 max-h-60 overflow-auto rounded-xl p-1.5"
        >
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <li key={`${opt.value}::${opt.label}`} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={cn(
                    "glass-select-option flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition",
                    active && "glass-select-option-active"
                  )}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span className="truncate">{opt.label}</span>
                  {active && <Check size={14} className="shrink-0 text-indigo-400" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
