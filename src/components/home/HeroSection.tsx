import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Database,
  Mail,
  Phone,
  Sparkles,
  Wrench,
  MessageCircle,
  Play,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

const highlights = [
  "Free Lead Finder database: search, filter, and export",
  "Email, phone, and WhatsApp validators with bulk CSV",
  "AI Outreach plus desktop scrapers and custom automation",
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
  { href: "/tools/whatsapp-checker", label: "WhatsApp", icon: MessageCircle, color: "#25D366" },
  { href: "/tools/ai-outreach", label: "Outreach", icon: Sparkles, color: "#fbbf24" },
] as const;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 lg:pt-24 lg:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 home-rise"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.14), transparent 55%), radial-gradient(ellipse 50% 40% at 100% 80%, rgba(20,184,166,0.1), transparent 50%)",
        }}
      />

      <Container>
        <div className="grid items-center gap-12 pt-2 lg:grid-cols-12 lg:gap-14 lg:pt-3">
          <div className="relative flex h-full flex-col justify-center pt-3 sm:pt-4 lg:col-span-6 lg:pt-5">
            <div
              className="home-rise home-rise-1 mb-5 inline-flex w-fit max-w-full items-center gap-2.5 self-start rounded-full px-4 py-1.5 text-xs font-semibold"
              style={{
                background: "rgba(20,184,166,0.12)",
                color: "#5eead4",
                border: "1px solid rgba(45,212,191,0.3)",
              }}
            >
              <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
              <Zap size={12} className="text-amber-300" />
              Live free tools on AxenFlow
            </div>

            <p className="home-rise home-rise-2 font-[var(--font-space)] mb-3 text-sm font-bold tracking-[0.18em] uppercase sm:text-base">
              <span className="hero-gradient-text">AxenFlow</span>
            </p>

            <h1
              className="home-rise home-rise-3 font-[var(--font-space)] text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]"
              style={{ color: "var(--c-heading)" }}
            >
              Free leads, live tools,
              <br />
              and systems that
              <br />
              <span className="hero-gradient-text">run on autopilot</span>
            </h1>

            <p
              className="home-rise home-rise-3 mt-6 max-w-lg text-base leading-relaxed sm:text-[1.07rem]"
              style={{ color: "var(--c-text-dim)" }}
            >
              Search our business lead database, validate emails and phones, check WhatsApp numbers, generate AI
              outreach, or download desktop scrapers. Need custom bots and workflows? We build those too.
            </p>

            <div className="home-rise home-rise-4 mt-5 flex flex-wrap gap-2">
              {toolChips.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="home-hover-lift inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold"
                  style={{
                    background: `${chip.color}12`,
                    border: `1px solid ${chip.color}40`,
                    color: "var(--c-heading)",
                  }}
                >
                  <chip.icon size={12} style={{ color: chip.color }} />
                  {chip.label}
                </Link>
              ))}
            </div>

            <ul className="home-rise home-rise-4 mt-6 flex flex-col gap-2.5">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--c-text)" }}>
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 ring-1 ring-teal-400/25">
                    <CheckCircle size={13} className="text-teal-400" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="home-rise home-rise-5 mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
              <Button href="/leads" size="lg">
                Open Lead Finder <ArrowRight size={16} />
              </Button>
              <Button href="/tools" variant="outline" size="lg">
                <Play size={14} className="text-indigo-400" /> Explore Tools
              </Button>
            </div>

            <div className="home-rise home-rise-6 grid grid-cols-3 gap-2.5 pt-8 sm:gap-3">
              {platformCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="glass-card home-hover-lift group block rounded-2xl px-2.5 py-4 text-center sm:px-4 sm:py-5"
                  style={{ boxShadow: `0 0 0 1px ${card.color}18` }}
                >
                  <div
                    className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      background: card.bg,
                      border: `1px solid ${card.color}40`,
                    }}
                  >
                    <card.icon size={18} style={{ color: card.color }} />
                  </div>
                  <p
                    className="font-[var(--font-space)] text-sm font-bold sm:text-base"
                    style={{ color: "var(--c-heading)" }}
                  >
                    {card.title}
                  </p>
                  <p className="mt-0.5 text-[11px] sm:text-xs" style={{ color: "var(--c-text-muted)" }}>
                    {card.label}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          <div className="home-rise home-rise-4 h-full lg:col-span-6">
            <div className="relative h-full min-h-[320px] sm:min-h-[360px] lg:min-h-[420px]">
              <div className="hero-media-shell relative z-10 h-full overflow-hidden rounded-2xl">
                <div className="hero-media-inner relative h-full min-h-[320px] sm:min-h-[360px] lg:min-h-[420px]">
                  <Image
                    src="/images/hero/Img.png"
                    alt="AxenFlow AI automation dashboard"
                    width={680}
                    height={560}
                    sizes="(max-width: 1024px) 100vw, 560px"
                    quality={62}
                    className="relative z-10 h-full min-h-[320px] w-full object-cover object-center sm:min-h-[360px] lg:min-h-[420px]"
                    priority
                  />

                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[11]"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(8,12,24,0.08) 0%, transparent 30%, transparent 60%, rgba(8,12,24,0.45) 100%)",
                    }}
                  />

                  <div className="absolute left-4 top-4 z-20 hidden sm:block">
                    <div
                      className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/90"
                      style={{
                        background: "rgba(8,12,24,0.55)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <Sparkles size={10} className="text-amber-300" />
                      Lead database + live tools
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
