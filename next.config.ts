import type { NextConfig } from "next";
import path from "node:path";

const webpackCacheDir =
  process.env.NEXT_WEBPACK_CACHE_DIR?.trim() ||
  (process.platform === "win32" && path.parse(process.cwd()).root.toUpperCase() === "C:\\"
    ? "Z:/cursor-cache/axenflow-ai-webpack"
    : undefined);

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Google Analytics (gtag) + Cloudflare Turnstile
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com",
      // GA4 beacons + Supabase + Turnstile
      "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
      "frame-src 'self' https://challenges.cloudflare.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  // Tree-shake heavy icon / motion import surfaces in client chunks
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Keep large desktop installer out of serverless function traces
  outputFileTracingExcludes: {
    "*": ["./public/downloads/**", "./scripts/**", "./axenflow-ai.zip", "./java_v3.zip"],
  },
  async redirects() {
    return [
      {
        source: "/blog/bulk-phone-validation-csv-guide",
        destination: "/blog/bulkphonevalidation",
        permanent: true,
      },
      {
        source: "/blog/lead-database-search-export-guide",
        destination: "/blog/businessleaddatabase",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config, { dev }) => {
    // Keep dev webpack cache off C: when Z: is available (avoids ENOSPC on full system drive)
    if (dev && webpackCacheDir) {
      config.cache = {
        type: "filesystem",
        cacheDirectory: webpackCacheDir,
      };
    }
    return config;
  },
};

export default nextConfig;
