import * as XLSX from "xlsx";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { listJulyParticipantRegistrationRows } from "@/lib/july-participant-google-sheet";
import { buildNameClusterMap } from "@/lib/fuzzy-group";

function sheetSafeName(name: string, used: Set<string>): string {
  let base = name.replace(/[\\/*?:[\]]/g, " ").trim().slice(0, 31) || "Unspecified";
  let candidate = base;
  let i = 2;
  while (used.has(candidate.toLowerCase())) {
    candidate = `${base.slice(0, 28)} ${i}`;
    i += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

export async function GET() {
  try {
    await assertAdminScope("july_award_participants");

    const result = await listJulyParticipantRegistrationRows();
    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const uniqueRows = result.rows.filter(
      (r, i, arr) => arr.findIndex((x) => x.email.toLowerCase() === r.email.toLowerCase()) === i
    );

    const universityLabelMap = buildNameClusterMap(uniqueRows.map((r) => r.universityName || "Unspecified"));
    const universityOf = (raw: string) => universityLabelMap.get(raw || "Unspecified") ?? (raw || "Unspecified");

    const byUniversity = new Map<string, { fullName: string; phoneNumber: string }[]>();
    for (const r of uniqueRows) {
      const university = universityOf(r.universityName);
      const list = byUniversity.get(university) ?? [];
      list.push({ fullName: r.fullName, phoneNumber: r.phoneNumber });
      byUniversity.set(university, list);
    }

    const sortedUniversities = Array.from(byUniversity.entries()).sort(
      ([, a], [, b]) => b.length - a.length
    );

    const workbook = XLSX.utils.book_new();
    const usedNames = new Set<string>();
    for (const [university, members] of sortedUniversities) {
      const sheet = XLSX.utils.json_to_sheet(
        members.map((m) => ({ Name: m.fullName, Phone: m.phoneNumber })),
      );
      XLSX.utils.book_append_sheet(workbook, sheet, sheetSafeName(university, usedNames));
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": `attachment; filename="july-award-participants-by-university.xlsx"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to export";
    return new Response(JSON.stringify({ error: message }), {
      status: message === "Unauthorized" ? 401 : 500,
      headers: { "content-type": "application/json" },
    });
  }
}
