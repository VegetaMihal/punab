/**
 * Synthetic timeline steps when no rows exist in bloodhero_request_events yet,
 * or to supplement status for non-technical users. Real events always take precedence in UI.
 */
export type BloodHeroRequestStatus = "open" | "matching" | "fulfilled" | "cancelled";

export type TrackerTimelineItem = {
  key: string;
  title: string;
  detail: string;
  /** ISO string when known */
  at?: string;
  variant: "done" | "current" | "upcoming";
};

const STATUS_LABEL: Record<BloodHeroRequestStatus, string> = {
  open: "Open — coordinators are reviewing your request.",
  matching: "Matching — we are contacting suitable donors.",
  fulfilled: "Fulfilled — this request has been met.",
  cancelled: "Closed — this request is no longer active.",
};

export function isBloodHeroRequestStatus(s: string): s is BloodHeroRequestStatus {
  return s === "open" || s === "matching" || s === "fulfilled" || s === "cancelled";
}

/** Placeholder steps derived from status; merge with real DB events in the UI. */
export function syntheticTimelineForStatus(
  status: string,
  requestCreatedAt: string
): TrackerTimelineItem[] {
  const st = isBloodHeroRequestStatus(status) ? status : "open";
  const items: TrackerTimelineItem[] = [
    {
      key: "seed_created",
      title: "Request received",
      detail: "We saved your request and shared it with BloodHero coordinators.",
      at: requestCreatedAt,
      variant: "done",
    },
  ];

  if (st === "open") {
    items.push({
      key: "seed_open",
      title: "Current status: Open",
      detail: STATUS_LABEL.open,
      variant: "current",
    });
  } else if (st === "matching") {
    items.push({
      key: "seed_matching",
      title: "Current status: Matching",
      detail: STATUS_LABEL.matching,
      variant: "current",
    });
  } else if (st === "fulfilled") {
    items.push({
      key: "seed_fulfilled",
      title: "Current status: Fulfilled",
      detail: STATUS_LABEL.fulfilled,
      variant: "current",
    });
  } else {
    items.push({
      key: "seed_cancelled",
      title: "Current status: Closed",
      detail: STATUS_LABEL.cancelled,
      variant: "current",
    });
  }

  items.push({
    key: "seed_future",
    title: "What is next",
    detail:
      "Donor updates, notifications, and a richer timeline will appear here as matching goes live.",
    variant: "upcoming",
  });

  return items;
}

/** Map DB event_type to a readable title for the timeline. */
export function eventTypeLabel(eventType: string): string {
  const map: Record<string, string> = {
    request_created: "Request received",
    request_opened: "Request opened",
    matching_started: "Matching started",
    donor_notifications_sent: "Donors notified",
    donor_accepted: "Donor accepted",
    donor_matched: "Donor matched",
    donation_confirmed: "Donation confirmed",
    request_closed: "Request closed",
  };
  return map[eventType] ?? eventType.replace(/_/g, " ");
}
