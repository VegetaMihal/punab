import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/actions/auth";
import { getSessionProfile } from "@/lib/auth/session";

export default async function ReporterPortalLayout({ children }: { children: React.ReactNode }) {
  const { user, profile } = await getSessionProfile();
  if (!user) {
    redirect("/login?redirect=/portal/reporter");
  }
  if (profile?.first_login_required) {
    redirect("/auth/change-password");
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 dark:bg-stone-950">
      <header className="border-b border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/portal/reporter" className="text-sm font-semibold text-stone-900 dark:text-stone-100">
            Reporter Portal
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/portal/me" className="rounded-md px-2 py-1 hover:bg-stone-100 dark:hover:bg-stone-800">
              My Forum Activity
            </Link>
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
      <div className="flex-1 p-4 md:p-8">{children}</div>
    </div>
  );
}
