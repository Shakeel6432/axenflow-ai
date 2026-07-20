import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/admin/", "/signin", "/signup", "/forgot-password", "/reset-password", "/verify-email"],
      },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "CCBot",
          "Bytespider",
          "PetalBot",
          "AhrefsBot",
          "SemrushBot",
          "DotBot",
          "Scrapy",
        ],
        disallow: "/",
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
