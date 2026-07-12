import { assertAdminScope } from "@/lib/auth/require-admin";
import { listJulyParticipantRegistrationRows } from "@/lib/july-participant-google-sheet";
import { computeJulyTrends } from "@/lib/july-trends/compute";
import { ChartCard, StatTile } from "@/components/admin/july-trends/ChartCard";
import {
  BarTrend,
  FunnelChart,
  MissingRateChart,
  PieTrend,
  StackedYesNoChart,
  VolumeChart,
} from "@/components/admin/july-trends/TrendCharts";

export const metadata = {
  title: "July Award — Trends",
};

export default async function AdminJulyAwardTrendsPage() {
  await assertAdminScope("july_award_participants");
  const result = await listJulyParticipantRegistrationRows();

  if (!result.ok) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">July Award — Trends</h1>
        <div
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          role="alert"
        >
          Could not load participants: {result.message}
        </div>
      </div>
    );
  }

  if (result.rows.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">July Award — Trends</h1>
        <p className="mt-6 rounded-lg border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-muted dark:border-stone-700">
          No participant registrations yet.
        </p>
      </div>
    );
  }

  const t = computeJulyTrends(result.rows);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">July Award — Trends</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">
        A visual overview of participant registrations — how many people signed up, whether anyone
        registered more than once, and general patterns across universities, clubs, and attendance.
      </p>

      <div className="mt-4 max-w-3xl rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
        <p className="font-semibold text-stone-900 dark:text-stone-50">How to read this page</p>
        <p className="mt-1">
          This updates automatically as new registrations come in — no need to refresh anything special,
          just reload the page. Each box below has a short note explaining what it shows. Numbers marked
          in amber are worth a quick look, not necessarily a problem — they usually just mean the same
          person registered more than once, which is normal.
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <StatTile label="Total submissions" value={t.totalRows} />
        <StatTile label="Unique people (by email)" value={t.uniqueEmailCount} />
        <StatTile label="Repeated registrations" value={t.repeatByCycle.reduce((s, c) => s + c.repeatCount, 0)} />
        <StatTile
          label="Same name, different email"
          value={t.duplicateNameByDifferentEmailCount}
          tone={t.duplicateNameByDifferentEmailCount > 0 ? "warn" : "default"}
        />
        <StatTile
          label="Blood group mismatch on repeat"
          value={t.bloodGroupConflictCount}
          tone={t.bloodGroupConflictCount > 0 ? "warn" : "default"}
        />
        <StatTile label="Changed their answer on repeat" value={t.sentimentFlipCount} />
        <StatTile
          label="Registered again, never checked in"
          value={t.noShowRepeatCount}
          tone={t.noShowRepeatCount > 0 ? "warn" : "default"}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Registration volume"
          subtitle="Per month, with running total"
          help="The bars show how many people registered each month. The line shows the total so far, added up over time."
        >
          <VolumeChart data={t.registrationVolume} />
        </ChartCard>

        <ChartCard
          title="How often each email registered"
          subtitle="1x = registered once, 2x/3x+ = registered again with the same email"
          help="Most people should show up as 1x. A few 2x or 3x are normal — someone may have signed up again by mistake or on purpose."
        >
          <PieTrend data={t.repeatEmailBuckets} />
        </ChartCard>

        <ChartCard
          title="Repeat registrations by month"
          subtitle="Grouped by the month of their latest repeat submission"
          help="Shows which month most repeat sign-ups happened in — useful for spotting if a particular event or announcement caused re-registrations."
        >
          <BarTrend data={t.repeatByCycle.map((c) => ({ name: c.bucket, value: c.repeatCount }))} color="#a855f7" />
        </ChartCard>

        <ChartCard
          title="Time between repeat registrations"
          subtitle="For people who registered more than once with the same email"
          help="Same day usually means an accidental double-submit. Longer gaps (weeks or months apart) usually mean someone genuinely came back and signed up again."
        >
          <BarTrend data={t.duplicateGapDays} color="#f97316" />
        </ChartCard>

        <ChartCard
          title="Same name, different email"
          subtitle="Top 10 names that appear under more than one email address"
          help="This can mean the same person used a different email each time — worth a quick manual check before treating them as separate people."
        >
          <BarTrend data={t.topDuplicateNames} horizontal color="#ef4444" />
        </ChartCard>

        <ChartCard
          title="Registrations by university"
          subtitle="Counted once per person; spelling differences are merged automatically"
          help="Shows which universities have the most participants. Different spellings of the same university (typos, abbreviations) are combined."
        >
          <BarTrend data={t.universityDistribution.slice(0, 10)} horizontal />
        </ChartCard>

        <ChartCard
          title="Registrations by club"
          subtitle="Counted once per person; spelling differences are merged automatically"
          help="Same idea as the university chart, but for clubs."
        >
          <BarTrend data={t.clubDistribution.slice(0, 10)} horizontal color="#22c55e" />
        </ChartCard>

        <ChartCard
          title="Universities with the most repeat sign-ups"
          subtitle="Where multiple registrations from the same email happen most"
          help="If one university stands out here, it may be worth checking whether their registration process is causing accidental duplicates."
        >
          <BarTrend data={t.topRepeatUniversities} horizontal color="#ec4899" />
        </ChartCard>

        <ChartCard title="Department / role" help="Breakdown of participants by the department or role they entered at registration.">
          <PieTrend data={t.roleDistribution} />
        </ChartCard>

        <ChartCard title="Blood group" help="Breakdown of participants by blood group, as entered at registration.">
          <PieTrend data={t.bloodGroupDistribution} />
        </ChartCard>

        <ChartCard
          title="Willing to donate blood"
          subtitle="Yes vs. No, by month"
          help="Tracks how the share of people willing to donate blood has changed month to month."
        >
          <StackedYesNoChart data={t.donatesBloodByCycle} />
        </ChartCard>

        <ChartCard
          title="Martyrs' pledge"
          subtitle="Yes vs. No, by month"
          help="Tracks how many participants took the martyrs' pledge each month."
        >
          <StackedYesNoChart data={t.martyrsPledgeByCycle} />
        </ChartCard>

        <ChartCard
          title="Registered vs. showed up"
          subtitle="Registered, checked in, and attendance-confirmed, by month"
          help="Compares how many people registered against how many actually checked in and had attendance confirmed — a simple no-show gauge."
        >
          <FunnelChart data={t.attendanceFunnelByCycle} />
        </ChartCard>

        <ChartCard
          title="Incomplete registrations"
          subtitle="Share of rows missing name, phone, university, club, or blood group, by month"
          help="A rising line here suggests the registration form may need clearer required-field guidance for that period."
        >
          <MissingRateChart data={t.missingFieldsByCycle} />
        </ChartCard>
      </div>
    </div>
  );
}
