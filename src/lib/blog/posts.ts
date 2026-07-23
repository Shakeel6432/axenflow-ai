export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  keywords: string[];
  readingMinutes: number;
};

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "bulk-phone-validation-csv-guide",
    title: "How to Validate Phone Numbers in Bulk: The CSV Guide Sales Teams Actually Use",
    description:
      "Step by step guide to validating phone numbers in bulk from CSV exports. Clean lists, fix formats, and improve connect rates with AxenFlowAI.",
    publishedAt: "2026-07-23",
    keywords: ["bulk phone validation", "phone validator", "CSV", "E.164", "lead list cleaning"],
    readingMinutes: 9,
  },
];

export function getBlogPost(slug: string) {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

export function getAllBlogSlugs() {
  return BLOG_POSTS.map((p) => p.slug);
}
