"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { seedStandardHierarchyScheme } from "@/actions/org";

export function SeedStandardSchemeButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      {error && <p className="mb-2 text-xs text-red-700 dark:text-red-300">{error}</p>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await seedStandardHierarchyScheme();
            if (result?.error) setError(result.error);
            router.refresh();
          })
        }
        className="rounded-md bg-brand-green px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
      >
        {pending ? "Setting up…" : "Set up standard levels"}
      </button>
    </div>
  );
}
