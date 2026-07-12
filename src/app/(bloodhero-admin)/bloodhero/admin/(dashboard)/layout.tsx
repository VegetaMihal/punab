import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { bloodHeroAdminSignOut } from "@/actions/bloodhero-admin-auth";
import { canAccessBloodHeroAdmin } from "@/lib/bloodhero/is-bloodhero-admin";
import { createClient } from "@/lib/supabase/server";

export default async function BloodHeroAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/bloodhero/admin/login?redirect=/bloodhero/admin");
  }

  const allowed = await canAccessBloodHeroAdmin(supabase);
  if (!allowed) {
    redirect("/bloodhero/admin/login?reason=forbidden");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200/90 bg-white/95 shadow-sm backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-900/95">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-[3.25rem] sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link
              href="/bloodhero/admin"
              className="inline-flex shrink-0 items-center rounded-md outline-none ring-red-600/0 transition-[box-shadow] focus-visible:ring-2 focus-visible:ring-red-600/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
              aria-label="BloodHero admin home"
            >
              <Image
                src="/branding/BloodHeroLogo.png"
                alt=""
                width={112}
                height={34}
                className="h-7 w-auto object-contain object-left sm:h-8"
                priority
              />
            </Link>
            <span className="hidden h-5 w-px bg-zinc-200 sm:block dark:bg-zinc-700" aria-hidden />
            <nav className="min-w-0">
              <p className="truncate text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Admin
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-medium">
                <Link
                  href="/bloodhero/admin"
                  className="text-zinc-900 hover:text-red-800 dark:text-zinc-100 dark:hover:text-red-300"
                >
                  Overview
                </Link>
                <Link
                  href="/bloodhero/admin/pending-donors"
                  className="text-zinc-600 hover:text-red-800 dark:text-zinc-400 dark:hover:text-red-300"
                >
                  Pending donors
                </Link>
                <Link
                  href="/bloodhero/admin/requests"
                  className="text-zinc-600 hover:text-red-800 dark:text-zinc-400 dark:hover:text-red-300"
                >
                  Requests
                </Link>
              </div>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/bloodhero"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <span className="hidden sm:inline">Public BloodHero</span>
              <span className="sm:hidden">Public</span>
            </Link>
            <form action={bloodHeroAdminSignOut} className="inline">
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:bg-zinc-100 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700 dark:active:bg-zinc-600"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
