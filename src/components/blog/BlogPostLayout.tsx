import Link from "@/components/ui/AppLink";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import type { BlogPostMeta } from "@/lib/blog/posts";

type BlogPostLayoutProps = {
  post: BlogPostMeta;
  children: React.ReactNode;
};

const DEFAULT_CTA = {
  title: "Explore AxenFlowAI tools",
  description: "Lead database, validators, AI outreach, and desktop scrapers. Free to start.",
  primary: { href: "/tools", label: "Browse Tools" },
  secondary: [
    { href: "/leads", label: "Lead Finder" },
    { href: "/download", label: "Desktop Scrapers" },
  ],
};

export function BlogPostLayout({ post, children }: BlogPostLayoutProps) {
  const cta = post.cta ?? DEFAULT_CTA;

  return (
    <>
      <Section tight className="pt-24 sm:pt-28">
        <Container>
          <div className="mx-auto max-w-3xl">
            <nav aria-label="Breadcrumb" className="text-sm" style={{ color: "var(--c-text-muted)" }}>
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="font-semibold text-indigo-500 hover:text-teal-500">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/blog" className="font-semibold text-indigo-500 hover:text-teal-500">
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="truncate" style={{ color: "var(--c-text-dim)" }}>
                  {post.category || "Guide"}
                </li>
              </ol>
            </nav>
            <p className="mt-4 text-sm" style={{ color: "var(--c-text-muted)" }}>
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
              {" · "}
              {post.readingMinutes} min read
              {post.category ? ` · ${post.category}` : ""}
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
            {post.coverImage ? (
              <figure className="blog-figure mt-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImage}
                  alt={post.coverAlt || post.title}
                  width={1200}
                  height={675}
                  className="h-auto w-full rounded-2xl"
                  loading="eager"
                  decoding="async"
                />
              </figure>
            ) : null}
          </div>
        </Container>
      </Section>

      <Section tight>
        <Container>
          <article
            className="blog-prose mx-auto max-w-3xl space-y-6 text-base leading-relaxed"
            style={{ color: "var(--c-text-dim)" }}
            itemScope
            itemType="https://schema.org/BlogPosting"
          >
            <meta itemProp="headline" content={post.title} />
            <meta itemProp="description" content={post.description} />
            <meta itemProp="datePublished" content={post.publishedAt} />
            {children}
          </article>

          <div
            className="mx-auto mt-12 max-w-3xl rounded-2xl p-6 sm:p-8"
            style={{ border: "1px solid var(--c-border)", background: "var(--c-hover-bg)" }}
          >
            <h2 className="text-lg font-semibold" style={{ color: "var(--c-heading)" }}>
              {cta.title}
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--c-text-dim)" }}>
              {cta.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href={cta.primary.href} variant="green">
                {cta.primary.label}
              </Button>
              {(cta.secondary ?? []).map((item) => (
                <Button key={item.href} href={item.href} variant="outline">
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
