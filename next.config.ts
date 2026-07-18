import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Keep large desktop installer out of serverless function traces
  outputFileTracingExcludes: {
    "*": [
      "./public/downloads/**",
      "./scripts/**",
      "./axenflow-ai.zip",
      "./java_v3.zip",
    ],
  },
};

export default nextConfig;
