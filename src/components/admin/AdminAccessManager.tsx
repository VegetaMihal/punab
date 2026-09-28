"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  grantAdminAccessAction,
  type AdminAccessActionState,
} from "@/actions/admin-access";
import { AdminMemberCombobox } from "@/components/admin/AdminMemberCombobox";
import { ADMIN_ROLES, matchAdminRole, resolveAdminAccess } from "@/lib/auth/admin-access";
import type { AdminTitle, Profile } from "@/types/database";

type Props = {
  admins: Profile[];
};

const initial: AdminAccessActionState = {};

const ADMIN_TITLE_LABELS: Record<AdminTitle, string> = {
  central_forum_secretary: "Central Forum Management Secretary",
  central_committee_officer: "Authorized Central Committee Officer",
};

function accessBadge(profile: Profile): string {
  const access = resolveAdminAccess(profile);
  if (access.isFullAdmin) return "Full admin";
  const role = matchAdminRole(access.scopes);
  const parts = [role ? role.label : access.scopes.length ? "Custom" : "No scopes"];
  if (access.hasScope("org_portal")) {
    parts.push(`Org Portal${profile.admin_title ? ` — ${ADMIN_TITLE_LABELS[profile.admin_title]}` : ""}`);
  }
  return parts.join(", ");
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
        Added.
      </p>
    );
  }
  return null;
}

export function AdminAccessManager({ admins }: Props) {
  const [grantState, grantAction, grantPending] = useActionState(grantAdminAccessAction, initial);
  const [role, setRole] = useState("");

  return (
    <div className="space-y-8">
      <StatusBanner state={grantState} />

      <section>
        <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Add admin access</h2>
        <p className="mt-1 text-xs text-muted">
          Search an already-approved member and pick a role — no manual email/password account creation
          here. Leave role unset for full admin, or pick Custom to hand-pick sections on the next page.
        </p>
        <p className="mt-1 text-xs text-muted">
          Org Portal here is for Authorized Central Committee Officers (org-wide, permission-based).
          Forum Secretary / Convenor access is not granted here — it comes automatically from a
          member&apos;s seat on a Forum (Forum page → Add Member).
        </p>
        <form action={grantAction} className="mt-4 flex flex-col gap-3">
          <AdminMemberCombobox name="memberId" />
          <div className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[220px] flex-col gap-1 text-xs">
              <span className="font-medium text-stone-700 dark:text-stone-300">Role</span>
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
              >
                <option value="">Full admin</option>
                {ADMIN_ROLES.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
                <option value="custom">Custom — pick sections after adding</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" name="orgPortal" className="rounded" />
              + Org Portal
            </label>
            <label className="flex min-w-[220px] max-w-sm flex-col gap-1 text-xs">
              <span className="font-medium text-stone-700 dark:text-stone-300">Org Portal job title</span>
              <select
                name="adminTitle"
                defaultValue=""
                className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
              >
                <option value="">— none —</option>
                <option value="central_forum_secretary">Central Forum Management Secretary</option>
                <option value="central_committee_officer">Authorized Central Committee Officer</option>
              </select>
            </label>
          </div>
          {ADMIN_ROLES.find((r) => r.key === role) && (
            <p className="text-xs text-muted">{ADMIN_ROLES.find((r) => r.key === role)?.description}</p>
          )}
          <button
            type="submit"
            disabled={grantPending}
            className="w-fit rounded-md bg-brand-green px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
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
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800">
                  <th className="py-2 pr-4 font-medium">Email</th>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Access</th>
                  <th className="py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {admins.map((p) => (
                  <tr key={p.id} className="border-b border-stone-100 dark:border-stone-900">
                    <td className="py-3 pr-4 font-mono text-xs">{p.email}</td>
                    <td className="py-3 pr-4">{p.full_name}</td>
                    <td className="py-3 pr-4 text-muted">{accessBadge(p)}</td>
                    <td className="py-3">
                      <Link href={`/admin/access/${p.id}`} className="text-xs text-accent hover:underline">
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
