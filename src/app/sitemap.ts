import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";
import { prisma, isDatabaseConfigured } from "@/lib/db";
import { getAllBlogSlugs } from "@/lib/blog/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/leads",
    "/tools",
    "/tools/email-validator",
    "/tools/phone-validator",
    "/tools/ai-outreach",
    "/blog",
    ...getAllBlogSlugs().map((slug) => `/blog/${slug}`),
    "/bbb-scraper",
    "/bbb-scraper/validate",
    "/bbb-scraper/outreach",
    "/services",
    "/portfolio",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
  ];
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/leads" ? "daily" : "monthly",
    priority:
      route === ""
        ? 1
        : route === "/leads" || route === "/bbb-scraper"
          ? 0.9
          : 0.8,
  }));

  if (!isDatabaseConfigured()) return entries;

  try {
    const [categories, cities, states] = await Promise.all([
      prisma.category.findMany({ select: { slug: true } }),
      prisma.city.findMany({ select: { slug: true } }),
      prisma.state.findMany({ select: { slug: true } }),
    ]);

    for (const category of categories) {
      entries.push({
        url: `${siteConfig.url}/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });

      for (const city of cities) {
        entries.push({
          url: `${siteConfig.url}/${category.slug}-in-${city.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }

      for (const state of states) {
        entries.push({
          url: `${siteConfig.url}/${category.slug}-in-${state.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("Sitemap generation skipped DB routes:", error);
  }

  return entries;
}
