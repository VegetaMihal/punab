export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-stone-200 dark:bg-stone-800" />
      <div className="h-4 w-72 rounded bg-stone-200 dark:bg-stone-800" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-xl bg-stone-200 dark:bg-stone-800" />
        <div className="h-24 rounded-xl bg-stone-200 dark:bg-stone-800" />
        <div className="h-24 rounded-xl bg-stone-200 dark:bg-stone-800" />
      </div>
    </div>
  );
}
