import { getSiteSettingsMap } from "@/lib/repositories/site-settings-repository";
import { OrgSettingsForm } from "@/components/org/OrgSettingsForm";

export const metadata = { title: "Settings — Org Portal" };

export default async function OrgSettingsPage() {
  const settings = await getSiteSettingsMap();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-2 text-xl font-semibold text-stone-900 dark:text-stone-100">Rules &amp; numbers</h1>
      <p className="mb-6 text-sm text-muted">
        These control how the whole system behaves — deadlines, scoring, and promotion rules. Most people never need
        to change these. Only edit if you know what you&apos;re changing.
      </p>
      <OrgSettingsForm settings={settings} />
    </div>
  );
}
