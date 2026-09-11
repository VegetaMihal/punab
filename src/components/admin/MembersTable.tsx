"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { approveMemberAccount, setMemberRole, setMembershipStatus } from "@/actions/admin";
import { accountStatusLabel } from "@/lib/org/labels";
import type { MembershipStatus, Profile } from "@/types/database";

const MEMBERSHIP_STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for review",
  approved: "Approved",
  rejected: "Not approved",
};

type Props = {
  members: Profile[];
};

export function MembersTable({ members }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [approveError, setApproveError] = useState<string | null>(null);

  function act(id: string, status: MembershipStatus) {
    startTransition(async () => {
      await setMembershipStatus(id, status);
      router.refresh();
    });
  }

  function approve(id: string) {
    setApproveError(null);
    startTransition(async () => {
      const result = await approveMemberAccount(id);
      if (result?.error) setApproveError(result.error);
      router.refresh();
    });
  }

  function toggleRole(id: string, nextRole: "admin" | "member") {
    setApproveError(null);
    startTransition(async () => {
      const result = await setMemberRole(id, nextRole);
      if (result?.error) setApproveError(result.error);
      router.refresh();
    });
  }

  if (members.length === 0) {
    return <p className="text-sm text-muted">No one has applied yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      {approveError && (
        <p className="mb-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {approveError}
        </p>
      )}
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-800">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Application</th>
            <th className="py-2 pr-4 font-medium">Login</th>
            <th className="py-2 pr-4 font-medium">Role</th>
            <th className="py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-stone-100 dark:border-stone-900">
              <td className="py-3 pr-4">{m.full_name}</td>
              <td className="py-3 pr-4 text-muted">{m.email}</td>
              <td className="py-3 pr-4">{MEMBERSHIP_STATUS_LABEL[m.membership_status] ?? m.membership_status}</td>
              <td className="py-3 pr-4">{accountStatusLabel(m.account_status)}</td>
              <td className="py-3 pr-4">
                <span
                  className={
                    m.role === "admin"
                      ? "rounded bg-brand-green/10 px-1.5 py-0.5 text-xs font-semibold text-brand-green"
                      : "text-xs text-muted"
                  }
                >
                  {m.role === "admin" ? "Admin" : "Member"}
                </span>
              </td>
              <td className="py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={pending || m.membership_status === "approved"}
                    onClick={() => approve(m.id)}
                    className="rounded-md bg-brand-green px-2 py-1 text-xs font-medium text-white disabled:opacity-40"
                  >
                    Approve &amp; email login details
                  </button>
                  {m.membership_status === "approved" &&
                    (m.role === "admin" ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggleRole(m.id, "member")}
                        className="rounded-md border border-stone-300 px-2 py-1 text-xs dark:border-stone-600"
                      >
                        Remove admin
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => toggleRole(m.id, "admin")}
                        className="rounded-md border border-brand-green px-2 py-1 text-xs font-medium text-brand-green"
                      >
                        Make admin
                      </button>
                    ))}
                  <button
                    type="button"
                    disabled={pending || m.membership_status === "rejected"}
                    onClick={() => act(m.id, "rejected")}
                    className="rounded-md border border-stone-300 px-2 py-1 text-xs dark:border-stone-600"
                  >
                    Turn down
                  </button>
                  <button
                    type="button"
                    disabled={pending || m.membership_status === "pending"}
                    onClick={() => act(m.id, "pending")}
                    className="rounded-md border border-stone-300 px-2 py-1 text-xs dark:border-stone-600"
                  >
                    Move back to waiting
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
