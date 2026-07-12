function CheckGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const benefits = [
  "No account needed for public users requesting blood",
  "Smart donor matching by district and blood group",
  "Secure email action links—no password to remember in a crisis",
  "Donation tracking from request to closure",
  "Certificates for successful donations (coming with full launch)",
] as const;

/** Benefits list — edit `benefits` above. */
export function BloodHeroBenefits() {
  return (
    <section className="border-b border-zinc-200/80 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          Built for trust
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-zinc-600 dark:text-zinc-400">
          Simple on the outside, careful on the inside—so help arrives faster.
        </p>
        <ul className="mx-auto mt-12 max-w-2xl space-y-4">
          {benefits.map((line) => (
            <li
              key={line}
              className="flex gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <CheckGlyph className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
