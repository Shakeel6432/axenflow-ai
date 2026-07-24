import Image from "next/image";
import { whyChooseUs } from "@/lib/constants";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { HomeReveal } from "@/components/home/HomeReveal";

const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#818cf8"];

export function WhyChooseUs() {
  return (
    <Section style={{ background: "var(--c-bg-alt)" }} divider>
      <HomeReveal>
        <SectionHeading
          title="Why Work With Us"
          description="Use our lead database and live tools yourself, or hire the same team to build scrapers, WhatsApp agents, email AI, and workflows for your business."
          align="left"
          className="mb-10 max-w-2xl"
        />
      </HomeReveal>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch lg:gap-8">
        <HomeReveal stagger className="grid min-w-0 gap-4 sm:grid-cols-2">
          {whyChooseUs.map((item, i) => (
            <div key={item.title} className="glass-card home-hover-lift h-full rounded-xl p-5">
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
            </div>
          ))}
        </HomeReveal>

        <HomeReveal className="relative min-h-[280px] w-full lg:min-h-0">
          <div className="relative h-full overflow-hidden rounded-2xl ring-1 ring-indigo-500/20">
            <div className="relative h-full min-h-[280px] overflow-hidden bg-[var(--c-surface-solid)] lg:min-h-full">
              <Image
                src="/images/about-us/img1.png"
                alt="AxenFlow team"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={65}
                className="object-cover object-center"
              />

              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, transparent 55%, rgba(8,12,24,0.55) 100%)",
                }}
              />

              <div className="absolute inset-x-0 bottom-0 z-10 p-4 sm:p-5">
                <div
                  className="flex items-center justify-between gap-3 rounded-xl px-3.5 py-3"
                  style={{
                    background: "rgba(10,14,28,0.72)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <div>
                    <p className="font-[var(--font-space)] text-sm font-bold text-white">AxenFlow team</p>
                    <p className="text-[11px] text-white/70">Leads, tools, scrapers, and custom automation</p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    {["#6366f1", "#14b8a6", "#f59e0b"].map((c) => (
                      <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </HomeReveal>
      </div>
    </Section>
  );
}
