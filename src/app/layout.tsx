import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ToasterProvider } from "@/components/providers/toaster";
import { BrandCursor } from "@/components/ui/BrandCursor";
import { PageProgress } from "@/components/ui/PageProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const supabaseHost = (() => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return null;
  }
})();

export const metadata: Metadata = {
  title: {
    default: "PUNAB — Private University National Association of Bangladesh",
    template: "%s | PUNAB",
  },
  description:
    "National association for students, teachers, and alumni of Bangladesh's private universities—membership, chapters, events, and official notices.",
  icons: {
    icon: [
      { url: "/branding/punab-logo-v2.png", type: "image/png", sizes: "32x32" },
      { url: "/branding/punab-logo-v2.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: [{ url: "/branding/punab-logo-v2.png", type: "image/png" }],
    apple: [{ url: "/branding/punab-logo-v2.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-theme="light"
      className={`light ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {supabaseHost ? (
          <>
            <link rel="dns-prefetch" href={`https://${supabaseHost}`} />
            <link rel="preconnect" href={`https://${supabaseHost}`} crossOrigin="" />
          </>
        ) : null}
      </head>
      <body className="min-h-full bg-(--color-surface) font-sans text-foreground">
        <Suspense fallback={null}>
          <PageProgress />
        </Suspense>
        <Suspense fallback={null}>
          <BrandCursor />
        </Suspense>
        {children}
        <ToasterProvider />
      </body>
    </html>
  );
}
