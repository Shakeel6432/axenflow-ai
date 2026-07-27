import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: {
    absolute: "AxenFlowAI Blog | Business Lead Database, Validation & Outreach Guides",
  },
  description:
    "SEO guides on business lead database search, bulk phone validation, email hygiene, AI outreach, and lead export workflows from AxenFlowAI.",
  keywords: [
    "business lead database",
    "bulk phone validation",
    "lead finder guide",
    "export business leads",
    "AxenFlowAI blog",
  ],
  alternates: { canonical: `${siteConfig.url}/blog` },
  robots: { index: true, follow: true },
};

export default function BlogIndexPage() {
  const posts = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  return (
    <>
      <PageHero
        title="AxenFlowAI Blog"
        description="Guides for sales teams, agencies, and developers on lead quality, validation, and outreach automation."
      />
      <Section tight>
        <Container>
          <div className="mx-auto grid max-w-3xl gap-4">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="glass-card block overflow-hidden rounded-2xl transition hover:border-indigo-500/30"
                style={{ border: "1px solid var(--c-border)" }}
              >
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage}
                    alt={post.coverAlt || post.title}
                    width={1200}
                    height={420}
                    className="h-40 w-full object-cover sm:h-48"
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
                <div className="p-6">
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
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
