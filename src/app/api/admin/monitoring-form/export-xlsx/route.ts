import * as XLSX from "xlsx";
import { assertAdminScope } from "@/lib/auth/require-admin";
import { listMonitoringSubmissions } from "@/lib/monitoring-form-sheet";
import { MONITORING_SHEET_HEADER_ROW } from "@/lib/monitoring-form-google";

export async function GET() {
  try {
    await assertAdminScope("monitoring_form");

    const result = await listMonitoringSubmissions();
    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.message }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const data = result.rows.map((r) => ({
      [MONITORING_SHEET_HEADER_ROW[0]]: r.referenceNumber,
      [MONITORING_SHEET_HEADER_ROW[1]]: r.submittedAt,
      [MONITORING_SHEET_HEADER_ROW[2]]: r.universityName,
      [MONITORING_SHEET_HEADER_ROW[3]]: r.connection,
      [MONITORING_SHEET_HEADER_ROW[4]]: r.connectionOther,
      [MONITORING_SHEET_HEADER_ROW[5]]: r.programStatus,
      [MONITORING_SHEET_HEADER_ROW[6]]: r.observations,
      [MONITORING_SHEET_HEADER_ROW[7]]: r.observationsOther,
      [MONITORING_SHEET_HEADER_ROW[8]]: r.hasAdminSupporters,
      [MONITORING_SHEET_HEADER_ROW[9]]: r.supporterName,
      [MONITORING_SHEET_HEADER_ROW[10]]: r.supporterPosition,
      [MONITORING_SHEET_HEADER_ROW[11]]: r.supporterReasons,
      [MONITORING_SHEET_HEADER_ROW[12]]: r.supporterReasonsOther,
      [MONITORING_SHEET_HEADER_ROW[13]]: r.description,
      [MONITORING_SHEET_HEADER_ROW[14]]: r.hasEvidence,
      [MONITORING_SHEET_HEADER_ROW[15]]: r.evidenceLinks,
      [MONITORING_SHEET_HEADER_ROW[16]]: r.contactOk,
      [MONITORING_SHEET_HEADER_ROW[17]]: r.contactDetails,
      [MONITORING_SHEET_HEADER_ROW[18]]: r.keepConfidential,
      [MONITORING_SHEET_HEADER_ROW[19]]: r.score,
      [MONITORING_SHEET_HEADER_ROW[20]]: r.category,
      [MONITORING_SHEET_HEADER_ROW[21]]: r.status,
      [MONITORING_SHEET_HEADER_ROW[22]]: r.reviewerNote,
    }));

    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, "Monitoring submissions");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "content-type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "content-disposition": `attachment; filename="monitoring-form-submissions.xlsx"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to export";
    return new Response(JSON.stringify({ error: message }), {
      status: message === "Unauthorized" || message === "Forbidden" ? 401 : 500,
      headers: { "content-type": "application/json" },
    });
  }
}
