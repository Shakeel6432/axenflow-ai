"use client";

import { motion } from "framer-motion";
import { technologies } from "@/lib/constants";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function TechnologiesSection() {
  return (
    <Section style={{ background: "var(--c-bg-alt)" }} divider>
      <SectionHeading title="Tools & Technologies" description="We pick whatever fits your setup best." />
      <div className="glass-card rounded-2xl p-8 lg:p-10">
        <div className="flex flex-wrap justify-center gap-3">
          {technologies.map((tech, i) => (
            <motion.span key={tech} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.3 }}
              className="rounded-xl px-5 py-3 text-sm font-medium transition-all duration-200 hover:text-indigo-500"
              style={{ border: "1px solid var(--c-border)", color: "var(--c-text-dim)", background: "var(--c-hover-bg)" }}
            >{tech}</motion.span>
          ))}
        </div>
      </div>
    </Section>
  );
}
