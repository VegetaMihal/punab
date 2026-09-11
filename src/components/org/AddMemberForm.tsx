"use client";

import { useActionState } from "react";
import { addForumMembershipAction, type OrgActionState } from "@/actions/org";
import { Button } from "@/components/ui/Button";
import { MemberCombobox } from "@/components/org/MemberCombobox";

const initial: OrgActionState = {};

export function AddMemberForm({
  forumId,
  members,
  designationLevels,
}: {
  forumId: string;
  members: { id: string; full_name: string; email: string }[];
  designationLevels: { id: string; label: string }[];
}) {
  const [state, formAction, pending] = useActionState(addForumMembershipAction, initial);

  if (members.length === 0) {
    return <p className="text-sm text-muted">Every approved member is already in this Forum.</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="forumId" value={forumId} />
      {state?.error && <p className="w-full text-xs text-red-700 dark:text-red-300">{state.error}</p>}
      <MemberCombobox forumId={forumId} name="memberId" label="Who to add?" initialCandidates={members.slice(0, 20)} />
      <div>
        <label htmlFor="designationLevelId" className="ds-label">At what level?</label>
        <select id="designationLevelId" name="designationLevelId" required defaultValue="" className="ds-select">
          <option value="" disabled>Select a level</option>
          {designationLevels.map((l) => (
            <option key={l.id} value={l.id}>{l.label}</option>
          ))}
        </select>
      </div>
      <Button type="submit" variant="secondary" size="sm" loading={pending}>
        Add
      </Button>
    </form>
  );
}
