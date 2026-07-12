import Link from "next/link";
import {
  bloodHeroAdminUrls,
  type BloodHeroAdminRoot,
} from "@/lib/bloodhero/admin-paths";

export function BloodHeroAdminSubnav({ root }: { root: BloodHeroAdminRoot }) {
  const u = bloodHeroAdminUrls(root);
  return (
    <nav
      className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-stone-200 pb-3 text-sm dark:border-stone-700"
      aria-label="BloodHero admin sections"
    >
      <Link
        href={u.root}
        className="font-medium text-stone-800 hover:text-accent dark:text-stone-200 dark:hover:text-accent"
      >
        Overview
      </Link>
      <Link
        href={u.pendingDonors}
        className="text-stone-600 hover:text-accent dark:text-stone-400 dark:hover:text-accent"
      >
        Pending donors
      </Link>
      <Link
        href={u.requests}
        className="text-stone-600 hover:text-accent dark:text-stone-400 dark:hover:text-accent"
      >
        Requests
      </Link>
      <Link
        href="/bloodhero"
        className="ml-auto text-muted hover:text-stone-800 hover:underline dark:hover:text-stone-200"
      >
        Public BloodHero
      </Link>
    </nav>
  );
}
