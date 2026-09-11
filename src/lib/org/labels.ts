/** Plain-language labels for internal status/code values shown anywhere in the org portal UI. */

export function reportStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: "Still being written",
    submitted: "Submitted on time",
    late_submitted: "Submitted late",
    reopened: "Reopened for corrections",
    resubmitted: "Corrected and resubmitted",
  };
  return map[status] ?? status;
}

export function activityStatusLabel(status: string): string {
  const map: Record<string, string> = {
    planned: "Planned (not done yet)",
    completed: "Done",
    partially_completed: "Partly done",
    not_completed: "Didn't happen",
    rescheduled: "Moved to a new date",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}

export function resultTypeLabel(resultType: string): string {
  const map: Record<string, string> = {
    completed: "Did the job well",
    partial_obstacle: "Tried, hit a problem, told us in time",
    absent_approved: "Missed it, but asked permission first",
    absent_unapproved: "Missed it, no word given",
    cancelled: "This got cancelled — don't grade it",
  };
  return map[resultType] ?? resultType;
}

export function forumStatusLabel(status: string): string {
  const map: Record<string, string> = {
    incomplete: "Starting Forum (still building up)",
    full: "Fully Recognized Forum",
  };
  return map[status] ?? status;
}

export function accountStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending_activation: "Waiting for first login",
    active: "Active",
    suspended: "Suspended",
    cancelled: "Cancelled",
    alumni: "Alumni",
  };
  return map[status] ?? status;
}

export function reporterTypeLabel(type: string): string {
  const map: Record<string, string> = {
    primary: "Main Reporter (submits the report)",
    secondary: "Helper Reporter (can add info, can't submit)",
  };
  return map[type] ?? type;
}

export function campusLevelLabel(level: string): string {
  const map: Record<string, string> = {
    member: "Campus Member",
    associate: "Campus Associate",
    representative: "Campus Representative",
  };
  return map[level] ?? level;
}

export function promotionStatusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Waiting for a decision",
    approved: "Approved",
    rejected: "Not approved",
  };
  return map[status] ?? status;
}
