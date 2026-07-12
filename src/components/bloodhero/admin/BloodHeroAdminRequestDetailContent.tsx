import Link from "next/link";
import type { BloodHeroAdminRequestRow, BloodHeroRequestEventRow } from "@/actions/bloodhero-admin-requests";
import { BloodHeroAdminRequestConditionEditor } from "@/components/bloodhero/BloodHeroAdminRequestConditionEditor";
import { BloodHeroAdminRerunMatchingAction } from "@/components/bloodhero/BloodHeroAdminRerunMatchingAction";
import { BloodHeroAdminRequestStatusActions } from "@/components/bloodhero/BloodHeroAdminRequestStatusActions";
import type { BloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function metaJson(v: Record<string, unknown> | null): string {
  if (!v) return "—";
  try {
    return JSON.stringify(v);
  } catch {
    return "—";
  }
}

function normalizeText(value: string | null): string {
  const text = value?.trim();
  return text && text.length > 0 ? text : "—";
}

function formatCoord(v: number | null): string {
  if (typeof v !== "number" || !Number.isFinite(v)) return "—";
  return v.toFixed(6);
}

function extractMatchingSummary(events: BloodHeroRequestEventRow[]): string | null {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e.event_type !== "donors_selected_for_notification") continue;
    const m = e.metadata;
    if (!m || typeof m !== "object") continue;
    const selectedCount =
      typeof m.selected_count === "number" ? m.selected_count : null;
    const donorPoolWithCoords =
      typeof m.donor_pool_with_coordinates === "number" ? m.donor_pool_with_coordinates : null;
    const donorPoolTotal = typeof m.donor_pool_total === "number" ? m.donor_pool_total : null;
    const usesCoords =
      typeof m.request_has_coordinates === "boolean" ? m.request_has_coordinates : null;
    return [
      selectedCount !== null ? `${selectedCount} selected` : null,
      donorPoolWithCoords !== null && donorPoolTotal !== null
        ? `${donorPoolWithCoords}/${donorPoolTotal} donor coords ready`
        : null,
      usesCoords === null ? null : usesCoords ? "distance ranking active" : "district fallback used",
    ]
      .filter(Boolean)
      .join(" • ");
  }
  return null;
}

export function BloodHeroAdminRequestDetailContent({
  paths,
  request,
  events,
  error,
  eventsError,
}: {
  paths: BloodHeroAdminUrls;
  request: BloodHeroAdminRequestRow | null;
  events: BloodHeroRequestEventRow[];
  error?: string;
  eventsError?: string;
}) {
  const matchingSummary = extractMatchingSummary(events);

  if (error === "Unauthorized") {
    return <p className="text-sm text-red-600 dark:text-red-400">You do not have access to this page.</p>;
  }
  if (error || !request) {
    return (
      <div>
        <Link
          href={paths.requests}
          className="text-sm font-medium text-red-800 hover:underline dark:text-red-300"
        >
          ← Back to requests
        </Link>
        <div
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100"
        >
          {error ?? "Request not found"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Request detail</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Tracking <span className="font-mono">{request.tracking_number}</span>
          </p>
        </div>
        <Link
          href={paths.requests}
          className="text-sm font-medium text-red-800 hover:underline dark:text-red-300"
        >
          ← Back to requests
        </Link>
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 sm:gap-x-8">
            <p>
              <span className="font-semibold">Tracking:</span>{" "}
              <span className="font-mono text-xs">{request.tracking_number}</span>
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {request.status === "cancelled" ? "closed" : request.status}
            </p>
            <p>
              <span className="font-semibold">Requester:</span> {request.requester_name}
            </p>
            <p>
              <span className="font-semibold">Requester email:</span> {request.requester_email}
            </p>
            <p>
              <span className="font-semibold">Requester phone:</span> {request.requester_phone}
            </p>
            <p>
              <span className="font-semibold">Patient:</span> {request.patient_name}
            </p>
            <p>
              <span className="font-semibold">Blood group:</span> {request.blood_group}
            </p>
            <p>
              <span className="font-semibold">District:</span> {request.district}
            </p>
            <p>
              <span className="font-semibold">Donation location:</span> {request.donation_location}
            </p>
            <p>
              <span className="font-semibold">Normalized location:</span>{" "}
              {normalizeText(request.donation_location_address)}
            </p>
            <p>
              <span className="font-semibold">Location coordinates:</span>{" "}
              {formatCoord(request.donation_location_lat)}, {formatCoord(request.donation_location_lng)}
            </p>
            <p>
              <span className="font-semibold">Needed at:</span> {formatDateTime(request.planned_donation_at)}
            </p>
            <p>
              <span className="font-semibold">Quantity:</span> {request.request_quantity}
            </p>
            <p>
              <span className="font-semibold">Submitted:</span> {formatDateTime(request.created_at)}
            </p>
          </div>
          <div>
            <BloodHeroAdminRequestStatusActions requestId={request.id} currentStatus={request.status} />
            <BloodHeroAdminRerunMatchingAction requestId={request.id} />
          </div>
        </div>

        <div className="mt-4 space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Condition or notes</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {normalizeText(request.patient_condition)}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Voice transcript (raw)</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {normalizeText(request.condition_voice_transcript)}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
            <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Edit condition</p>
            <BloodHeroAdminRequestConditionEditor
              requestId={request.id}
              initialCondition={request.patient_condition}
              initialVoiceTranscript={request.condition_voice_transcript}
            />
          </div>
        </div>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Timeline</h2>
        {matchingSummary ? (
          <p className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/35 dark:text-emerald-200">
            Latest matching: {matchingSummary}
          </p>
        ) : null}
        {eventsError && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-200">
            {eventsError}
          </p>
        )}
        {!eventsError && events.length === 0 && (
          <p className="mt-3 rounded-lg border border-dashed border-zinc-300 bg-white px-4 py-6 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-400">
            No events recorded yet.
          </p>
        )}
        {!eventsError && events.length > 0 && (
          <ul className="mt-3 space-y-3">
            {events.map((e) => (
              <li
                key={e.id}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{e.event_type}</p>
                <p className="mt-1 text-zinc-700 dark:text-zinc-300">{e.event_message ?? "—"}</p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatDateTime(e.created_at)} • metadata: {metaJson(e.metadata)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
