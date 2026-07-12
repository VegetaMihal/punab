import path from "path";
import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";

/**
 * Environment variables are loaded from the app folder and the repo root.
 * This ensures that DATABASE_URL and SUPABASE secrets are available 
 * regardless of where the .env file is stored.
 */
const appDir = path.resolve(process.cwd());
const repoRoot = path.resolve(appDir, "..");
const isDev = process.env.NODE_ENV !== "production";

loadEnvConfig(repoRoot, isDev);
loadEnvConfig(appDir, isDev);

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/gallery", destination: "/archive", permanent: true },
      { source: "/gallery/:slug", destination: "/archive/:slug", permanent: true },
      { source: "/favicon.ico", destination: "/branding/punab-logo-v2.png", permanent: false },
      {
        source: "/july-award-2026/clubs/blood-health/:path*",
        destination: "/july-award-2026/clubs/pharmacy-health/:path*",
        permanent: true,
      },
    ];
  },

  /**
   * Prisma Fix: Prevents "Prisma Client did not initialize yet" by 
   * excluding it from the edge/server bundle.
   */
  serverExternalPackages: [
    "@prisma/client",
    "prisma",
    "@sparticuz/chromium",
    "puppeteer-core",
    "puppeteer",
  ],

  outputFileTracingIncludes: {
    "/api/admin/certificates/[id]/generate-pdf/route": [
      "./node_modules/@sparticuz/chromium/**/*",
      "./node_modules/puppeteer-core/**/*",
    ],
    "/api/admin/invitations/july-memorial-award/pdf/route": [
      "./node_modules/@sparticuz/chromium/**/*",
      "./node_modules/puppeteer-core/**/*",
    ],
    // Proud Privatian Card Studio — served as a static HTML file at /proudprivatian
    "/proudprivatian/route": [
      "./src/components/Privatian/Proud Privatian Card Studio.html",
    ],
  },

  experimental: {
    serverActions: {
      // Gallery batch uploads + hero image via single FormData
      bodySizeLimit: "15mb",
    },
  },

  images: {
    // Bypass Vercel `/_next/image` everywhere — avoids 402 when Image Optimization quota ends; applies to Supabase, leadership-photos, CMS/Wings assets, any https host.
    unoptimized: true,
    qualities: [75, 90, 100],
    remotePatterns: [
      { protocol: "https", hostname: "**", pathname: "/**" },
      { protocol: "http", hostname: "**", pathname: "/**" },
    ],
  },
};

export default nextConfig;