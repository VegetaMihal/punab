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
      <h1 className="bh-display mt-2 text-2xl font-semibold text-(--bh-ink) ">
        This page could not be loaded
      </h1>
      <p className="mt-3 text-sm text-(--bh-ink-soft) ">
        A server error occurred. Try again in a moment.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-lg bg-(--bh-blood) px-4 py-2 text-sm font-bold text-(--bh-on-blood) hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-sm font-medium text-(--bh-ink-soft) underline underline-offset-4 hover:text-(--bh-ink) "
        >
          Home
        </Link>
      </div>
    </div>
  );
}
