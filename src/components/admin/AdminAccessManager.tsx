"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  grantAdminAccessByEmailAction,
  revokeAdminAccessByEmailAction,
  updateAdminAccessByEmailAction,
  type AdminAccessActionState,
} from "@/actions/admin-access";
import { AdminPasswordResetForm } from "@/components/admin/AdminPasswordResetForm";
import { EditableGeneratedPasswordField } from "@/components/admin/EditableGeneratedPasswordField";
import { resolveAdminAccess } from "@/lib/auth/admin-access";
import type { Profile } from "@/types/database";

type Props = {
  admins: Profile[];
  currentUserEmail: string;
};

const initial: AdminAccessActionState = {};

function accessLabel(profile: Profile): string {
  const access = resolveAdminAccess(profile);
  if (access.isFullAdmin) return "Full admin";
  const parts: string[] = [];
  if (access.canInvitations) parts.push("Invitations");
  if (access.canJulyAwardCards) parts.push("July Award cards");
  if (access.canCertificates) parts.push("Certificates");
  if (access.canJulyAwardParticipants) parts.push("July Award participants");
  return parts.length > 0 ? parts.join(", ") : "Admin (no scopes)";
}

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
        Updated.
      </p>
    );
  }
  return null;
}

export function AdminAccessManager({ admins, currentUserEmail }: Props) {
  const [grantState, grantAction, grantPending] = useActionState(grantAdminAccessByEmailAction, initial);
  const [updateState, updateAction, updatePending] = useActionState(updateAdminAccessByEmailAction, initial);
  const [revokeState, revokeAction, revokePending] = useActionState(revokeAdminAccessByEmailAction, initial);
  const [grantKey, setGrantKey] = useState(0);
  const didIncrementForGrant = useRef(false);
  useEffect(() => {
    if (grantPending) { didIncrementForGrant.current = false; return; }
    if (!grantState.success || didIncrementForGrant.current) return;
    didIncrementForGrant.current = true;
    try { sessionStorage.removeItem(`edgpf_password_${grantKey}`); } catch {}
    setGrantKey((k) => k + 1);
  }, [grantPending, grantState.success, grantKey]);

  const bannerState =
    [grantState, updateState, revokeState].find((s) => s.error || s.success) ?? initial;

  return (
    <div className="space-y-8">
      <StatusBanner state={bannerState} />

      <section>
        <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Add admin access</h2>
        <p className="mt-1 text-xs text-muted">
          Enter any email — no signup needed. Coordinator logs in at /login with the email and password you set.
          Password auto-generates; edit or regenerate before saving. Leave all scopes unchecked for full admin.
        </p>
        <form action={grantAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-xs">
            <span className="font-medium text-stone-700 dark:text-stone-300">Email</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="off"
              placeholder="person@university.edu"
              className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
            />
          </label>
          <EditableGeneratedPasswordField
            key={grantKey}
            instanceKey={grantKey}
            className="min-w-[280px] flex-1 text-xs"
            inputClassName="w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-sm dark:border-stone-600 dark:bg-stone-900"
          />
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="invitations" className="rounded" />
            Invitations only
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="certificates" className="rounded" />
            Certificates only
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="julyAwardCards" className="rounded" />
            July Award cards only
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input type="checkbox" name="julyAwardParticipants" className="rounded" />
            July Award participants only
          </label>
          <button
            type="submit"
            disabled={grantPending}
            className="rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {grantPending ? "Adding…" : "Add access"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Current admins</h2>
        {admins.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No admin accounts yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Access</th>
                  <th className="py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((p) => {
                  const access = resolveAdminAccess(p);
                  const isSelf = p.email.toLowerCase() === currentUserEmail.toLowerCase();
                  return (
                    <tr key={p.id} className="border-b border-stone-100 align-top dark:border-stone-900">
                      <td className="py-3 pr-4 font-mono text-xs">{p.email}</td>
                      <td className="py-3 pr-4">{p.full_name}</td>
                      <td className="py-3 pr-4 text-muted">{accessLabel(p)}</td>
                      <td className="py-3">
                        {isSelf ? (
                          <span className="text-xs text-muted">Primary account — not editable here</span>
                        ) : (
                          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                            <form action={updateAction} className="flex flex-wrap items-center gap-2">
                              <input type="hidden" name="email" value={p.email} />
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  name="invitations"
                                  defaultChecked={access.canInvitations && !access.isFullAdmin}
                                  disabled={updatePending}
                                  className="rounded"
                                />
                                Invitations
                              </label>
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  name="certificates"
                                  defaultChecked={access.canCertificates && !access.isFullAdmin}
                                  disabled={updatePending}
                                  className="rounded"
                                />
                                Certificates
                              </label>
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  name="julyAwardCards"
                                  defaultChecked={access.canJulyAwardCards && !access.isFullAdmin}
                                  disabled={updatePending}
                                  className="rounded"
                                />
                                July Award cards
                              </label>
                              <label className="flex items-center gap-1 text-xs">
                                <input
                                  type="checkbox"
                                  name="julyAwardParticipants"
                                  defaultChecked={access.canJulyAwardParticipants && !access.isFullAdmin}
                                  disabled={updatePending}
                                  className="rounded"
                                />
                                July Award participants
                              </label>
                              <button
                                type="submit"
                                disabled={updatePending}
                                className="rounded-md border border-stone-300 px-2 py-1 text-xs dark:border-stone-600"
                              >
                                Update
                              </button>
                            </form>
                            <AdminPasswordResetForm email={p.email} />
                            <form action={revokeAction}>
                              <input type="hidden" name="email" value={p.email} />
                              <button
                                type="submit"
                                disabled={revokePending}
                                className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 dark:border-red-800 dark:text-red-300"
                              >
                                Remove
                              </button>
                            </form>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
