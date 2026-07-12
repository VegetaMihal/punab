import Link from "next/link";
import { signOut } from "@/actions/auth";
import { getSessionProfile } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getSessionProfile();

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            PUNAB
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/dashboard" className="rounded-md px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800">
              Overview
            </Link>
            <Link href="/dashboard/profile" className="rounded-md px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800">
              Profile
            </Link>
            <Link href="/join" className="rounded-md px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800">
              Membership
            </Link>
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-md px-2 py-1 font-medium text-brand-green hover:bg-brand-green-muted dark:hover:bg-stone-800"
              >
                Admin
              </Link>
            )}
            <span className="hidden text-muted sm:inline">{user?.email}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-stone-300 px-2 py-1 text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                Sign out
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}
