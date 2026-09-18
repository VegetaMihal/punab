import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/auth";
import { getSessionProfile } from "@/lib/auth/session";

export default async function OrgPortalAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, adminAccess } = await getSessionProfile();
  if (!user) {
    redirect("/login?redirect=/portal/admin/forums");
  }
  if (profile?.first_login_required) {
    redirect("/auth/change-password");
  }
  if (!adminAccess?.canOrgPortal) {
    redirect("/dashboard?notice=org-portal-access");
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 dark:bg-stone-950 md:flex-row">
      <aside className="w-full shrink-0 border-b border-stone-200 bg-white md:w-56 md:border-b-0 md:border-r dark:border-stone-800 dark:bg-stone-900">
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">PUNAB Org Portal</p>
          <nav className="mt-4 flex flex-col gap-1 text-sm">
            <Link href="/portal/admin" className="rounded-md px-2 py-1.5 text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
              Dashboard
            </Link>
            <Link href="/portal/admin/forums" className="rounded-md px-2 py-1.5 text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
              Forums
            </Link>
            <Link href="/portal/reporter/members" className="rounded-md px-2 py-1.5 text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
              Members
            </Link>
            <Link href="/portal/admin/promotions" className="rounded-md px-2 py-1.5 text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
              Promotions
            </Link>
            <Link href="/portal/admin/audit" className="rounded-md px-2 py-1.5 text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
              Activity log
            </Link>
            <Link href="/portal/admin/settings" className="rounded-md px-2 py-1.5 text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800">
              Settings
            </Link>
          </nav>
        </div>
        <div className="border-t border-stone-200 p-4 dark:border-stone-800">
          <Link href="/admin/members" className="mb-2 block text-sm text-accent hover:underline">
            ← Member Approvals
          </Link>
          <p className="mb-2 truncate text-xs text-muted">{user.email}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-md border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
