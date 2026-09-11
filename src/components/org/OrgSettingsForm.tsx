"use client";

import { useActionState } from "react";
import { updateOrgSettingsAction, type OrgActionState } from "@/actions/org";
import { ORG_SETTING_KEYS } from "@/lib/validations/org";
import { Button } from "@/components/ui/Button";

const initial: OrgActionState = {};

const LABELS: Record<(typeof ORG_SETTING_KEYS)[number], string> = {
  "org.timezone": "Organization timezone (IANA name)",
  "org.temp_password_expiry_hours": "Temp password expiry (hours)",
  "org.promotion_cycle_months": "Promotion cycle (months)",
  "org.full_forum_min_age_months": "Full Forum minimum age (months)",
  "org.full_forum_min_moderator_plus": "Full Forum minimum Moderator+ members",
  "org.max_secondary_reporters": "Maximum Secondary Reporters",
  "org.campus_representative_required_before_forum_member": "Require Campus Representative before Forum Member (true/false)",
  "org.score.completed": "Activity score: Completed",
  "org.score.partial_obstacle": "Activity score: Partial + obstacle reported",
  "org.score.absent_approved": "Activity score: Approved absence",
  "org.score.absent_unapproved": "Activity score: Unapproved absence",
  "org.activity_weight": "Activity weight (0-1)",
  "org.recommendation_weight": "Recommendation weight (0-1)",
  "org.low_recommendation_comment_threshold": "Low recommendation comment threshold",
  "org.allow_no_activities_planned": "Allow \"No Activities Planned\" exception (true/false)",
};

export function OrgSettingsForm({ settings }: { settings: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(updateOrgSettingsAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300" role="alert">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          Saved.
        </div>
      )}
      {ORG_SETTING_KEYS.map((key) => (
        <div key={key}>
          <label htmlFor={key} className="ds-label">{LABELS[key]}</label>
          <input id={key} name={key} type="text" defaultValue={settings[key] ?? ""} className="ds-input" />
        </div>
      ))}
      <Button type="submit" variant="primary" loading={pending}>
        Save settings
      </Button>
    </form>
  );
}
