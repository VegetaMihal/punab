import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/auth";
import {
  canAccessAdminPath,
  defaultAdminHome,
  navLinksForAdminAccess,
} from "@/lib/auth/admin-access";
import { getSessionProfile } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, adminAccess } = await getSessionProfile();
  if (!user) {
    redirect("/login?redirect=/admin");
  }
  if (!isAdmin || !adminAccess) {
    redirect("/dashboard?notice=admin-access");
  }

  const pathname = (await headers()).get("x-pathname") ?? "";
  if (pathname && !canAccessAdminPath(adminAccess, pathname)) {
    redirect(defaultAdminHome(adminAccess));
  }

  const links = navLinksForAdminAccess(adminAccess);

  return (
    <div className="flex min-h-screen flex-col bg-stone-100 dark:bg-stone-950 md:flex-row">
      <aside className="w-full shrink-0 border-b border-stone-200 bg-white md:w-56 md:border-b-0 md:border-r dark:border-stone-800 dark:bg-stone-900">
        <div className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">PUNAB Admin</p>
          <nav className="mt-4 flex flex-col gap-1 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-2 py-1.5 text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 space-y-2 border-t border-stone-200 pt-4 dark:border-stone-800">
            <Link href="/" className="block text-sm text-accent hover:underline">
              ← Public site
            </Link>
            <Link href="/dashboard" className="block text-sm text-muted hover:underline">
              Member dashboard
            </Link>
            <form action={signOut}>
              <button type="submit" className="text-sm text-stone-600 hover:underline dark:text-stone-400">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}

