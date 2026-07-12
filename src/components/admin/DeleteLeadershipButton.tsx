"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteLeadership } from "@/actions/admin";

export function DeleteLeadershipButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this entry?")) {
          return;
        }
        startTransition(async () => {
          await deleteLeadership(id);
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
