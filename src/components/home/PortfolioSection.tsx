"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { portfolioItems } from "@/lib/constants";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export function PortfolioSection() {
  return (
    <Section id="portfolio" style={{ background: "var(--c-bg-alt)" }} divider>
      <SectionHeading title="Recent Projects" description="Real projects, built for real clients, running in production." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {portfolioItems.slice(0, 3).map((item, i) => (
          <motion.article key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="glass-card group overflow-hidden">
            <div className="relative h-52 overflow-hidden">
              <Image src={item.image} alt={item.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, var(--c-bg), transparent)` }} />
              <span className="absolute bottom-4 left-4 rounded-lg bg-indigo-600/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">{item.category}</span>
            </div>
            <div className="p-6">
              <h3 className="font-[var(--font-space)] mb-2 text-base font-bold" style={{ color: "var(--c-heading)" }}>{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>{item.description}</p>
            </div>
          </motion.article>
        ))}
      </div>
      <div className="mt-12 text-center">
        <Button href="/portfolio" variant="outline" size="lg">See All Projects</Button>
      </div>
    </Section>
  );
}
