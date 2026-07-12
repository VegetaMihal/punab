const steps = [
  {
    title: "Register as donor",
    body: "Share your district, blood group, and contact details once. You stay in control of when you can help.",
  },
  {
    title: "Submit a blood request",
    body: "Someone in need—or their family—submits a short request with urgency, location, and blood group.",
  },
  {
    title: "We find eligible donors",
    body: "BloodHero matches the request to donors nearby who fit the blood group—quickly and fairly.",
  },
  {
    title: "Track response & confirmation",
    body: "Follow status updates and confirmations through simple, secure email links—no app required.",
  },
] as const;

/** Edit `steps` array above to change card titles and copy. */
export function BloodHeroHowItWorks() {
  return (
    <section className="border-b border-zinc-200/80 bg-white py-16 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
          How BloodHero works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-zinc-600 dark:text-zinc-400">
          Four calm steps from intent to action—designed for stress and speed.
        </p>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.title}
              id={
                i === 0 ? "become-donor" : i === 1 ? "request-blood" : i === 3 ? "track-request" : undefined
              }
              className="scroll-mt-28 rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{s.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
