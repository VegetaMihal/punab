import { BloodHeroMainActions } from "@/components/bloodhero/BloodHeroMainActions";

/** Action-first hero: main flows before headline so mobile users see choices immediately. */
export function BloodHeroHeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-red-100/60 bg-gradient-to-b from-white via-red-50/40 to-white dark:border-red-950/30 dark:from-zinc-950 dark:via-red-950/20 dark:to-zinc-950">
      <div className="mx-auto max-w-5xl px-4 pb-14 pt-8 sm:px-6 sm:pb-20 sm:pt-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          {/* Mobile: card groups prompt + CTAs so the three actions read as one clear block */}
          <div className="mt-2 w-full max-w-md rounded-2xl border border-red-200/70 bg-white/95 p-5 shadow-sm ring-1 ring-red-100/40 dark:border-red-950/50 dark:bg-zinc-900/55 dark:ring-red-950/30 sm:mt-0 sm:max-w-none sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none sm:ring-0">
            <p className="text-[0.8125rem] font-semibold uppercase leading-snug tracking-[0.14em] text-zinc-600 dark:text-zinc-300 sm:text-xs sm:font-medium sm:tracking-[0.12em]">
              What do you need right now?
            </p>
            <div className="mt-5 flex w-full justify-center sm:mt-5">
              <BloodHeroMainActions />
            </div>
          </div>

          <h1 className="mt-10 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:mt-12 sm:text-4xl md:text-[2.75rem] md:leading-tight">
            When minutes matter,{" "}
            <span className="text-red-600 dark:text-red-400">good people</span> show up.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
            BloodHero helps connect willing donors with urgent requests—fast, human, and respectful. Built
            for real emergencies, not paperwork.
          </p>
          <p className="mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-400/90">
            Fast blood donor coordination by district and blood group.
          </p>
        </div>
      </div>
    </section>
  );
}
