"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteForumLabel } from "@/actions/admin";

export function DeleteForumLabelButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this label? Members in this section may lose their grouping.")) {
          return;
        }
        startTransition(async () => {
          await deleteForumLabel(id);
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
