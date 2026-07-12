"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteForumMember } from "@/actions/admin";

type Props = {
  id: string;
  /** If set, navigate here after delete (e.g. back to list from edit page). */
  redirectAfterDelete?: string;
};

export function DeleteForumMemberButton({ id, redirectAfterDelete }: Props) {
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
          await deleteForumMember(id);
          if (redirectAfterDelete) {
            router.push(redirectAfterDelete);
          }
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
