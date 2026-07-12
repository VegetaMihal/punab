import { assertAdminScope } from "@/lib/auth/require-admin";
import { listJulyParticipantRegistrationRows } from "@/lib/july-participant-google-sheet";
import { ClubFilterSelect } from "@/components/admin/ClubFilterSelect";
import { JulyAwardParticipantsTable } from "@/components/admin/JulyAwardParticipantsTable";
import { JulyAwardRegistrationToggle } from "@/components/admin/JulyAwardRegistrationToggle";
import { buildNameClusterMap } from "@/lib/fuzzy-group";
import { getSiteSettingsMap } from "@/lib/repositories/site-settings-repository";
import { getSetting } from "@/lib/site-defaults";

export const metadata = {
  title: "July Award — Participants",
};

type SortKey = "registered" | "checkedin" | "date";
type SortDir = "asc" | "desc";

export default async function AdminJulyAwardParticipantsPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string; dir?: string; club?: string }>;
}) {
  await assertAdminScope("july_award_participants");
  const result = await listJulyParticipantRegistrationRows();
  const settingsMap = await getSiteSettingsMap();
  const registrationOpen = getSetting(settingsMap, "july_award.registration_open") !== "false";
  const params = await searchParams;

  const sortKey: SortKey = params.sort === "checkedin" ? "checkedin" : params.sort === "registered" ? "registered" : "date";
  const sortDir: SortDir = params.dir === "asc" ? "asc" : "desc";
  const dirMul = sortDir === "asc" ? 1 : -1;
  const clubFilter = params.club ?? "";

  // Deduplicate by email — keep latest registration per email (rows are newest-first)
  const uniqueRows = result.ok
    ? result.rows.filter((r, _i, arr) => arr.findIndex((x) => x.email.toLowerCase() === r.email.toLowerCase()) === _i)
    : [];

  // Cluster raw university/club spellings (case, whitespace, abbreviations, typos) into one canonical label each.
  const clubLabelMap = buildNameClusterMap(uniqueRows.map((r) => r.clubName || "Unspecified"));
  const universityLabelMap = buildNameClusterMap(uniqueRows.map((r) => r.universityName || "Unspecified"));
  const clubOf = (raw: string) => clubLabelMap.get(raw || "Unspecified") ?? (raw || "Unspecified");
  const universityOf = (raw: string) => universityLabelMap.get(raw || "Unspecified") ?? (raw || "Unspecified");

  const allClubs = result.ok
    ? Array.from(new Set(uniqueRows.map((r) => clubOf(r.clubName)))).sort((a, b) => a.localeCompare(b))
    : [];

  const filteredRows = result.ok
    ? clubFilter
      ? uniqueRows.filter((r) => clubOf(r.clubName) === clubFilter)
      : uniqueRows
    : [];

  const clubSummary = result.ok
    ? Object.entries(
        filteredRows
          .filter((r) => r.clubName)
          .reduce<Record<string, { university: string; total: number; checkedIn: number }>>((acc, r) => {
            const club = clubOf(r.clubName);
            acc[club] ??= { university: universityOf(r.universityName) || "—", total: 0, checkedIn: 0 };
            acc[club].total += 1;
            if (r.checkedInAt) acc[club].checkedIn += 1;
            return acc;
          }, {}),
      ).sort(([, statsA], [, statsB]) => {
        if (sortKey === "checkedin") return dirMul * (statsA.checkedIn - statsB.checkedIn);
        return dirMul * (statsA.total - statsB.total);
      })
    : [];

  const universitySummary = result.ok
    ? Object.entries(
        filteredRows.reduce<Record<string, { total: number; checkedIn: number }>>((acc, r) => {
          const university = universityOf(r.universityName);
          acc[university] ??= { total: 0, checkedIn: 0 };
          acc[university].total += 1;
          if (r.checkedInAt) acc[university].checkedIn += 1;
          return acc;
        }, {}),
      ).sort(([, statsA], [, statsB]) => {
        if (sortKey === "checkedin") return dirMul * (statsA.checkedIn - statsB.checkedIn);
        return dirMul * (statsA.total - statsB.total);
      })
    : [];

  const clubCounts = new Map(clubSummary.map(([club, stats]) => [club, stats]));

  const sortedRows = result.ok
    ? [...filteredRows].sort((a, b) => {
        if (sortKey === "date") {
          // desc = latest first (b-a), asc = oldest first (a-b); dirMul is -1 for desc so invert
          return -dirMul * (new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
        }
        const statsA = clubCounts.get(clubOf(a.clubName));
        const statsB = clubCounts.get(clubOf(b.clubName));
        const valA = sortKey === "checkedin" ? statsA?.checkedIn ?? 0 : statsA?.total ?? 0;
        const valB = sortKey === "checkedin" ? statsB?.checkedIn ?? 0 : statsB?.total ?? 0;
        return dirMul * (valA - valB);
      })
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">July Award — Participants</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        Everyone who registered for the July Uprising Memorial Award programme, with their university and club.
      </p>

      <JulyAwardRegistrationToggle initialOpen={registrationOpen} />

      {result.ok && (
        <div className="mt-4 flex gap-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs uppercase tracking-wide text-muted">Total registered</p>
            <p className="mt-0.5 text-2xl font-bold text-stone-900 dark:text-stone-50">{uniqueRows.length}</p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs uppercase tracking-wide text-muted">Checked in</p>
            <p className="mt-0.5 text-2xl font-bold text-green-700 dark:text-green-400">
              {uniqueRows.filter((r) => r.checkedInAt).length}
            </p>
          </div>
        </div>
      )}

      {result.ok && allClubs.length > 0 ? (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-muted">Filter by club:</span>
          <ClubFilterSelect clubs={allClubs} />
        </div>
      ) : null}

      {result.ok ? (
        <a
          href="/api/admin/july-award/participants/export-xlsx"
          className="mt-4 inline-block rounded-md bg-brand-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-red/90"
        >
          Export by university (.xlsx)
        </a>
      ) : null}

      {!result.ok ? (
        <div
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          role="alert"
        >
          Could not load participants: {result.message}
        </div>
      ) : uniqueRows.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-muted dark:border-stone-700">
          No participant registrations yet.
        </p>
      ) : (
        <JulyAwardParticipantsTable
          rows={sortedRows}
          universitySummary={universitySummary}
          clubSummary={clubSummary}
          sortKey={sortKey}
          sortDir={sortDir}
        />
      )}
    </div>
  );
}
