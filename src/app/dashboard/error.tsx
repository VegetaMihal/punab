"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  prismaDbErrorHint,
  readPrismaErrorMeta,
} from "@/lib/db/prisma-error-hints";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const meta = readPrismaErrorMeta(error);
  const hint = prismaDbErrorHint(meta);
  const isDev = process.env.NODE_ENV === "development";

  useEffect(() => {
    console.error("[dashboard route error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-sm font-medium text-brand-red">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-50">
        This page could not be loaded
      </h1>
      <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
        {hint ?? "A server error occurred. Try again in a moment."}
      </p>
      {isDev && meta.code && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-mono text-xs text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          Prisma / DB code: {meta.code}
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-stone-600 underline underline-offset-4 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          Dashboard home
        </Link>
      </div>
    </div>
  );
}
