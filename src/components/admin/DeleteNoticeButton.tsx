"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteNotice } from "@/actions/admin";

export function DeleteNoticeButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this notice?")) {
          return;
        }
        startTransition(async () => {
          await deleteNotice(id);
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
