import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { bloodHeroAdminSignOut } from "@/actions/bloodhero-admin-auth";
import { BloodHeroAdminLoginForm } from "@/components/bloodhero/BloodHeroAdminLoginForm";
import { PUNAB_LOGO_SRC } from "@/components/layout/logo";
import {
  canAccessBloodHeroAdmin,
  safeBloodHeroAdminRedirectTarget,
} from "@/lib/bloodhero/is-bloodhero-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin sign in",
};

export default async function BloodHeroAdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; reason?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = safeBloodHeroAdminRedirectTarget(params.redirect);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const ok = await canAccessBloodHeroAdmin(supabase);
    if (ok) {
      redirect(redirectTo);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-200 bg-white/90 px-4 py-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <Link href="/bloodhero" className="inline-flex items-center">
            <Image
              src="/branding/BloodHeroLogo.png"
              alt="BloodHero"
              width={120}
              height={36}
              className="h-8 w-auto object-contain object-left"
              priority
            />
          </Link>
          <Link
            href="/"
            className="flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <span className="hidden sm:inline">PUNAB</span>
            <Image
              src={PUNAB_LOGO_SRC}
              alt=""
              width={56}
              height={22}
              className="h-5 w-auto opacity-90"
            />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-center text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            BloodHero administration
          </h1>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Authorized coordinators only. There is no public sign-up for this area.
          </p>

          {params.reason === "forbidden" && (
            <p
              role="status"
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
            >
              Your account is signed in but does not have BloodHero admin access. Sign in with an authorized
              account or contact a project owner.
            </p>
          )}

          {user && params.reason !== "forbidden" && (
            <p
              role="status"
              className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
            >
              Signed in as {user.email}. This account is not a PUNAB admin and has no active BloodHero admin
              grant.
            </p>
          )}

          <div className="mt-6">
            <BloodHeroAdminLoginForm redirectTo={redirectTo} />
          </div>

          {user && (
            <form action={bloodHeroAdminSignOut} className="mt-4 text-center">
              <button
                type="submit"
                className="text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Sign out and use a different account
              </button>
            </form>
          )}
        </div>

        <p className="mt-8 max-w-md text-center text-xs text-zinc-500 dark:text-zinc-500">
          Blood donor registration and requests remain public and do not use this login.
        </p>
      </main>
    </div>
  );
}
