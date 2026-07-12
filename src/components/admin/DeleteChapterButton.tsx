"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteChapter } from "@/actions/admin";

export function DeleteChapterButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this chapter?")) {
          return;
        }
        startTransition(async () => {
          await deleteChapter(id);
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
