"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function BloodHeroError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[bloodhero route error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-sm font-medium text-brand-red">Something went wrong</p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900 dark:text-stone-50">
        This page could not be loaded
      </h1>
      <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
        A server error occurred. Try again in a moment.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-brand-red px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm font-medium text-stone-600 underline underline-offset-4 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
