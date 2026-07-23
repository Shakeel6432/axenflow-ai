import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import type { BlogPostMeta } from "@/lib/blog/posts";

type BlogPostLayoutProps = {
  post: BlogPostMeta;
  children: React.ReactNode;
};

export function BlogPostLayout({ post, children }: BlogPostLayoutProps) {
  return (
    <>
      <Section tight className="pt-24 sm:pt-28">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blog"
              className="text-sm font-semibold text-indigo-500 hover:text-teal-500"
            >
              ← Back to Blog
            </Link>
            <p className="mt-4 text-sm" style={{ color: "var(--c-text-muted)" }}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" · "}
              {post.readingMinutes} min read
            </p>
            <h1
              className="mt-3 font-[var(--font-space)] text-3xl font-bold tracking-tight sm:text-4xl"
              style={{ color: "var(--c-heading)" }}
            >
              {post.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--c-text-dim)" }}>
              {post.description}
            </p>
          </div>
        </Container>
      </Section>

      <Section tight>
        <Container>
          <article
            className="blog-prose mx-auto max-w-3xl space-y-6 text-base leading-relaxed"
            style={{ color: "var(--c-text-dim)" }}
          >
            {children}
          </article>

          <div
            className="mx-auto mt-12 max-w-3xl rounded-2xl p-6 sm:p-8"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
          >
            <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
              Validate your phone list free
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
              Upload CSV, detect Mobile vs Landline vs VoIP, and export clean E.164 numbers on
              AxenFlowAI Phone Validator.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href="/tools/phone-validator" variant="green">
                Open Phone Validator
              </Button>
              <Button href="/tools/email-validator" variant="outline">
                Email Validator
              </Button>
              <Button href="/tools/ai-outreach" variant="outline">
                AI Outreach
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
