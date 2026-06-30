"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/lib/constants";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const stepColors = [
  { bg: "bg-indigo-500", shadow: "shadow-indigo-500/30" },
  { bg: "bg-teal-500", shadow: "shadow-teal-500/30" },
  { bg: "bg-amber-500", shadow: "shadow-amber-500/30" },
  { bg: "bg-indigo-400", shadow: "shadow-indigo-400/30" },
];

export function ProcessSection() {
  return (
    <Section divider>
      <SectionHeading title="How We Work" description="Simple process, fast delivery, no surprises." />
      <div className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="step-line pointer-events-none absolute left-[12%] right-[12%] top-[2.5rem] hidden lg:block" />
        {processSteps.map((step, i) => (
          <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }} className="glass-card relative rounded-xl p-7 text-center lg:text-left">
            <div className={`mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${stepColors[i].bg} ${stepColors[i].shadow} text-sm font-bold text-white shadow-lg lg:mx-0`}>{step.step}</div>
            <h3 className="font-[var(--font-space)] mb-2 text-base font-bold" style={{ color: "var(--c-heading)" }}>{step.title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>{step.description}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
