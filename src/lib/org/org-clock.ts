import { getSiteSettingsMap } from "@/lib/repositories/site-settings-repository";

/** REPORT-003: "current month" and deadlines are computed in the org-configured timezone, not server local time. */
export async function getOrgTimezone(): Promise<string> {
  const settings = await getSiteSettingsMap();
  return settings["org.timezone"] || "Asia/Dhaka";
}

export async function getOrgYearMonth(): Promise<{ year: number; month: number }> {
  const timeZone = await getOrgTimezone();
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" }).formatToParts(
    new Date()
  );
  const year = Number.parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const month = Number.parseInt(parts.find((p) => p.type === "month")!.value, 10);
  return { year, month };
}

export function getPreviousYearMonth(year: number, month: number): { year: number; month: number } {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 };
}

export function getNextYearMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

/** REPORT-003: due_at is 23:59:59 on the last calendar day of the report month, in the org timezone. */
export async function getReportDueAt(year: number, month: number): Promise<Date> {
  const timeZone = await getOrgTimezone();
  // Find the UTC offset for this timezone at this date, then build 23:59:59 local as UTC.
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const probe = new Date(Date.UTC(year, month - 1, lastDay, 12, 0, 0));
  const tzName = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" })
    .formatToParts(probe)
    .find((p) => p.type === "timeZoneName")?.value;
  const offsetMatch = tzName?.match(/GMT([+-]\d{1,2})(?::?(\d{2}))?/);
  const offsetHours = offsetMatch ? Number.parseInt(offsetMatch[1], 10) : 0;
  const offsetMinutes = offsetMatch?.[2] ? Number.parseInt(offsetMatch[2], 10) : 0;
  const totalOffsetMinutes = offsetHours * 60 + Math.sign(offsetHours || 1) * offsetMinutes;
  return new Date(Date.UTC(year, month - 1, lastDay, 23, 59, 59) - totalOffsetMinutes * 60 * 1000);
}
