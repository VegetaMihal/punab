"use client";

import Link from "next/link";
import { useState } from "react";

type Row = {
  email: string;
  submittedAt: string;
  checkedInAt: string | null;
  fullName: string;
  phoneNumber: string;
  universityName: string;
  clubName: string;
  departmentOrRole: string;
  donatesBlood: string;
  bloodGroup: string;
  photoUrl: string | null;
  ticketId: string;
};

type SortKey = "registered" | "checkedin" | "date";
type SortDir = "asc" | "desc";

function formatSubmittedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Dhaka",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function SortLink({
  label,
  sortKey,
  activeSort,
  activeDir,
}: {
  label: string;
  sortKey: SortKey;
  activeSort: SortKey;
  activeDir: SortDir;
}) {
  const isActive = activeSort === sortKey;
  const nextDir: SortDir = isActive && activeDir === "asc" ? "desc" : "asc";
  return (
    <Link href={`?sort=${sortKey}&dir=${nextDir}`} className="flex items-center gap-1 hover:underline">
      {label}
      {isActive ? <span>{activeDir === "asc" ? "▲" : "▼"}</span> : null}
    </Link>
  );
}

export function JulyAwardParticipantsTable({
  rows,
  universitySummary,
  clubSummary,
  sortKey,
  sortDir,
}: {
  rows: Row[];
  universitySummary: [string, { total: number; checkedIn: number }][];
  clubSummary: [string, { university: string; total: number; checkedIn: number }][];
  sortKey: SortKey;
  sortDir: SortDir;
}) {
  const [universityQuery, setUniversityQuery] = useState("");
  const [clubQuery, setClubQuery] = useState("");
  const uniQ = universityQuery.trim().toLowerCase();
  const clubQ = clubQuery.trim().toLowerCase();

  const filteredRows = rows.filter(
    (r) => r.universityName.toLowerCase().includes(uniQ) && r.clubName.toLowerCase().includes(clubQ)
  );
  const filteredUniversitySummary = universitySummary.filter(([university]) =>
    university.toLowerCase().includes(uniQ)
  );
  const filteredClubSummary = clubSummary.filter(
    ([club, stats]) => club.toLowerCase().includes(clubQ) && stats.university.toLowerCase().includes(uniQ)
  );

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          value={universityQuery}
          onChange={(e) => setUniversityQuery(e.target.value)}
          placeholder="Search by university..."
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
        <input
          type="text"
          value={clubQuery}
          onChange={(e) => setClubQuery(e.target.value)}
          placeholder="Search by club..."
          className="rounded-md border border-stone-300 px-3 py-1.5 text-sm dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
        />
      </div>

      {filteredClubSummary.length > 0 || filteredUniversitySummary.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredUniversitySummary.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-stone-200 has-[input:checked]:[&_.extra-row]:table-row dark:border-stone-800">
              <p className="border-b border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted dark:border-stone-800 dark:bg-stone-900">
                By university
              </p>
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-muted dark:bg-stone-900">
                  <tr>
                    <th className="px-3 py-2">University</th>
                    <th className="px-3 py-2">
                      <SortLink label="Registered" sortKey="registered" activeSort={sortKey} activeDir={sortDir} />
                    </th>
                    <th className="px-3 py-2">
                      <SortLink label="Checked in" sortKey="checkedin" activeSort={sortKey} activeDir={sortDir} />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {filteredUniversitySummary.map(([university, stats], i) => (
                    <tr key={university} className={i >= 3 ? "extra-row hidden" : ""}>
                      <td className="px-3 py-2">{university}</td>
                      <td className="px-3 py-2">{stats.total}</td>
                      <td className="px-3 py-2">
                        {stats.checkedIn}/{stats.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUniversitySummary.length > 3 ? (
                <label className="block cursor-pointer border-t border-stone-200 px-3 py-2 text-center text-xs font-medium text-accent hover:underline dark:border-stone-800">
                  <input type="checkbox" className="peer hidden" />
                  <span className="peer-checked:hidden">Show all {filteredUniversitySummary.length}</span>
                  <span className="hidden peer-checked:inline">Show top 3 only</span>
                </label>
              ) : null}
            </div>
          ) : null}

          {filteredClubSummary.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-stone-200 has-[input:checked]:[&_.extra-row]:table-row dark:border-stone-800">
              <p className="border-b border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted dark:border-stone-800 dark:bg-stone-900">
                By club
              </p>
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-muted dark:bg-stone-900">
                  <tr>
                    <th className="px-3 py-2">Club</th>
                    <th className="px-3 py-2">University</th>
                    <th className="px-3 py-2">
                      <SortLink label="Registered" sortKey="registered" activeSort={sortKey} activeDir={sortDir} />
                    </th>
                    <th className="px-3 py-2">
                      <SortLink label="Checked in" sortKey="checkedin" activeSort={sortKey} activeDir={sortDir} />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {filteredClubSummary.map(([club, stats], i) => (
                    <tr key={club} className={i >= 3 ? "extra-row hidden" : ""}>
                      <td className="px-3 py-2">{club}</td>
                      <td className="px-3 py-2">{stats.university}</td>
                      <td className="px-3 py-2">{stats.total}</td>
                      <td className="px-3 py-2">
                        {stats.checkedIn}/{stats.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredClubSummary.length > 3 ? (
                <label className="block cursor-pointer border-t border-stone-200 px-3 py-2 text-center text-xs font-medium text-accent hover:underline dark:border-stone-800">
                  <input type="checkbox" className="peer hidden" />
                  <span className="peer-checked:hidden">Show all {filteredClubSummary.length}</span>
                  <span className="hidden peer-checked:inline">Show top 3 only</span>
                </label>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {filteredRows.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-stone-300 px-4 py-8 text-center text-sm text-muted dark:border-stone-700">
          No participants match your search.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-stone-200 dark:border-stone-800">
          <table className="w-full min-w-210 text-left text-sm">
            <thead className="bg-stone-50 text-xs uppercase tracking-wide text-muted dark:bg-stone-900">
              <tr>
                <th className="px-3 py-2">Checked in</th>
                <th className="px-3 py-2">
                  <SortLink label="Submitted" sortKey="date" activeSort={sortKey} activeDir={sortDir} />
                </th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">University</th>
                <th className="px-3 py-2">Club</th>
                <th className="px-3 py-2">Department / role</th>
                <th className="px-3 py-2">Blood group</th>
                <th className="px-3 py-2">Photo</th>
                <th className="px-3 py-2">Ticket ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
              {filteredRows.map((r, i) => (
                <tr key={`${r.email}-${i}`}>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.checkedInAt ? (
                      <span className="text-green-700 dark:text-green-400">{formatSubmittedAt(r.checkedInAt)}</span>
                    ) : (
                      <span className="text-muted">Not yet</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatSubmittedAt(r.submittedAt)}</td>
                  <td className="px-3 py-2">{r.fullName}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{r.phoneNumber}</td>
                  <td className="px-3 py-2">{r.email}</td>
                  <td className="px-3 py-2">{r.universityName}</td>
                  <td className="px-3 py-2">{r.clubName}</td>
                  <td className="px-3 py-2">{r.departmentOrRole}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {r.donatesBlood === "Yes" ? (r.bloodGroup || "Yes") : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-3 py-2">
                    {r.photoUrl ? (
                      <a href={r.photoUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                        View
                      </a>
                    ) : null}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap font-mono">{r.ticketId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
