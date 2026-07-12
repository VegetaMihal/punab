const groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

/** Visual blood group chips only — edit `groups` if labels change. */
export function BloodHeroBloodGroups() {
  return (
    <section id="blood-groups" className="border-b border-zinc-200/80 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Every group matters
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm text-zinc-600 dark:text-zinc-400">
          We coordinate across all major blood groups—visual reference for donors and families.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {groups.map((g) => (
            <div
              key={g}
              className="flex min-w-[4.25rem] items-center justify-center rounded-xl border-2 border-red-200 bg-white px-4 py-3 text-lg font-bold tracking-wide text-red-700 shadow-sm dark:border-red-900/60 dark:bg-zinc-950 dark:text-red-400"
            >
              {g}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
