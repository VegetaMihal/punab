"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCampusRoleAction, removeCampusRoleAction, type OrgActionState } from "@/actions/org";
import { campusLevelLabel } from "@/lib/org/labels";
import { Button } from "@/components/ui/Button";

const initial: OrgActionState = {};

type CampusRole = { id: string; campusName: string; memberName: string; level: string };

export function CampusCommitteePanel({
  forumId,
  roles,
  campuses,
  members,
}: {
  forumId: string;
  roles: CampusRole[];
  campuses: { id: string; name: string }[];
  members: { id: string; full_name: string; email: string }[];
}) {
  const [state, formAction, pending] = useActionState(addCampusRoleAction, initial);
  const router = useRouter();
  const [removing, startRemove] = useTransition();
  const [removeError, setRemoveError] = useState<string | null>(null);

  function remove(id: string) {
    setRemoveError(null);
    startRemove(async () => {
      const result = await removeCampusRoleAction(id);
      if (result?.error) setRemoveError(result.error);
      router.refresh();
    });
  }

  return (
    <div>
      <p className="mb-2 text-xs text-muted">
        Campus roles are stepping stones before someone joins the Forum directly.
      </p>
      {roles.length === 0 ? (
        <p className="mb-3 text-sm text-muted">No one on the campus committee yet.</p>
      ) : (
        <ul className="mb-3 divide-y divide-stone-100 rounded-md border border-stone-200 dark:divide-stone-900 dark:border-stone-800">
          {roles.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 text-sm">
              <span>{r.memberName} — {r.campusName}</span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-muted">{campusLevelLabel(r.level)}</span>
                <button
                  type="button"
                  disabled={removing}
                  onClick={() => remove(r.id)}
                  className="text-xs text-red-700 hover:underline disabled:opacity-40 dark:text-red-400"
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {removeError && <p className="mb-2 text-xs text-red-700 dark:text-red-300">{removeError}</p>}

      {members.length === 0 ? (
        <p className="text-sm text-muted">Every approved member is already in this Forum.</p>
      ) : (
        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <input type="hidden" name="forumId" value={forumId} />
          {state?.error && <p className="w-full text-xs text-red-700 dark:text-red-300">{state.error}</p>}
          <div>
            <label htmlFor="campusMemberId" className="ds-label">Who?</label>
            <select id="campusMemberId" name="memberId" required defaultValue="" className="ds-select">
              <option value="" disabled>Select a member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.full_name} ({m.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="campusId" className="ds-label">Which campus?</label>
            <select id="campusId" name="campusId" required defaultValue="" className="ds-select">
              <option value="" disabled>Select a campus</option>
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="campusLevel" className="ds-label">At what level?</label>
            <select id="campusLevel" name="campusLevel" defaultValue="member" className="ds-select">
              <option value="member">{campusLevelLabel("member")}</option>
              <option value="associate">{campusLevelLabel("associate")}</option>
              <option value="representative">{campusLevelLabel("representative")}</option>
            </select>
          </div>
          <Button type="submit" variant="secondary" size="sm" loading={pending}>
            Add
          </Button>
        </form>
      )}
    </div>
  );
}
