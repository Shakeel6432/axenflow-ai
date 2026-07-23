import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/constants";
import { getAllBlogSlugs, getBlogPost } from "@/lib/blog/posts";
import { BlogPostLayout } from "@/components/blog/BlogPostLayout";
import { BulkPhoneValidationGuideContent } from "@/components/blog/posts/BulkPhoneValidationGuideContent";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const CONTENT: Record<string, ComponentType> = {
  "bulk-phone-validation-csv-guide": BulkPhoneValidationGuideContent,
};

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: {
      absolute: `${post.title} | AxenFlowAI`,
    },
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: `${siteConfig.url}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `${siteConfig.url}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const Content = CONTENT[slug];
  if (!Content) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.slug}`,
  };

  return (
    <>
      <BlogPostLayout post={post}>
        <Content />
      </BlogPostLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
