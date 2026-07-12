"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setMembershipStatus } from "@/actions/admin";
import type { MembershipStatus, Profile } from "@/types/database";

type Props = {
  members: Profile[];
};

export function MembersTable({ members }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function act(id: string, status: MembershipStatus) {
    startTransition(async () => {
      await setMembershipStatus(id, status);
      router.refresh();
    });
  }

  if (members.length === 0) {
    return <p className="text-sm text-muted">No member profiles.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-stone-200 dark:border-stone-800">
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="border-b border-stone-100 dark:border-stone-900">
              <td className="py-3 pr-4">{m.full_name}</td>
              <td className="py-3 pr-4 text-muted">{m.email}</td>
              <td className="py-3 pr-4 capitalize">{m.membership_status}</td>
              <td className="py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={pending || m.membership_status === "approved"}
                    onClick={() => act(m.id, "approved")}
                    className="rounded-md bg-brand-green px-2 py-1 text-xs font-medium text-white disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={pending || m.membership_status === "rejected"}
                    onClick={() => act(m.id, "rejected")}
                    className="rounded-md border border-stone-300 px-2 py-1 text-xs dark:border-stone-600"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    disabled={pending || m.membership_status === "pending"}
                    onClick={() => act(m.id, "pending")}
                    className="rounded-md border border-stone-300 px-2 py-1 text-xs dark:border-stone-600"
                  >
                    Pending
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
