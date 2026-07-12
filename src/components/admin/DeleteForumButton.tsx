"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteForum } from "@/actions/admin";

export function DeleteForumButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this forum and all its labels and members?")) {
          return;
        }
        startTransition(async () => {
          await deleteForum(id);
          router.push("/admin/forums");
          router.refresh();
        });
      }}
      className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
    >
      Delete forum
    </button>
  );
}
