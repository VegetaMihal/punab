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
    <section className="border-b border-(--bh-line) bg-(--bh-panel) py-16 ">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="bh-display text-center text-2xl font-bold tracking-tight text-(--bh-ink) sm:text-3xl">
          How BloodHero works
        </h2>
        <p className="mt-1 text-center text-sm text-(--bh-ink-soft)" lang="bn">
          ব্লাডহিরো যেভাবে কাজ করে
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-(--bh-ink-soft) ">
          Four calm steps from intent to action—designed for stress and speed.
        </p>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li
              key={s.title}
              id={
                i === 0 ? "become-donor" : i === 1 ? "request-blood" : i === 3 ? "track-request" : undefined
              }
              className="scroll-mt-28 rounded-2xl border border-(--bh-line) bg-(--bh-panel) p-6 "
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--bh-blood-tint) text-sm font-bold text-(--bh-blood-deep) ">
                {i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-(--bh-ink) ">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-(--bh-ink-soft) ">{s.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
