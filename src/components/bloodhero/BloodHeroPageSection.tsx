type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Content wrapper for placeholder / future forms — stack sections inside `page.tsx`. */
export function BloodHeroPageSection({ children, className = "" }: Props) {
  return (
    <section className={`mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 ${className}`}>
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40 sm:p-8">
        {children}
      </div>
    </section>
  );
}
