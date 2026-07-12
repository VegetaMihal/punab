import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BloodHeroPageHero, BloodHeroPageSection } from "@/components/bloodhero";
import { confirmBloodHeroDonorResponse } from "@/actions/bloodhero-donor-response";
import { bloodHeroResponseActionLabel, verifyBloodHeroResponseToken } from "@/lib/bloodhero/response-token";

export const metadata: Metadata = {
  title: "Confirm response",
  robots: { index: false, follow: false },
};

export default async function BloodHeroRespondPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;

  if (!t?.trim()) {
    redirect("/bloodhero/respond/error?reason=missing");
  }

  const verified = verifyBloodHeroResponseToken(t);

  if (!verified.ok) {
    if (verified.reason === "expired") {
      redirect("/bloodhero/respond/error?reason=expired");
    }
    if (verified.reason === "config") {
      redirect("/bloodhero/respond/error?reason=config");
    }
    redirect("/bloodhero/respond/error?reason=invalid");
  }

  const label = bloodHeroResponseActionLabel(verified.action);

  return (
    <>
      <BloodHeroPageHero
        title="Confirm your response"
        description="Review your choice below, then confirm. Nothing is saved until you tap the button — that helps avoid mistakes from email previews."
      />
      <BloodHeroPageSection>
        <div className="mx-auto max-w-lg">
          <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              You selected
            </p>
            <p className="mt-2 text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50 sm:text-lg">
              {label}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              After you confirm, we will save this once. If you opened the wrong link from the email, go back and choose a different option there.
            </p>
            <form action={confirmBloodHeroDonorResponse} className="mt-8">
              <input type="hidden" name="token" value={t} />
              <button
                type="submit"
                className="inline-flex min-h-[3rem] w-full items-center justify-center rounded-xl bg-red-600 px-5 text-base font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 active:bg-red-800 dark:bg-red-500 dark:hover:bg-red-600 dark:focus-visible:ring-offset-zinc-950 sm:min-h-11 sm:text-sm"
              >
                Confirm and save
              </button>
            </form>
          </div>
        </div>
      </BloodHeroPageSection>
    </>
  );
}
