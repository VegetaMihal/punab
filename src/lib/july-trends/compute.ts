import { buildNameClusterMap } from "@/lib/fuzzy-group";
import type { JulyParticipantRegistrationRow } from "@/lib/july-participant-google-sheet";
import type { JulyTrendsData, NamedCount } from "./types";

function monthBucket(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "Asia/Dhaka" }).format(d);
}

function sortByCount(entries: [string, number][]): NamedCount[] {
  return entries.map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Groups rows by lowercased/trimmed email — same normalization as isJulyParticipantEmailRegistered. */
function groupByEmail(rows: JulyParticipantRegistrationRow[]): Map<string, JulyParticipantRegistrationRow[]> {
  const map = new Map<string, JulyParticipantRegistrationRow[]>();
  for (const r of rows) {
    const key = normalizeEmail(r.email);
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(r);
    map.set(key, list);
  }
  return map;
}

export function computeJulyTrends(rows: JulyParticipantRegistrationRow[]): JulyTrendsData {
  const byEmail = groupByEmail(rows);
  const duplicateGroups = Array.from(byEmail.values()).filter((g) => g.length > 1);

  // Fuzzy-cluster university/club labels the same way the participants admin page does.
  const universityLabelMap = buildNameClusterMap(rows.map((r) => r.universityName || "Unspecified"));
  const clubLabelMap = buildNameClusterMap(rows.map((r) => r.clubName || "Unspecified"));
  const universityOf = (raw: string) => universityLabelMap.get(raw || "Unspecified") ?? (raw || "Unspecified");
  const clubOf = (raw: string) => clubLabelMap.get(raw || "Unspecified") ?? (raw || "Unspecified");

  // --- Registration volume over time (month buckets, cumulative) ---
  const sortedByDate = [...rows].sort(
    (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );
  const volumeCounts = new Map<string, number>();
  for (const r of sortedByDate) {
    const bucket = monthBucket(r.submittedAt);
    volumeCounts.set(bucket, (volumeCounts.get(bucket) ?? 0) + 1);
  }
  let cumulative = 0;
  const registrationVolume = Array.from(volumeCounts.entries()).map(([bucket, count]) => {
    cumulative += count;
    return { bucket, count, cumulative };
  });

  // --- Repeat-email histogram (1x / 2x / 3x+) ---
  const repeatBuckets = new Map<string, number>([["1x", 0], ["2x", 0], ["3x+", 0]]);
  for (const group of byEmail.values()) {
    const label = group.length === 1 ? "1x" : group.length === 2 ? "2x" : "3x+";
    repeatBuckets.set(label, (repeatBuckets.get(label) ?? 0) + 1);
  }
  const repeatEmailBuckets = sortByCount(Array.from(repeatBuckets.entries()));

  // --- Repeat participants per cycle (month of their most recent duplicate submission) ---
  const repeatByCycleCounts = new Map<string, number>();
  for (const group of duplicateGroups) {
    const latest = group.reduce((a, b) => (new Date(a.submittedAt) > new Date(b.submittedAt) ? a : b));
    const bucket = monthBucket(latest.submittedAt);
    repeatByCycleCounts.set(bucket, (repeatByCycleCounts.get(bucket) ?? 0) + 1);
  }
  const repeatByCycle = Array.from(repeatByCycleCounts.entries()).map(([bucket, repeatCount]) => ({
    bucket,
    repeatCount,
  }));

  // --- Duplicate submission time-gap (days between first and last submission per email) ---
  const gapBuckets = new Map<string, number>([
    ["Same day", 0],
    ["1-7 days", 0],
    ["8-30 days", 0],
    ["1-6 months", 0],
    ["6+ months", 0],
  ]);
  for (const group of duplicateGroups) {
    const times = group.map((r) => new Date(r.submittedAt).getTime()).filter((t) => !Number.isNaN(t));
    if (times.length < 2) continue;
    const gapDays = (Math.max(...times) - Math.min(...times)) / (1000 * 60 * 60 * 24);
    const label =
      gapDays < 1 ? "Same day" : gapDays <= 7 ? "1-7 days" : gapDays <= 30 ? "8-30 days" : gapDays <= 180 ? "1-6 months" : "6+ months";
    gapBuckets.set(label, (gapBuckets.get(label) ?? 0) + 1);
  }
  const duplicateGapDays = Array.from(gapBuckets.entries()).map(([name, value]) => ({ name, value }));

  // --- University / club distribution (deduped by email, fuzzy-clustered) ---
  const uniqueLatestByEmail = Array.from(byEmail.values()).map((group) =>
    group.reduce((a, b) => (new Date(a.submittedAt) > new Date(b.submittedAt) ? a : b))
  );
  const universityCounts = new Map<string, number>();
  const clubCounts = new Map<string, number>();
  for (const r of uniqueLatestByEmail) {
    const uni = universityOf(r.universityName);
    universityCounts.set(uni, (universityCounts.get(uni) ?? 0) + 1);
    const club = clubOf(r.clubName);
    clubCounts.set(club, (clubCounts.get(club) ?? 0) + 1);
  }
  const universityDistribution = sortByCount(Array.from(universityCounts.entries()));
  const clubDistribution = sortByCount(Array.from(clubCounts.entries()));

  // --- Top universities by repeat-participant rate ---
  const repeatUniCounts = new Map<string, number>();
  for (const group of duplicateGroups) {
    const uni = universityOf(group[0].universityName);
    repeatUniCounts.set(uni, (repeatUniCounts.get(uni) ?? 0) + 1);
  }
  const topRepeatUniversities = sortByCount(Array.from(repeatUniCounts.entries())).slice(0, 10);

  // --- Department / role distribution ---
  const roleCounts = new Map<string, number>();
  for (const r of uniqueLatestByEmail) {
    const role = r.departmentOrRole || "Unspecified";
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
  }
  const roleDistribution = sortByCount(Array.from(roleCounts.entries())).slice(0, 10);

  // --- Blood group distribution ---
  const bloodCounts = new Map<string, number>();
  for (const r of uniqueLatestByEmail) {
    const bg = r.bloodGroup || "Unspecified";
    bloodCounts.set(bg, (bloodCounts.get(bg) ?? 0) + 1);
  }
  const bloodGroupDistribution = sortByCount(Array.from(bloodCounts.entries()));

  // --- Donates-blood / martyrs-pledge trend over cycles ---
  const donatesByCycle = new Map<string, { yes: number; no: number }>();
  const pledgeByCycle = new Map<string, { yes: number; no: number }>();
  for (const r of rows) {
    const bucket = monthBucket(r.submittedAt);
    const d = donatesByCycle.get(bucket) ?? { yes: 0, no: 0 };
    if (r.donatesBlood.trim().toLowerCase() === "yes") d.yes += 1;
    else d.no += 1;
    donatesByCycle.set(bucket, d);

    const p = pledgeByCycle.get(bucket) ?? { yes: 0, no: 0 };
    if (r.martyrsPledge.trim().toLowerCase() === "yes") p.yes += 1;
    else p.no += 1;
    pledgeByCycle.set(bucket, p);
  }
  const donatesBloodByCycle = Array.from(donatesByCycle.entries()).map(([bucket, v]) => ({ bucket, ...v }));
  const martyrsPledgeByCycle = Array.from(pledgeByCycle.entries()).map(([bucket, v]) => ({ bucket, ...v }));

  // --- Sentiment flip: duplicate-email groups where donate/pledge answer changed ---
  let sentimentFlipCount = 0;
  for (const group of duplicateGroups) {
    const donateAnswers = new Set(group.map((r) => r.donatesBlood.trim().toLowerCase()));
    const pledgeAnswers = new Set(group.map((r) => r.martyrsPledge.trim().toLowerCase()));
    if (donateAnswers.size > 1 || pledgeAnswers.size > 1) sentimentFlipCount += 1;
  }

  // --- Attendance funnel per cycle: registered vs checked-in vs confirmed ---
  const funnelByCycle = new Map<string, { registered: number; checkedIn: number; confirmed: number }>();
  for (const r of rows) {
    const bucket = monthBucket(r.submittedAt);
    const f = funnelByCycle.get(bucket) ?? { registered: 0, checkedIn: 0, confirmed: 0 };
    f.registered += 1;
    if (r.checkedInAt) f.checkedIn += 1;
    if (r.attendanceConfirm.trim().toLowerCase() === "yes") f.confirmed += 1;
    funnelByCycle.set(bucket, f);
  }
  const attendanceFunnelByCycle = Array.from(funnelByCycle.entries()).map(([bucket, v]) => ({ bucket, ...v }));

  // --- No-show repeat pattern: same email registered 2+ cycles, never checked in any of them ---
  let noShowRepeatCount = 0;
  for (const group of duplicateGroups) {
    if (group.every((r) => !r.checkedInAt)) noShowRepeatCount += 1;
  }

  // --- Blood-group conflict: duplicate-email group with differing non-empty blood group values ---
  let bloodGroupConflictCount = 0;
  for (const group of duplicateGroups) {
    const values = new Set(
      group.map((r) => r.bloodGroup.trim().toLowerCase()).filter((v) => v !== "")
    );
    if (values.size > 1) bloodGroupConflictCount += 1;
  }

  // --- Missing-fields rate over time ---
  const REQUIRED_FIELDS: (keyof JulyParticipantRegistrationRow)[] = [
    "fullName",
    "phoneNumber",
    "universityName",
    "clubName",
    "bloodGroup",
  ];
  const missingByCycle = new Map<string, { rows: number; missing: number }>();
  for (const r of rows) {
    const bucket = monthBucket(r.submittedAt);
    const m = missingByCycle.get(bucket) ?? { rows: 0, missing: 0 };
    m.rows += 1;
    if (REQUIRED_FIELDS.some((f) => !r[f])) m.missing += 1;
    missingByCycle.set(bucket, m);
  }
  const missingFieldsByCycle = Array.from(missingByCycle.entries()).map(([bucket, v]) => ({
    bucket,
    missingRate: v.rows > 0 ? Math.round((v.missing / v.rows) * 1000) / 10 : 0,
  }));

  // --- Duplicate full name across different emails (same person registering with a new email) ---
  const byName = new Map<string, { emails: Set<string>; count: number }>();
  for (const r of rows) {
    const key = normalizeName(r.fullName);
    if (!key) continue;
    const entry = byName.get(key) ?? { emails: new Set<string>(), count: 0 };
    entry.emails.add(normalizeEmail(r.email));
    entry.count += 1;
    byName.set(key, entry);
  }
  let duplicateNameByDifferentEmailCount = 0;
  const duplicateNameCounts = new Map<string, number>();
  for (const [key, entry] of byName) {
    if (entry.emails.size > 1) {
      duplicateNameByDifferentEmailCount += 1;
      const displayName = rows.find((r) => normalizeName(r.fullName) === key)?.fullName ?? key;
      duplicateNameCounts.set(displayName, entry.count);
    }
  }
  const topDuplicateNames = sortByCount(Array.from(duplicateNameCounts.entries())).slice(0, 10);

  return {
    registrationVolume,
    repeatEmailBuckets,
    repeatByCycle,
    duplicateGapDays,
    universityDistribution,
    clubDistribution,
    topRepeatUniversities,
    roleDistribution,
    bloodGroupDistribution,
    donatesBloodByCycle,
    martyrsPledgeByCycle,
    sentimentFlipCount,
    attendanceFunnelByCycle,
    noShowRepeatCount,
    bloodGroupConflictCount,
    missingFieldsByCycle,
    totalRows: rows.length,
    uniqueEmailCount: byEmail.size,
    duplicateNameByDifferentEmailCount,
    topDuplicateNames,
  };
}
