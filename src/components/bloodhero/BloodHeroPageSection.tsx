type Props = {
  children: React.ReactNode;
  className?: string;
};

/** Content wrapper for placeholder / future forms — stack sections inside `page.tsx`. */
export function BloodHeroPageSection({ children, className = "" }: Props) {
  return (
    <section className={`mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12 ${className}`}>
      <div className="rounded-2xl border border-(--bh-line) bg-(--bh-panel) p-6 sm:p-8">
        {children}
      </div>
    </section>
  );
}
