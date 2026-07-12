"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteEvent } from "@/actions/admin";

export function DeleteEventButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this event?")) {
          return;
        }
        startTransition(async () => {
          await deleteEvent(id);
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
