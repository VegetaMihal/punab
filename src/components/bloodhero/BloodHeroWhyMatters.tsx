/** Emotional / mission copy — edit paragraph text here. */
export function BloodHeroWhyMatters() {
  return (
    <section className="border-b border-(--bh-line) bg-(--bh-panel) py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="bh-display text-2xl font-bold tracking-tight text-(--bh-ink) sm:text-3xl">Why BloodHero matters</h2>
        <p className="mt-6 text-base leading-relaxed text-(--bh-ink-soft) sm:text-lg">
          Every donation is a second chance—often for a stranger's parent, child, or friend. BloodHero exists
          to shrink the gap between <strong className="font-bold text-(--bh-blood-deep)">"someone needs blood"</strong>{" "}
          and <strong className="font-bold text-(--bh-blood-deep)">"someone answered."</strong>
        </p>
        <p className="mt-5 text-sm leading-relaxed text-(--bh-ink-soft)">
          No public login wall for those asking for help. Short forms, clear steps, and respectful follow-up—so
          families can focus on the person in the bed, not the bureaucracy.
        </p>
      </div>
    </section>
  );
}
