"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Database,
  Mail,
  Phone,
  Sparkles,
  Wrench,
  Play,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useTheme } from "@/components/ThemeProvider";

const highlights = [
  "Free business lead database you can search today",
  "Email and phone validators online, bulk CSV ready",
  "AI outreach plus desktop scrapers and custom builds",
];

const platformCards = [
  {
    href: "/leads",
    icon: Database,
    title: "Lead Finder",
    label: "Free database",
    color: "#6366f1",
    bg: "rgba(99,102,241,0.12)",
  },
  {
    href: "/tools",
    icon: Sparkles,
    title: "Live Tools",
    label: "Validators + AI",
    color: "#14b8a6",
    bg: "rgba(20,184,166,0.12)",
  },
  {
    href: "/download",
    icon: Wrench,
    title: "Scrapers",
    label: "Desktop apps",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
  },
] as const;

const toolChips = [
  { href: "/leads", label: "Leads", icon: Database, color: "#818cf8" },
  { href: "/tools/email-validator", label: "Email", icon: Mail, color: "#2dd4bf" },
  { href: "/tools/phone-validator", label: "Phone", icon: Phone, color: "#a78bfa" },
  { href: "/tools/ai-outreach", label: "Outreach", icon: Sparkles, color: "#fbbf24" },
] as const;

const sparkles = [
  { top: "12%", left: "18%", delay: 0, size: 2.5 },
  { top: "28%", left: "72%", delay: 0.6, size: 2 },
  { top: "62%", left: "8%", delay: 1.2, size: 3 },
  { top: "78%", left: "58%", delay: 1.8, size: 2 },
  { top: "44%", left: "88%", delay: 0.9, size: 2.5 },
  { top: "16%", left: "42%", delay: 1.4, size: 1.5 },
  { top: "86%", left: "28%", delay: 0.3, size: 2 },
  { top: "52%", left: "36%", delay: 2.1, size: 1.5 },
] as const;

export function HeroSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-24 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, -25, 0], y: [0, -28, 14, 0], scale: [1, 1.14, 0.94, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[220px] left-1/2 h-[780px] w-[1200px] -translate-x-1/2 rounded-full bg-indigo-500/[0.12] blur-[170px]"
        />
        <motion.div
          animate={{ x: [0, -30, 18, 0], y: [0, 20, -28, 0] }}
          transition={{ duration: 19, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute -bottom-[180px] right-[-120px] h-[560px] w-[680px] rounded-full bg-teal-500/[0.13] blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, 24, -14, 0], y: [0, -18, 22, 0] }}
          transition={{ duration: 21, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-[26%] left-[-120px] h-[500px] w-[500px] rounded-full bg-violet-500/[0.09] blur-[130px]"
        />
        <motion.div
          animate={{ scale: [1, 1.25, 0.88, 1], opacity: [0.05, 0.11, 0.04, 0.05] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[6%] right-[6%] h-[380px] w-[380px] rounded-full bg-amber-500/[0.07] blur-[110px]"
        />

        <svg className="absolute inset-0 h-full w-full opacity-[0.05]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-mesh" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
              <circle cx="28" cy="28" r="0.9" fill="currentColor" />
              <line x1="0" y1="28" x2="56" y2="28" stroke="currentColor" strokeWidth="0.12" />
              <line x1="28" y1="0" x2="28" y2="56" stroke="currentColor" strokeWidth="0.12" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-mesh)" />
        </svg>

        <motion.div
          animate={{ opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/40 to-transparent"
        />
        <motion.div
          animate={{ opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[68%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/35 to-transparent"
        />

        {sparkles.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              background:
                i % 3 === 0 ? "rgba(129,140,248,0.7)" : i % 3 === 1 ? "rgba(45,212,191,0.7)" : "rgba(251,191,36,0.65)",
              boxShadow:
                i % 3 === 0
                  ? "0 0 12px rgba(129,140,248,0.65)"
                  : i % 3 === 1
                    ? "0 0 12px rgba(45,212,191,0.55)"
                    : "0 0 12px rgba(251,191,36,0.5)",
            }}
            animate={{ y: [0, -14, 0], opacity: [0.35, 1, 0.35], scale: [1, 1.35, 1] }}
            transition={{ duration: 3.2 + i * 0.25, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
          />
        ))}

        <div className="absolute left-0 top-0 h-[360px] w-[360px] bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] bg-gradient-to-tl from-teal-500/[0.07] via-transparent to-transparent" />
      </div>

      <Container>
        <div className="grid items-center gap-12 pt-2 lg:grid-cols-12 lg:gap-14 lg:pt-3">
          <motion.div
            className="relative flex h-full flex-col justify-center pt-3 sm:pt-4 lg:col-span-6 lg:pt-5"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-5 inline-flex w-fit max-w-full items-center gap-2.5 self-start rounded-full px-4 py-1.5 text-xs font-semibold shadow-[0_0_32px_rgba(20,184,166,0.2)]"
              style={{
                background:
                  "linear-gradient(105deg, rgba(20,184,166,0.18), rgba(99,102,241,0.14), rgba(245,158,11,0.08))",
                color: "#5eead4",
                border: "1px solid rgba(45,212,191,0.35)",
              }}
            >
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal-400" />
              </span>
              <Zap size={12} className="text-amber-300" />
              Live free tools on AxenFlow
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="font-[var(--font-space)] mb-3 text-sm font-bold tracking-[0.18em] uppercase sm:text-base"
            >
              <span className="hero-gradient-text">AxenFlow</span>
            </motion.p>

            <h1
              className="font-[var(--font-space)] text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]"
              style={{ color: "var(--c-heading)" }}
            >
              Free leads, live tools,
              <br />
              and systems that
              <br />
              <span className="relative mt-1 inline-block">
                <span className="hero-gradient-text relative z-10">run on autopilot</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.7, duration: 0.7, ease: "easeOut" }}
                  className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-indigo-500 via-teal-400 to-amber-400 opacity-80 shadow-[0_0_16px_rgba(45,212,191,0.5)]"
                />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 max-w-lg text-base leading-relaxed sm:text-[1.07rem]"
              style={{ color: "var(--c-text-dim)" }}
            >
              Search our business lead database, validate emails and phones, generate AI outreach, or grab
              desktop scrapers. Need custom bots and workflows? We build those too.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="mt-5 flex flex-wrap gap-2"
            >
              {toolChips.map((chip, i) => (
                <motion.div
                  key={chip.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                >
                  <Link
                    href={chip.href}
                    className="hero-chip group inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: `linear-gradient(135deg, ${chip.color}14, transparent)`,
                      border: `1px solid ${chip.color}44`,
                      color: "var(--c-heading)",
                      animationDelay: `${i * 0.4}s`,
                    }}
                  >
                    <chip.icon size={12} style={{ color: chip.color }} />
                    {chip.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.48 }}
              className="mt-6 flex flex-col gap-2.5"
            >
              {highlights.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.52 + i * 0.08 }}
                  className="group flex items-center gap-2.5 text-sm"
                  style={{ color: "var(--c-text)" }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/15 ring-1 ring-teal-400/25 shadow-[0_0_12px_rgba(45,212,191,0.2)] transition-transform group-hover:scale-110">
                    <CheckCircle size={13} className="text-teal-400" />
                  </span>
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.62 }}
              className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4"
            >
              <div className="hero-cta-glow">
                <Button href="/leads" size="lg" className="shadow-[0_14px_44px_rgba(99,102,241,0.35)]">
                  Open Lead Finder <ArrowRight size={16} />
                </Button>
              </div>
              <Button href="/tools" variant="outline" size="lg">
                <Play size={14} className="text-indigo-400" /> Explore Tools
              </Button>
            </motion.div>

            <div className="grid grid-cols-3 gap-2.5 pt-8 sm:gap-3">
              {platformCards.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.68 + i * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <Link
                    href={card.href}
                    className="glass-card group relative block overflow-hidden rounded-2xl px-2.5 py-4 text-center transition-all duration-300 sm:px-4 sm:py-5"
                    style={{
                      boxShadow: `0 0 0 1px ${card.color}18`,
                    }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(135deg, ${card.color}33, transparent 55%)`,
                      }}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${card.color}28, transparent 70%)`,
                      }}
                    />
                    <div
                      className="relative mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                      style={{
                        background: card.bg,
                        border: `1px solid ${card.color}40`,
                        boxShadow: `0 0 18px ${card.color}22`,
                      }}
                    >
                      <card.icon size={18} style={{ color: card.color }} />
                    </div>
                    <p
                      className="font-[var(--font-space)] relative text-sm font-bold sm:text-base"
                      style={{ color: "var(--c-heading)" }}
                    >
                      {card.title}
                    </p>
                    <p className="relative mt-0.5 text-[11px] sm:text-xs" style={{ color: "var(--c-text-muted)" }}>
                      {card.label}
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="h-full lg:col-span-6"
            initial={{ opacity: 0, x: 32, rotateY: -6 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.9, delay: 0.22 }}
            style={{ perspective: 1200 }}
          >
            <div className="relative h-full min-h-[380px] lg:min-h-full">
              <div className="absolute -inset-10 z-0 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/25 via-teal-500/15 to-amber-500/12 blur-3xl" />
              <motion.div
                aria-hidden
                animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.05, 1] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-8 z-0 rounded-full bg-indigo-500/20 blur-3xl"
              />

              <div className="hero-orbit-ring hidden sm:block">
                <span className="hero-orbit-dot" />
              </div>
              <div className="hero-orbit-ring hero-orbit-ring-2 hidden sm:block">
                <span className="hero-orbit-dot hero-orbit-dot-teal" />
              </div>

              <motion.div
                className="hero-float-card absolute -right-2 -top-3 z-30 sm:-right-5 sm:-top-5"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
              >
                <Link
                  href="/leads"
                  className="glass-card flex items-center gap-2.5 rounded-2xl px-3.5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-teal-400/20 transition-transform hover:-translate-y-1 sm:px-4"
                >
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/15 ring-1 ring-teal-400/30">
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.9)]" />
                    <Database size={15} className="text-teal-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--c-heading)" }}>
                      Free Lead Database
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--c-text-muted)" }}>
                      Search and export live
                    </p>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                className="hero-float-card hero-float-card-delay absolute -left-2 top-[40%] z-30 sm:-left-5"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                <Link
                  href="/tools/phone-validator"
                  className="glass-card flex items-center gap-2.5 rounded-2xl px-3.5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-indigo-400/20 transition-transform hover:-translate-y-1 sm:px-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/30">
                    <Phone size={15} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--c-heading)" }}>
                      Phone Validator
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--c-text-muted)" }}>
                      Free bulk checks
                    </p>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                className="hero-float-card hero-float-card-delay-2 absolute -bottom-2 -right-2 z-30 sm:-bottom-4 sm:-right-5"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.15 }}
              >
                <Link
                  href="/tools/ai-outreach"
                  className="glass-card flex items-center gap-2.5 rounded-2xl px-3.5 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-amber-400/20 transition-transform hover:-translate-y-1 sm:px-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/30">
                    <Sparkles size={15} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--c-heading)" }}>
                      AI Outreach
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--c-text-muted)" }}>
                      Scripts in seconds
                    </p>
                  </div>
                </Link>
              </motion.div>

              <motion.div
                className="hero-media-shell relative z-10 h-full min-h-[380px] overflow-hidden rounded-2xl lg:min-h-full"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              >
                <div
                  className="hero-media-inner relative h-full min-h-[380px] lg:min-h-full"
                  style={{
                    background: isDark
                      ? "linear-gradient(145deg, #1a1040 0%, #0c2a3a 40%, #0a1628 100%)"
                      : "linear-gradient(145deg, #e8e0f0 0%, #d4eef5 40%, #eef2f7 100%)",
                  }}
                >
                  <motion.div
                    aria-hidden
                    animate={{ opacity: [0.35, 0.65, 0.35], scale: [1, 1.08, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 z-0"
                    style={{
                      background: isDark
                        ? "radial-gradient(circle at 26% 16%, rgba(99,102,241,0.55), transparent 55%), radial-gradient(circle at 80% 84%, rgba(20,184,166,0.42), transparent 50%), radial-gradient(circle at 50% 50%, rgba(245,158,11,0.12), transparent 60%)"
                        : "radial-gradient(circle at 26% 16%, rgba(99,102,241,0.22), transparent 55%), radial-gradient(circle at 80% 84%, rgba(20,184,166,0.18), transparent 50%)",
                    }}
                  />

                  <Image
                    src="/images/hero/Img.png"
                    alt="AxenFlow AI automation dashboard"
                    width={680}
                    height={560}
                    className="relative z-10 h-full min-h-[380px] w-full object-cover object-center lg:min-h-full"
                    priority
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[11]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(8,12,24,0.12) 0%, transparent 28%, transparent 55%, rgba(8,12,24,0.55) 100%)",
                    }}
                  />

                  <div className="hero-shine" />
                  <div className="hero-scan-line" />

                  <div className="absolute left-4 top-4 z-20 hidden sm:block">
                    <div
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/90 backdrop-blur-md"
                      style={{
                        background: "rgba(8,12,24,0.45)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <Sparkles size={10} className="text-amber-300" />
                      Automation hub
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
