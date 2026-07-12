import { SiteContentForm } from "@/components/admin/SiteContentForm";
import { getSiteSettingsMap } from "@/lib/repositories/site-settings-repository";
import { SITE_DEFAULTS } from "@/lib/site-defaults";

export const metadata = {
  title: "Site content",
};

export default async function AdminSiteContentPage() {
  let map: Record<string, string> = { ...SITE_DEFAULTS };
  try {
    map = await getSiteSettingsMap();
  } catch {
    /* offline / misconfigured DATABASE_URL */
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Site content</h1>
      <p className="mt-1 text-sm text-muted">
        Editable copy for the public site. Changes apply after save; the homepage and key pages revalidate
        automatically.
      </p>
      <div className="mt-8">
        <SiteContentForm initialValues={map} />
      </div>
    </div>
  );
}
