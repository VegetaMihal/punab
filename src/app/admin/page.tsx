import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { defaultAdminHome } from "@/lib/auth/admin-access";
import { getSessionProfile } from "@/lib/auth/session";
import { EmptyState } from "@/components/ui/EmptyState";
import { prisma } from "@/lib/db/prisma";
import { getAdminDashboardCounts } from "@/lib/repositories/admin-stats-repository";
import { countPendingMembers } from "@/lib/repositories/profiles-repository";

export const metadata = {
  title: "Admin",
};

const quickLinks = [
  { label: "Site content", href: "/admin/site-content" },
  { label: "Members", href: "/admin/members" },
  { label: "Notices", href: "/admin/notices" },
  { label: "Events", href: "/admin/events" },
  { label: "Archive", href: "/admin/gallery" },
  { label: "Leadership", href: "/admin/leadership" },
  { label: "Chapters", href: "/admin/chapters" },
  { label: "Forums", href: "/admin/forums" },
];

export default async function AdminHomePage() {
  const { adminAccess } = await getSessionProfile();
  if (adminAccess && !adminAccess.isFullAdmin) {
    redirect(defaultAdminHome(adminAccess));
  }

  let counts: Awaited<ReturnType<typeof getAdminDashboardCounts>> | null = null;
  let countsError: string | null = null;
  let pendingMembers = 0;
  let publishedEvents = 0;
  let publishedNotices = 0;

  try {
    counts = await getAdminDashboardCounts();
  } catch (e) {
    countsError = e instanceof Error ? e.message : "Database error";
  }
  try {
    const [pending, ev, no] = await Promise.all([
      countPendingMembers(),
      prisma.event.count({ where: { is_published: true } }),
      prisma.notice.count({ where: { is_published: true } }),
    ]);
    pendingMembers = pending;
    publishedEvents = ev;
    publishedNotices = no;
  } catch {
    /* optional metrics */
  }

  const cards = counts
    ? [
        { label: "Site Content", value: counts.siteSettings, href: "/admin/site-content" },
        { label: "Archive", value: counts.galleries, href: "/admin/gallery" },
        { label: "Notices", value: counts.notices, href: "/admin/notices" },
        { label: "Events", value: counts.events, href: "/admin/events" },
        { label: "Executive leadership", value: counts.leadership, href: "/admin/leadership" },
        { label: "Chapters", value: counts.chapters, href: "/admin/chapters" },
        { label: "Forums", value: counts.forums, href: "/admin/forums" },
        { label: "Members", value: counts.members, href: "/admin/members" },
      ]
    : [];

  return (
    <div>
      <h1 className="text-h2 text-[color:var(--color-text)]">Admin dashboard</h1>
      <p className="mt-1 text-small text-[color:var(--color-text-muted)]">Quick access to daily content management.</p>

      {countsError && (
        <div className="mt-6 rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-warning)_45%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-warning)_10%,var(--color-surface))] px-4 py-3 text-small text-[color:var(--color-text)]">
          <p className="font-semibold">Could not load dashboard counts</p>
          <p className="mt-1 font-mono text-xs opacity-90">{countsError}</p>
          <p className="mt-2 text-[color:var(--color-text-muted)]">
            Confirm <code className="rounded-[var(--radius-sm)] bg-[color:var(--color-surface-2)] px-1">DATABASE_URL</code> points at your Supabase Postgres and that all app tables exist (run{" "}
            <code className="rounded-[var(--radius-sm)] bg-[color:var(--color-surface-2)] px-1">supabase/schema.sql</code> or migrations from{" "}
            <code className="rounded-[var(--radius-sm)] bg-[color:var(--color-surface-2)] px-1">SETUP.md</code>
            ). Sidebar links may still work if the failing table is optional.
          </p>
        </div>
      )}

      {!countsError && counts && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card variant="default" className="p-5">
              <p className="text-small font-medium text-[color:var(--color-text-muted)]">Total members</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[color:var(--color-text)]">{counts.members}</p>
            </Card>
            <Card variant="default" className="p-5">
              <p className="text-small font-medium text-[color:var(--color-text-muted)]">Pending approvals</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[color:var(--color-warning)]">{pendingMembers}</p>
            </Card>
            <Card variant="default" className="p-5">
              <p className="text-small font-medium text-[color:var(--color-text-muted)]">Published events</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[color:var(--color-text)]">{publishedEvents}</p>
            </Card>
            <Card variant="default" className="p-5">
              <p className="text-small font-medium text-[color:var(--color-text-muted)]">Published notices</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-[color:var(--color-text)]">{publishedNotices}</p>
            </Card>
          </div>

          <div className="mt-8 flex flex-wrap gap-2">
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="inline-flex rounded-[var(--radius-full)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text-2)] motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)] hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]"
              >
                {q.label}
              </Link>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="text-h3 text-[color:var(--color-text)]">Recent activity</h2>
            <div className="mt-4">
              <EmptyState
                title="No activity feed yet"
                description="Pending notices, events, and member actions will surface here when a feed is connected."
              />
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Link key={c.label} href={c.href}>
                <Card variant="default" className="h-full p-5 motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[color:var(--color-brand-light)] motion-safe:hover:shadow-[var(--shadow-md)]">
                  <p className="text-small font-medium text-[color:var(--color-text-muted)]">{c.label}</p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums text-[color:var(--color-text)]">{c.value}</p>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
