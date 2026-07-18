"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, TrendingUp, Users, Globe2, Play } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { useTheme } from "@/components/ThemeProvider";

const stats = [
  { icon: Users, value: "86+", label: "Projects Done", color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
  { icon: Globe2, value: "15+", label: "Countries", color: "#14b8a6", bg: "rgba(20,184,166,0.1)" },
  { icon: TrendingUp, value: "24/7", label: "Always On", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
];

const highlights = ["Trusted by 86+ businesses", "Delivery in days, not months", "Post-launch support included"];

export function HeroSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative overflow-hidden pt-20 pb-14 lg:pt-24 lg:pb-20">
      {/* Background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Aurora gradient layers */}
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0], scale: [1, 1.1, 0.95, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[200px] left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-indigo-500/[0.07] blur-[160px]"
        />
        <motion.div
          animate={{ x: [0, -25, 15, 0], y: [0, 15, -25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[150px] right-[-100px] h-[500px] w-[600px] rounded-full bg-teal-500/[0.08] blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, 20, -10, 0], y: [0, -15, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-[30%] left-[-100px] h-[450px] w-[450px] rounded-full bg-violet-500/[0.06] blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 0.9, 1], opacity: [0.04, 0.07, 0.03, 0.04] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[8%] right-[8%] h-[350px] w-[350px] rounded-full bg-amber-500/[0.04] blur-[100px]"
        />

        {/* Mesh grid pattern */}
        <svg className="absolute top-0 left-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-mesh" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="0.8" fill="currentColor" />
              <line x1="0" y1="30" x2="60" y2="30" stroke="currentColor" strokeWidth="0.15" />
              <line x1="30" y1="0" x2="30" y2="60" stroke="currentColor" strokeWidth="0.15" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-mesh)" />
        </svg>

        {/* Radial ring */}
        <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] opacity-[0.03]" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="400" cy="400" r="380" stroke="url(#ring-grad)" strokeWidth="0.5" />
          <circle cx="400" cy="400" r="300" stroke="url(#ring-grad)" strokeWidth="0.4" />
          <circle cx="400" cy="400" r="220" stroke="url(#ring-grad)" strokeWidth="0.3" />
          <defs>
            <linearGradient id="ring-grad" x1="0" y1="0" x2="800" y2="800">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
        </svg>

        {/* Gradient crossing lines */}
        <div className="absolute top-[18%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/[0.08] to-transparent" />
        <div className="absolute top-[72%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/[0.06] to-transparent" />
        <div className="absolute top-[45%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/[0.04] to-transparent" />
        <div className="absolute left-[12%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/[0.05] to-transparent" />
        <div className="absolute right-[18%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-teal-500/[0.04] to-transparent" />
        <div className="absolute left-[50%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-violet-500/[0.03] to-transparent" />

        {/* Orbiting shapes */}
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute right-[6%] top-[10%] h-24 w-24 text-indigo-500/[0.06]"
          viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="0.8"
        >
          <rect x="12" y="12" width="72" height="72" rx="20" />
          <rect x="28" y="28" width="40" height="40" rx="10" />
          <rect x="38" y="38" width="20" height="20" rx="5" />
        </motion.svg>

        <motion.svg
          animate={{ rotate: -360 }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute left-[4%] bottom-[15%] h-20 w-20 text-teal-500/[0.07]"
          viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="0.8"
        >
          <circle cx="40" cy="40" r="36" />
          <circle cx="40" cy="40" r="24" />
          <circle cx="40" cy="40" r="12" />
          <circle cx="40" cy="40" r="4" />
        </motion.svg>

        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute right-[28%] bottom-[6%] h-14 w-14 text-amber-500/[0.06]"
          viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="0.8"
        >
          <polygon points="28,4 52,44 4,44" />
          <polygon points="28,16 40,38 16,38" />
        </motion.svg>

        <motion.svg
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute left-[38%] top-[5%] h-12 w-12 text-violet-500/[0.05]"
          viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="0.8"
        >
          <path d="M24 2 L46 24 L24 46 L2 24 Z" />
          <path d="M24 12 L36 24 L24 36 L12 24 Z" />
        </motion.svg>

        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute left-[20%] top-[60%] h-10 w-10 text-indigo-400/[0.05]"
          viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="0.8"
        >
          <path d="M20 2 L28 14 L38 14 L30 24 L34 38 L20 30 L6 38 L10 24 L2 14 L12 14 Z" />
        </motion.svg>

        {/* Floating particles with trail effect */}
        <motion.div animate={{ y: [0, -18, 0], x: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[22%] right-[6%]">
          <div className="h-3 w-3 rounded-full bg-indigo-400/30 shadow-[0_0_12px_rgba(99,102,241,0.3)]" />
        </motion.div>
        <motion.div animate={{ y: [0, 14, 0], x: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-[55%] left-[10%]">
          <div className="h-2.5 w-2.5 rounded-full bg-teal-400/35 shadow-[0_0_10px_rgba(20,184,166,0.3)]" />
        </motion.div>
        <motion.div animate={{ y: [0, -12, 0], x: [0, 5, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute top-[38%] left-[48%]">
          <div className="h-2 w-2 rounded-full bg-amber-400/30 shadow-[0_0_8px_rgba(245,158,11,0.25)]" />
        </motion.div>
        <motion.div animate={{ y: [0, 16, 0], x: [0, -8, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-[22%] right-[18%]">
          <div className="h-2.5 w-2.5 rounded-full bg-violet-400/25 shadow-[0_0_10px_rgba(139,92,246,0.2)]" />
        </motion.div>
        <motion.div animate={{ y: [0, -14, 0], x: [0, 7, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute top-[65%] right-[40%]">
          <div className="h-2 w-2 rounded-full bg-indigo-400/25 shadow-[0_0_8px_rgba(99,102,241,0.2)]" />
        </motion.div>
        <motion.div animate={{ y: [0, 12, 0], x: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }} className="absolute top-[15%] left-[30%]">
          <div className="h-2 w-2 rounded-full bg-teal-400/20 shadow-[0_0_8px_rgba(20,184,166,0.15)]" />
        </motion.div>
        <motion.div animate={{ y: [0, -10, 0], x: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }} className="absolute top-[78%] left-[55%]">
          <div className="h-1.5 w-1.5 rounded-full bg-violet-400/20 shadow-[0_0_6px_rgba(139,92,246,0.15)]" />
        </motion.div>
        <motion.div animate={{ y: [0, 8, 0], x: [0, 4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2.5 }} className="absolute top-[10%] right-[35%]">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400/20 shadow-[0_0_6px_rgba(245,158,11,0.15)]" />
        </motion.div>

        {/* Corner vignettes */}
        <div className="absolute top-0 left-0 h-[300px] w-[300px] bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-transparent" />
        <div className="absolute bottom-0 right-0 h-[300px] w-[300px] bg-gradient-to-tl from-teal-500/[0.04] via-transparent to-transparent" />
        <div className="absolute top-0 right-0 h-[200px] w-[200px] bg-gradient-to-bl from-amber-500/[0.03] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 h-[200px] w-[200px] bg-gradient-to-tr from-violet-500/[0.03] via-transparent to-transparent" />
      </div>

      <Container>
        <div className="grid items-stretch gap-10 lg:grid-cols-12 lg:gap-10">
          {/* Left Content */}
          <motion.div
            className="flex h-full flex-col lg:col-span-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex w-fit max-w-full items-center gap-2 self-start rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{ background: "rgba(99,102,241,0.1)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400 animate-pulse" />
              Available for new projects
            </motion.div>

            <h1 className="font-[var(--font-space)] text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.5rem]" style={{ color: "var(--c-heading)" }}>
              We Build Systems
              <br />
              That Run Your
              <br />
              <span className="relative inline-block mt-1">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-indigo-400 to-teal-400">Business on Autopilot</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                  className="absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 opacity-50"
                />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-7 max-w-md text-base leading-relaxed sm:text-[1.05rem]"
              style={{ color: "var(--c-text-dim)" }}
            >
              Tired of doing the same tasks over and over? We build bots, scrapers, and automated workflows that handle the boring stuff while you focus on growing your business.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 flex flex-col gap-2.5"
            >
              {highlights.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-2.5 text-sm"
                  style={{ color: "var(--c-text)" }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-500/15">
                    <CheckCircle size={13} className="text-teal-500" />
                  </span>
                  {item}
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Button href="/contact" size="lg">Get a Free Quote <ArrowRight size={16} /></Button>
              <Button href="/portfolio" variant="outline" size="lg">
                <Play size={14} className="text-indigo-500" /> See Our Work
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="mt-8 flex items-center gap-4 rounded-2xl px-5 py-3.5"
              style={{ background: "var(--c-hover-bg)", border: "1px solid var(--c-border)" }}
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg" style={{ background: ["#6366f1","#14b8a6","#f59e0b","#818cf8"][n-1], border: "2px solid var(--c-bg)" }}>
                    {["S","A","M","K"][n-1]}
                  </div>
                ))}
              </div>
              <div className="h-8 w-px" style={{ background: "var(--c-border)" }} />
              <div>
                <div className="flex gap-0.5 text-amber-400">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-sm">&#9733;</span>)}
                </div>
                <p className="text-xs font-medium" style={{ color: "var(--c-text-muted)" }}>Rated 5/5 by our clients</p>
              </div>
            </motion.div>

            <div className="mt-auto grid grid-cols-3 gap-3 pt-6">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.12 }}
                  className="glass-card group rounded-xl px-4 py-5 text-center transition-all duration-300"
                >
                  <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110" style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
                    <s.icon size={18} style={{ color: s.color }} />
                  </div>
                  <p className="font-[var(--font-space)] text-2xl font-bold" style={{ color: "var(--c-heading)" }}>{s.value}</p>
                  <p className="mt-0.5 text-xs" style={{ color: "var(--c-text-muted)" }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content */}
          <motion.div
            className="lg:col-span-6 h-full"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative h-full min-h-[340px] lg:min-h-full">
              <div className="absolute -inset-6 z-0 rounded-3xl bg-gradient-to-br from-indigo-500/15 via-teal-500/10 to-violet-500/10 blur-2xl" />

              <motion.div
                className="absolute -top-4 -right-4 z-20 glass-card rounded-xl px-4 py-3 shadow-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/15">
                    <TrendingUp size={14} className="text-teal-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold" style={{ color: "var(--c-heading)" }}>Response Time</p>
                    <p className="text-xs" style={{ color: "var(--c-text-muted)" }}>Under 24 hours</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute -bottom-3 -left-4 z-20 glass-card rounded-xl px-4 py-3 shadow-xl"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15">
                    <CheckCircle size={14} className="text-indigo-500" />
                  </div>
                  <div>
                    <a href="https://www.fiverr.com/shakeel644" target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:text-indigo-500 transition" style={{ color: "var(--c-heading)" }}>Client Rating</a>
                    <p className="text-[11px]" style={{ color: "var(--c-text-muted)" }}>5.0 ★ on Fiverr</p>
                  </div>
                </div>
              </motion.div>

              <div
                className="relative z-10 h-full min-h-[340px] overflow-hidden rounded-2xl lg:min-h-[500px]"
                style={{
                  background: isDark
                    ? "linear-gradient(145deg, #1a1040 0%, #0c2a3a 40%, #0a1628 100%)"
                    : "linear-gradient(145deg, #e8e0f0 0%, #d4eef5 40%, #eef2f7 100%)"
                }}
              >
                <div
                  className="absolute inset-0 z-0"
                  style={{
                    opacity: isDark ? 0.3 : 0.4,
                    background: isDark
                      ? "radial-gradient(circle at 30% 20%, rgba(99,102,241,0.4), transparent 60%), radial-gradient(circle at 70% 80%, rgba(20,184,166,0.3), transparent 50%)"
                      : "radial-gradient(circle at 30% 20%, rgba(99,102,241,0.15), transparent 60%), radial-gradient(circle at 70% 80%, rgba(20,184,166,0.12), transparent 50%)"
                  }}
                />
                <Image
                  src="/images/hero/Img.png"
                  alt="AxenFlow AI automation dashboard"
                  width={680}
                  height={560}
                  className="relative z-10 h-full min-h-[340px] w-full object-cover object-center lg:min-h-[500px]"
                  priority
                />
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
