"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
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
  /** Show search box when list is long (default: auto if 20+ options) */
  searchable?: boolean;
};

export function GlassSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled = false,
  className,
  "aria-label": ariaLabel,
  searchable,
}: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const showSearch = searchable ?? options.length >= 20;
  const selected = options.find((o) => o.value === value);
  const label = selected?.label || placeholder;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, query]);

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

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    if (showSearch) {
      const t = window.setTimeout(() => searchRef.current?.focus(), 0);
      return () => window.clearTimeout(t);
    }
  }, [open, showSearch]);

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
        <div className="glass-select-menu absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl">
          {showSearch && (
            <div className="border-b p-2" style={{ borderColor: "var(--c-border)" }}>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                style={{
                  border: "1px solid var(--c-border)",
                  background: "var(--c-hover-bg)",
                  color: "var(--c-heading)",
                }}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <ul
            id={listId}
            role="listbox"
            className="max-h-60 overflow-auto p-1.5"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2.5 text-sm" style={{ color: "var(--c-text-muted)" }}>
                No matches
              </li>
            )}
            {filtered.map((opt) => {
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
        </div>
      )}
    </div>
  );
}
