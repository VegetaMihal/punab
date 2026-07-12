import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getPublicSettings } from "@/lib/data/site-content";
import { getSessionProfile } from "@/lib/auth/session";
import { getSetting } from "@/lib/site-defaults";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin } = await getSessionProfile();

  const settings = await getPublicSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} isAdmin={isAdmin} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        content={{
          blurb: getSetting(settings, "footer.blurb"),
          address: getSetting(settings, "footer.address"),
          email: getSetting(settings, "footer.email"),
        }}
      />
      <ScrollToTopButton />
    </div>
  );
}
