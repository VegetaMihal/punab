"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteLeadershipLayer } from "@/actions/admin";

export function DeleteLeadershipLayerButton({ id, disabledReason }: { id: string; disabledReason?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (disabledReason) {
    return (
      <span className="text-xs text-muted" title={disabledReason}>
        Cannot delete
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this layer? Members in this layer will become unassigned.")) {
          return;
        }
        startTransition(async () => {
          const res = await deleteLeadershipLayer(id);
          if (res && "error" in res && res.error) {
            alert(res.error);
            return;
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
