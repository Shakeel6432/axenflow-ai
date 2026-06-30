"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { whyChooseUs } from "@/lib/constants";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#818cf8"];

export function WhyChooseUs() {
  return (
    <Section style={{ background: "var(--c-bg-alt)" }} divider>
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            title="Why Work With Us"
            description="We've delivered 86+ projects across 15 countries. What we build actually runs in production, day after day."
            align="left"
            className="mb-10"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {whyChooseUs.map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }} className="glass-card rounded-xl p-5">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-indigo-500/10" style={{ background: `${colors[i]}12` }}>
                  <Image src={item.icon} alt="" width={22} height={22} />
                </div>
                <h3 className="font-[var(--font-space)] mb-1 text-sm font-bold" style={{ color: "var(--c-heading)" }}>{item.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-dim)" }}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="img-frame">
          <div className="img-frame-inner">
            <Image src="/images/about-us/img1.png" alt="AxenFlow team" width={600} height={480} className="w-full object-cover" />
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
