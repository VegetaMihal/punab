export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="skeleton h-9 w-52" />
      <div className="skeleton mt-4 h-4 w-72" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="skeleton h-32 rounded-[var(--radius-md)]" />
        <div className="skeleton h-32 rounded-[var(--radius-md)]" />
        <div className="skeleton h-32 rounded-[var(--radius-md)]" />
      </div>
    </div>
  );
}
