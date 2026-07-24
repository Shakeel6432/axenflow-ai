"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#818cf8"];

const platformHighlights = [
  {
    title: "Free Lead Database",
    description:
      "Search business leads by keyword, category, and location. Filter, export CSV/Excel/JSON, and save to your dashboard.",
    href: "/leads",
    icon: "/images/about-us/icon1.svg",
  },
  {
    title: "Email & Phone Validators",
    description:
      "Free online tools for bulk email and phone checks: syntax, DNS/MX, E.164 cleanup, country detection, and CSV export.",
    href: "/tools",
    icon: "/images/about-us/icon2.svg",
  },
  {
    title: "AI Outreach",
    description:
      "Cold emails, phone scripts, and follow-ups for a single lead or full CSV/Excel lists. Ready to send.",
    href: "/tools/ai-outreach",
    icon: "/images/about-us/icon3.svg",
  },
  {
    title: "Desktop Scrapers",
    description:
      "Agency scrapers for fresh leads, plus custom bots and workflows when you need something built for your stack.",
    href: "/download",
    icon: "/images/v3/icon2.svg",
  },
] as const;

export function WhyChooseUs() {
  return (
    <Section style={{ background: "var(--c-bg-alt)" }} divider>
      <SectionHeading
        title="Why Work With Us"
        description="What we serve live on AxenFlow: free lead database, validators, AI outreach, and scrapers. Use the tools yourself, or hire us to automate the rest."
        align="left"
        className="mb-10 max-w-2xl"
      />

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          {platformHighlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="h-full"
            >
              <Link
                href={item.href}
                className="glass-card block h-full rounded-xl p-5 transition-opacity hover:opacity-90"
              >
                <div
                  className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-indigo-500/10"
                  style={{ background: `${colors[i]}12` }}
                >
                  <Image src={item.icon} alt="" width={22} height={22} />
                </div>
                <h3
                  className="font-[var(--font-space)] mb-1 text-sm font-bold"
                  style={{ color: "var(--c-heading)" }}
                >
                  {item.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                  {item.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="relative min-h-[280px] w-full lg:min-h-0"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-4 rounded-[1.75rem] opacity-70 blur-2xl"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(99,102,241,0.28), transparent 55%), radial-gradient(circle at 80% 80%, rgba(20,184,166,0.22), transparent 50%)",
            }}
          />

          <motion.div
            aria-hidden
            animate={{ rotate: [0, 6, -4, 0], scale: [1, 1.04, 0.98, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 rounded-full bg-indigo-500/15 blur-3xl"
          />
          <motion.div
            aria-hidden
            animate={{ rotate: [0, -8, 5, 0], scale: [1, 0.96, 1.05, 1] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="pointer-events-none absolute -bottom-10 -left-8 h-40 w-40 rounded-full bg-teal-500/15 blur-3xl"
          />

          <div
            className="relative h-full overflow-hidden rounded-2xl p-[1.5px]"
            style={{
              background:
                "linear-gradient(140deg, rgba(99,102,241,0.7), rgba(20,184,166,0.45), rgba(245,158,11,0.35), rgba(99,102,241,0.5))",
            }}
          >
            <div className="relative h-full min-h-[280px] overflow-hidden rounded-[14.5px] bg-[var(--c-surface-solid)] lg:min-h-full">
              <Image
                src="/images/about-us/img1.png"
                alt="AxenFlow team"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.03]"
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(8,12,24,0.05) 0%, transparent 35%, transparent 55%, rgba(8,12,24,0.55) 100%)",
                }}
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light"
                style={{
                  background:
                    "radial-gradient(circle at 20% 15%, rgba(99,102,241,0.35), transparent 40%), radial-gradient(circle at 85% 75%, rgba(20,184,166,0.25), transparent 45%)",
                }}
              />

              <svg
                aria-hidden
                className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="why-mesh" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.9" fill="white" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#why-mesh)" />
              </svg>

              <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                <div
                  className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 backdrop-blur-md"
                  style={{
                    background: "rgba(10,14,28,0.55)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div>
                    <p className="font-[var(--font-space)] text-sm font-bold text-white">AxenFlow team</p>
                    <p className="text-[11px] text-white/70">Building leads, tools, and automation</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {["#6366f1", "#14b8a6", "#f59e0b"].map((c) => (
                      <span
                        key={c}
                        className="h-2 w-2 rounded-full"
                        style={{ background: c, boxShadow: `0 0 10px ${c}80` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
