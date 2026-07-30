import type { ComponentType } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { siteConfig } from "@/lib/constants";
import {
  BLOG_SLUG_REDIRECTS,
  getAllBlogSlugs,
  getBlogPost,
} from "@/lib/blog/posts";
import { BlogPostLayout } from "@/components/blog/BlogPostLayout";
import { BulkPhoneValidationGuideContent } from "@/components/blog/posts/BulkPhoneValidationGuideContent";
import { BulkEmailValidationGuideContent } from "@/components/blog/posts/BulkEmailValidationGuideContent";
import { AiOutreachGuideContent } from "@/components/blog/posts/AiOutreachGuideContent";
import { BbbScraperGuideContent } from "@/components/blog/posts/BbbScraperGuideContent";
import { LeadDatabaseGuideContent } from "@/components/blog/posts/LeadDatabaseGuideContent";
import { CsvExcelConverterGuideContent } from "@/components/blog/posts/CsvExcelConverterGuideContent";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const CONTENT: Record<string, ComponentType> = {
  csvexcelconverter: CsvExcelConverterGuideContent,
  bulkphonevalidation: BulkPhoneValidationGuideContent,
  bulkemailvalidation: BulkEmailValidationGuideContent,
  aioutreach: AiOutreachGuideContent,
  bbbscraper: BbbScraperGuideContent,
  businessleaddatabase: LeadDatabaseGuideContent,
};

export function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = BLOG_SLUG_REDIRECTS[rawSlug] || rawSlug;
  const post = getBlogPost(slug);
  if (!post) return {};

  const url = `${siteConfig.url}/blog/${post.slug}`;
  const imageUrl = post.coverImage ? `${siteConfig.url}${post.coverImage}` : undefined;

  return {
    title: {
      absolute: `${post.title} | ${siteConfig.name}`,
    },
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    category: post.category,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [siteConfig.name],
      section: post.category,
      tags: post.keywords,
      ...(imageUrl
        ? {
            images: [
              {
                url: imageUrl,
                width: 1200,
                height: 675,
                alt: post.coverAlt || post.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;

  if (BLOG_SLUG_REDIRECTS[rawSlug]) {
    redirect(`/blog/${BLOG_SLUG_REDIRECTS[rawSlug]}`);
  }

  const post = getBlogPost(rawSlug);
  if (!post) notFound();

  const Content = CONTENT[rawSlug];
  if (!Content) notFound();

  const pageUrl = `${siteConfig.url}/blog/${post.slug}`;
  const imageUrl = post.coverImage ? `${siteConfig.url}${post.coverImage}` : undefined;

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    inLanguage: "en-US",
    keywords: post.keywords.join(", "),
    articleSection: post.category || "Guides",
    wordCount: post.readingMinutes * 180,
    timeRequired: `PT${post.readingMinutes}M`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
    author: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/images/logo/new-logo.png`,
      },
    },
    ...(imageUrl
      ? {
          image: {
            "@type": "ImageObject",
            url: imageUrl,
            width: 1200,
            height: 675,
          },
        }
      : {}),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteConfig.url}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: pageUrl,
      },
    ],
  };

  const faqSchema =
    post.faqs && post.faqs.length
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  const graph = [blogPosting, breadcrumb, ...(faqSchema ? [faqSchema] : [])];

  return (
    <>
      <BlogPostLayout post={post}>
        <Content />
      </BlogPostLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
    </>
  );
}
