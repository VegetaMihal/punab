import Link from "next/link";
import { BloodHeroAdminSubnav } from "@/components/bloodhero/BloodHeroAdminSubnav";
import { BLOODHERO_ADMIN_PUNAB_ROOT } from "@/lib/bloodhero/admin-paths";

export default function AdminBloodHeroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">BloodHero</p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-50">Coordinator tools</h1>
        <p className="mt-1 text-sm text-muted">
          Same tools as{" "}
          <Link href="/bloodhero/admin" className="text-accent hover:underline">
            /bloodhero/admin
          </Link>{" "}
          (BloodHero-only staff still use that URL).
        </p>
      </div>
      <BloodHeroAdminSubnav root={BLOODHERO_ADMIN_PUNAB_ROOT} />
      {children}
    </div>
  );
}
