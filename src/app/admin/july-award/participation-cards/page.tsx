import { Bricolage_Grotesque, Cormorant_Garamond, Manrope } from "next/font/google";
import { JulyAwardParticipationCardsRegistry } from "@/components/admin/JulyAwardParticipationCardsRegistry";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { listJulyAwardClubCardsForAdminWithMeta } from "@/lib/repositories/july-award-club-card";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["700", "800"] });
const body = Manrope({ subsets: ["latin"], weight: ["600", "700", "800"] });
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], style: ["italic", "normal"] });

export const metadata = {
  title: "July Award — Appreciation Partner cards",
};

export default async function AdminJulyAwardParticipationCardsPage() {
  await assertAdminScope("july_award_cards");
  const { items, error: loadError } = await listJulyAwardClubCardsForAdminWithMeta();

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">July Award — Appreciation Partner cards</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Manage club nominations, generate admin cards (third-person copy), and edit or delete entries. Delete removes
        Supabase data, Storage files, and Google Sheet rows. Changes sync to
        the public participation card when clubs enter the same club and university.
      </p>

      {loadError ? (
        <div
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          role="alert"
        >
          Could not load club entries: {loadError}. If this mentions missing columns, run Supabase migration{" "}
          <code className="rounded bg-red-100 px-1 dark:bg-red-900">024_july_award_club_cards_debate.sql</code>.
        </div>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Club nominations</h2>
        <p className="mt-1 text-sm text-muted">
          One row per club registration. Partner numbers are resolved from Google Sheets when configured.
        </p>
        <div className={`${display.className} ${body.className} ${serif.className}`}>
          <JulyAwardParticipationCardsRegistry items={items} />
        </div>
      </section>
    </div>
  );
}
