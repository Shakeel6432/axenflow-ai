import type { Metadata } from "next";
import Image from "next/image";
import { whyChooseUs, processSteps } from "@/lib/constants";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About Us | Meet the Team Behind AxenFlow AI",
  description:
    "AxenFlow AI is an automation agency with 86+ projects delivered across 15+ countries. We build bots, scrapers, and workflows that actually work in production.",
  alternates: { canonical: "https://www.axenflowai.com/about" },
};

const colors = ["#6366f1", "#14b8a6", "#f59e0b", "#818cf8"];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="About Us"
        description="A small team that's really good at automating things for businesses."
      />
      <Section tight>
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div>
            <p className="text-sm leading-relaxed sm:text-base" style={{ color: "var(--c-text-dim)" }}>
              AxenFlow AI started because we saw businesses wasting hours on tasks that could easily be
              automated. We&apos;ve been building bots, scrapers, and workflows ever since for clients in
              the US, UK, UAE, and across Europe.
            </p>
            <p className="mt-4 text-sm leading-relaxed sm:text-base" style={{ color: "var(--c-text-dim)" }}>
              We use tools like OpenAI, Claude, n8n, Make.com, Python, and Node.js. But honestly, the
              tool doesn&apos;t matter as much as understanding what your business actually needs.
            </p>
            <Button href="/contact" size="lg" className="mt-8">
              Work With Us
            </Button>
          </div>

          <div className="mx-auto w-full max-w-[460px] sm:max-w-[500px] lg:mx-0 lg:justify-self-end">
            <div className="img-frame">
              <div className="img-frame-inner aspect-[3/4]">
                <Image
                  src="/images/v1/about-thumb1.png"
                  alt="AxenFlow AI team"
                  width={500}
                  height={667}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-24 sm:mt-28 lg:mt-32">
          <SectionHeading title="What Makes Us Different" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseUs.map((item, i) => (
              <div key={item.title} className="glass-card rounded-xl p-4 text-center">
                <div
                  className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-indigo-500/10"
                  style={{ background: `${colors[i]}12` }}
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
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
          </div>
        </div>

        <div className="mt-12 sm:mt-14">
          <SectionHeading title="Our Process" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <div key={step.step} className="glass-card rounded-xl p-4">
                <span
                  className="font-[var(--font-space)] text-xl font-bold"
                  style={{ color: colors[i] }}
                >
                  {step.step}
                </span>
                <h3
                  className="font-[var(--font-space)] mt-1.5 text-sm font-bold"
                  style={{ color: "var(--c-heading)" }}
                >
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed sm:text-sm" style={{ color: "var(--c-text-dim)" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </>
  );
}
