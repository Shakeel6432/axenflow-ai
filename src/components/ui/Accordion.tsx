"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type FAQItem = { question: string; answer: string };

export function Accordion({ items }: { items: readonly FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.question} className={cn("glass-card overflow-hidden transition-colors", isOpen && "!border-indigo-500/25")}>
            <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left" aria-expanded={isOpen}>
              <span className="font-[var(--font-space)] text-sm font-semibold sm:text-base" style={{ color: "var(--c-heading)" }}>{item.question}</span>
              <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors", isOpen ? "bg-indigo-500/20" : "bg-indigo-500/5")}>
                <ChevronDown size={16} className={cn("text-indigo-500 transition-transform duration-300", isOpen && "rotate-180")} />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <p className="px-6 py-5 text-sm leading-relaxed" style={{ borderTop: "1px solid var(--c-border)", color: "var(--c-text-dim)" }}>{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
