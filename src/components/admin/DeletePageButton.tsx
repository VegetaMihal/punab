"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deletePage } from "@/actions/cms";

export function DeletePageButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this page?")) {
          return;
        }
        startTransition(async () => {
          const res = await deletePage(id);
          if (res.error) {
            toast.error(res.error);
            return;
          }
          toast.success("Page deleted");
          router.push("/admin/pages");
          router.refresh();
        });
      }}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      Delete
    </button>
  );
}
