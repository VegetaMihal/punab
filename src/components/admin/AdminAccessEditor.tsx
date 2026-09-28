"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import {
  revokeAdminAccessByEmailAction,
  updateAdminAccessByIdAction,
  type AdminAccessActionState,
} from "@/actions/admin-access";
import { ADMIN_NAV_ITEMS, ADMIN_ROLES, matchAdminRole, resolveAdminAccess } from "@/lib/auth/admin-access";
import type { AdminScope, Profile } from "@/types/database";

type Props = { profile: Profile };

const initial: AdminAccessActionState = {};

function StatusBanner({ state }: { state: AdminAccessActionState }) {
  if (state.error) {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
        Saved.
      </p>
    );
  }
  return null;
}

const SCOPE_CHECKBOXES = (() => {
  const seen = new Set<AdminScope>();
  const out: { scope: AdminScope; label: string }[] = [];
  for (const item of ADMIN_NAV_ITEMS) {
    if (!item.scope || seen.has(item.scope)) continue;
    seen.add(item.scope);
    out.push({ scope: item.scope, label: item.label });
  }
  return out;
})();

/**
 * Remounted via `key` whenever the stored access changes, so every field re-derives from the DB
 * instead of staying frozen at the value it had when the page first mounted.
 */
function RoleForm({
  profile,
  action,
  pending,
}: {
  profile: Profile;
  action: (formData: FormData) => void;
  pending: boolean;
}) {
  const access = resolveAdminAccess(profile);
  const matchedRole = access.isFullAdmin ? null : matchAdminRole(access.scopes);
  const [role, setRole] = useState(access.isFullAdmin ? "" : matchedRole ? matchedRole.key : "custom");
  const [customScopes, setCustomScopes] = useState<Set<AdminScope>>(
    new Set(access.scopes.filter((s) => s !== "org_portal"))
  );
  const [orgPortal, setOrgPortal] = useState(access.scopes.includes("org_portal"));

  const activePreset = ADMIN_ROLES.find((r) => r.key === role);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="profileId" value={profile.id} />
      <label className="flex max-w-sm flex-col gap-1 text-xs">
        <span className="font-medium text-stone-700 dark:text-stone-300">Role</span>
        <select
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          disabled={pending}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
        >
          <option value="">Full admin</option>
          {ADMIN_ROLES.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
          <option value="custom">Custom — pick sections</option>
        </select>
      </label>

      {activePreset && <p className="text-xs text-muted">{activePreset.description}</p>}
      {role === "" && (
        <p className="text-xs text-muted">Full access to every admin section. Scope checkboxes don&apos;t apply.</p>
      )}

      {role === "custom" && (
        <div className="flex flex-wrap gap-3 rounded-md border border-stone-200 p-3 dark:border-stone-800">
          {SCOPE_CHECKBOXES.map((c) => (
            <label key={c.scope} className="flex items-center gap-1 text-xs">
              <input
                type="checkbox"
                name="scopes"
                value={c.scope}
                checked={customScopes.has(c.scope)}
                disabled={pending}
                onChange={(e) => {
                  setCustomScopes((prev) => {
                    const next = new Set(prev);
                    if (e.target.checked) next.add(c.scope);
                    else next.delete(c.scope);
                    return next;
                  });
                }}
                className="rounded"
              />
              {c.label}
            </label>
          ))}
        </div>
      )}

      {role !== "" && (
        <>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              name="orgPortal"
              checked={orgPortal}
              onChange={(e) => setOrgPortal(e.target.checked)}
              disabled={pending}
              className="rounded"
            />
            Org Portal (Authorized Central Committee Officer)
          </label>
          {orgPortal && (
            <label className="flex max-w-sm flex-col gap-1 text-xs">
              <span className="font-medium text-stone-700 dark:text-stone-300">Org Portal job title</span>
              <select
                name="adminTitle"
                defaultValue={profile.admin_title ?? ""}
                disabled={pending}
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
              >
                <option value="">— none —</option>
                <option value="central_forum_secretary">Central Forum Management Secretary</option>
                <option value="central_committee_officer">Authorized Central Committee Officer</option>
              </select>
            </label>
          )}
        </>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}

export function AdminAccessEditor({ profile }: Props) {
  const router = useRouter();
  const [updateState, updateAction, updatePending] = useActionState(updateAdminAccessByIdAction, initial);
  const [revokeState, revokeAction, revokePending] = useActionState(revokeAdminAccessByEmailAction, initial);

  const bannerState = updateState.error || updateState.success ? updateState : revokeState;
  const storedSignature = `${[...profile.admin_scopes].sort().join(",")}|${profile.admin_title ?? ""}`;

  // revalidatePath refreshes the server render; refresh() also drops the client Router Cache, so
  // navigating back into this page shows the saved values rather than a cached copy.
  useEffect(() => {
    if (updateState.success) router.refresh();
  }, [updateState, router]);

  useEffect(() => {
    if (revokeState.success) router.push("/admin/access");
  }, [revokeState, router]);

  return (
    <div className="space-y-6">
      <StatusBanner state={bannerState} />

      <RoleForm key={storedSignature} profile={profile} action={updateAction} pending={updatePending} />

      <form action={revokeAction} className="border-t border-stone-200 pt-4 dark:border-stone-800">
        <input type="hidden" name="email" value={profile.email} />
        <button
          type="submit"
          disabled={revokePending}
          className="rounded-md border border-red-300 px-3 py-1.5 text-xs text-red-700 dark:border-red-800 dark:text-red-300"
        >
          Remove admin access
        </button>
      </form>
    </div>
  );
}
