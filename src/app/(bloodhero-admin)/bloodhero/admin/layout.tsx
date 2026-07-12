import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "BloodHero Admin", template: "%s | BloodHero Admin" },
  robots: { index: false, follow: false },
};

/**
 * BloodHero admin routes — intentionally outside `(bloodhero)` so public header/footer/nav are not shown.
 */
export default function BloodHeroAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
      {children}
    </div>
  );
}
