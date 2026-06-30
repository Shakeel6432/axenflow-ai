"use client";

import { motion } from "framer-motion";
import { Heart, Home, ShoppingCart, DollarSign, BarChart3, GraduationCap, Truck, Rocket } from "lucide-react";
import { industries } from "@/lib/constants";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const data: Record<string, { Icon: typeof Heart; bg: string; color: string }> = {
  Healthcare: { Icon: Heart, bg: "bg-indigo-500/10", color: "#6366f1" },
  "Real Estate": { Icon: Home, bg: "bg-teal-500/10", color: "#14b8a6" },
  "E-commerce": { Icon: ShoppingCart, bg: "bg-amber-500/10", color: "#f59e0b" },
  Finance: { Icon: DollarSign, bg: "bg-indigo-500/10", color: "#6366f1" },
  Marketing: { Icon: BarChart3, bg: "bg-teal-500/10", color: "#14b8a6" },
  Education: { Icon: GraduationCap, bg: "bg-amber-500/10", color: "#f59e0b" },
  Logistics: { Icon: Truck, bg: "bg-indigo-500/10", color: "#6366f1" },
  Startups: { Icon: Rocket, bg: "bg-teal-500/10", color: "#14b8a6" },
};

export function IndustriesSection() {
  return (
    <Section divider>
      <SectionHeading title="Industries We Serve" description="We work with businesses of all sizes including clinics, e-commerce brands, agencies, startups, and more." />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {industries.map((industry, i) => {
          const d = data[industry] ?? { Icon: Rocket, bg: "bg-indigo-500/10", color: "#6366f1" };
          return (
            <motion.div key={industry} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4 }} className="glass-card group flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${d.bg} transition-transform duration-300 group-hover:scale-110`}>
                <d.Icon size={24} style={{ color: d.color }} strokeWidth={1.8} />
              </div>
              <span className="font-[var(--font-space)] text-sm font-semibold" style={{ color: "var(--c-heading)" }}>{industry}</span>
            </motion.div>
          );
        })}
      </div>
    </Section>
  );
}
