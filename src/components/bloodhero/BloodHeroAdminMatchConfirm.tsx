"use client";

import { useActionState } from "react";
import {
  type BloodHeroAcceptedNotificationRow,
  type ConfirmBloodHeroDonationState,
  type ConfirmBloodHeroMatchState,
  confirmBloodHeroDonationCompleted,
  confirmBloodHeroMatch,
  reopenBloodHeroMatch,
} from "@/actions/bloodhero-admin-requests";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

const initial: ConfirmBloodHeroMatchState = {};
const donationInitial: ConfirmBloodHeroDonationState = {};

export function BloodHeroAdminMatchConfirm({
  requestId,
  status,
  matchedNotificationId,
  matchedAt,
  donationConfirmedAt,
  accepted,
}: {
  requestId: string;
  status: "open" | "matching" | "fulfilled" | "cancelled";
  matchedNotificationId: string | null;
  matchedAt: string | null;
  donationConfirmedAt: string | null;
  accepted: BloodHeroAcceptedNotificationRow[];
}) {
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmBloodHeroMatch, initial);
  const [reopenState, reopenAction, reopenPending] = useActionState(reopenBloodHeroMatch, initial);
  const [donationState, donationAction, donationPending] = useActionState(
    confirmBloodHeroDonationCompleted,
    donationInitial,
  );

  if (status === "fulfilled" && matchedNotificationId) {
    const matched = accepted.find((n) => n.id === matchedNotificationId);
    return (
      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/35">
        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Match confirmed</p>
        <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-200">
          Donor: {matched?.donor_full_name ?? "—"} ({matched?.donor_phone ?? "—"}) · confirmed {formatDateTime(matchedAt)}
        </p>

        {donationConfirmedAt ? (
          <p className="mt-2 text-sm font-medium text-emerald-900 dark:text-emerald-200">
            Donation confirmed {formatDateTime(donationConfirmedAt)} · certificate issued
          </p>
        ) : (
          <form action={donationAction} className="mt-3">
            <input type="hidden" name="requestId" value={requestId} />
            <button
              type="submit"
              disabled={donationPending}
              className="rounded-lg bg-(--bh-blood) px-3 py-1.5 text-sm font-semibold text-(--bh-on-blood) hover:bg-(--bh-blood) disabled:opacity-50"
            >
              {donationPending ? "Confirming..." : "Confirm donation completed & issue certificate"}
            </button>
            {donationState.error && (
              <p className="mt-2 text-xs text-red-600 dark:text-red-400">{donationState.error}</p>
            )}
            {donationState.success && donationState.certificateNumber && (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                Certificate {donationState.certificateNumber} issued.
              </p>
            )}
          </form>
        )}

        {!donationConfirmedAt && (
          <form action={reopenAction} className="mt-2">
            <input type="hidden" name="requestId" value={requestId} />
            <button
              type="submit"
              disabled={reopenPending}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {reopenPending ? "Reopening..." : "Reopen match"}
            </button>
          </form>
        )}
        {reopenState.error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{reopenState.error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900/40">
      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        Accepted donors ({accepted.length})
      </p>
      {accepted.length === 0 ? (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">No donor has accepted yet.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {accepted.map((n) => (
            <li
              key={n.id}
              className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <span>
                {n.donor_full_name ?? "—"} ({n.donor_phone ?? "—"}) · accepted {formatDateTime(n.responded_at)}
              </span>
              <form action={confirmAction}>
                <input type="hidden" name="requestId" value={requestId} />
                <input type="hidden" name="notificationId" value={n.id} />
                <button
                  type="submit"
                  disabled={confirmPending}
                  className="rounded-lg bg-(--bh-blood) px-3 py-1.5 text-xs font-semibold text-(--bh-on-blood) hover:bg-(--bh-blood) disabled:opacity-50"
                >
                  {confirmPending ? "Confirming..." : "Confirm match"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      {confirmState.error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{confirmState.error}</p>}
    </div>
  );
}
