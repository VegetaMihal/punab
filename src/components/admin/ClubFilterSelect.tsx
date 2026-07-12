"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ClubFilterSelect({ clubs }: { clubs: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("club") ?? "";

  function handleChange(value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set("club", value);
    } else {
      next.delete("club");
    }
    router.push(`?${next.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900"
    >
      <option value="">All clubs</option>
      {clubs.map((club) => (
        <option key={club} value={club}>
          {club}
        </option>
      ))}
    </select>
  );
}
