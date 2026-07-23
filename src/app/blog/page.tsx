import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: {
    absolute: "AxenFlowAI Blog | Lead Generation, Validation & Automation Guides",
  },
  description:
    "Practical guides on phone validation, email hygiene, AI outreach, scraping, and automation from the AxenFlowAI team.",
  alternates: { canonical: `${siteConfig.url}/blog` },
};

export default function BlogIndexPage() {
  return (
    <>
      <PageHero
        title="AxenFlowAI Blog"
        description="Guides for sales teams, agencies, and developers on lead quality, validation, and outreach automation."
      />
      <Section tight>
        <Container>
          <div className="mx-auto grid max-w-3xl gap-4">
            {BLOG_POSTS.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glass-card block rounded-2xl p-6 transition hover:border-indigo-500/30"
                style={{ border: "1px solid var(--c-border)" }}
              >
                <p className="text-xs uppercase tracking-wide" style={{ color: "var(--c-text-muted)" }}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {" · "}
                  {post.readingMinutes} min read
                </p>
                <h2 className="mt-2 text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
                  {post.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
