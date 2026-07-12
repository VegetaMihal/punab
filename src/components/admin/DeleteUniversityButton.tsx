"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteUniversity } from "@/actions/admin";

export function DeleteUniversityButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this university? Chapters may lose their link.")) {
          return;
        }
        startTransition(async () => {
          await deleteUniversity(id);
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
