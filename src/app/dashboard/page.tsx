import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSessionProfile } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { countPendingMembers } from "@/lib/repositories/profiles-repository";
import type { Profile } from "@/types/database";

export const metadata = {
  title: "Dashboard",
};

type DashboardPageProps = {
  searchParams?: Promise<{ notice?: string }>;
};

function profileCompletionPercent(profile: Profile) {
  const fields = [
    profile.phone,
    profile.department,
    profile.student_id,
    profile.session,
    profile.district,
    profile.photo_url,
    profile.university_id || profile.university_other,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

function membershipBadgeClass(status: Profile["membership_status"]) {
  if (status === "pending") {
    return "border-[color:color-mix(in_srgb,var(--color-warning)_40%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-warning)_12%,var(--color-surface))] text-[color:var(--color-warning)]";
  }
  if (status === "approved") {
    return "border-[color:color-mix(in_srgb,var(--color-success)_40%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_12%,var(--color-surface))] text-[color:var(--color-success)]";
  }
  return "border-[color:color-mix(in_srgb,var(--color-error)_40%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_12%,var(--color-surface))] text-[color:var(--color-error)]";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = (await searchParams) ?? {};
  const adminAccessNotice = params.notice === "admin-access";

  const { user, profile } = await getSessionProfile();

  let pendingCount: number | null = null;
  if (profile?.role === "admin") {
    pendingCount = await countPendingMembers();
  }

  if (!user || !profile) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <EmptyState
          title="Profile unavailable"
          description="Sign out and sign back in. If the issue continues, contact the secretariat."
        />
      </div>
    );
  }

  let universityName = "Not set";
  if (profile.university_id) {
    const uni = await prisma.university.findUnique({
      where: { id: profile.university_id },
      select: { name: true },
    });
    universityName = uni?.name ?? "Not set";
  } else if (profile.university_other) {
    universityName = profile.university_other;
  }

  const completion = profileCompletionPercent(profile);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
      {adminAccessNotice && (
        <div className="mb-8 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-4 text-small text-[color:var(--color-text-2)]">
          <p className="font-semibold text-[color:var(--color-text)]">PUNAB admin is not available for this session</p>
          <p className="mt-2 text-[color:var(--color-text-muted)]">
            The site checks <strong className="text-[color:var(--color-text)]">profiles.role</strong> in the database used by{" "}
            <code className="rounded-[var(--radius-sm)] bg-[color:var(--color-surface-3)] px-1 py-0.5 text-xs">DATABASE_URL</code>{" "}
            (Prisma). It must be the <strong className="text-[color:var(--color-text)]">same Supabase project</strong> as your auth keys (
            <code className="rounded-[var(--radius-sm)] bg-[color:var(--color-surface-3)] px-1 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code>
            ).
          </p>
          <p className="mt-2 text-[color:var(--color-text-muted)]">
            In Supabase <strong className="text-[color:var(--color-text)]">SQL Editor</strong>, promote your account (use the email you log in with), then sign out and sign in again:
          </p>
          <pre className="mt-2 overflow-x-auto rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 text-xs text-[color:var(--color-text)]">
            {`update public.profiles
set role = 'admin'
where email = 'your-email@example.com';`}
          </pre>
          <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
            BloodHero-only coordinators (<code className="rounded-[var(--radius-sm)] bg-[color:var(--color-surface-3)] px-1">bloodhero_admin_access</code>) do not open PUNAB{" "}
            <code className="rounded-[var(--radius-sm)] bg-[color:var(--color-surface-3)] px-1">/admin</code> until{" "}
            <code className="rounded-[var(--radius-sm)] bg-[color:var(--color-surface-3)] px-1">profiles.role</code> is{" "}
            <code className="rounded-[var(--radius-sm)] bg-[color:var(--color-surface-3)] px-1">admin</code>.
          </p>
        </div>
      )}

      <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-6 shadow-[var(--shadow-sm)] md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-small text-[color:var(--color-text-muted)]">{profile.email}</p>
            <h1 className="text-h2 mt-1 text-[color:var(--color-text)]">Welcome, {profile.full_name}</h1>
          </div>
          <span
            className={`inline-flex w-fit rounded-[var(--radius-full)] border px-4 py-1.5 text-sm font-semibold capitalize ${membershipBadgeClass(profile.membership_status)}`}
          >
            {profile.membership_status}
          </span>
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between text-small font-medium text-[color:var(--color-text-2)]">
            <span>Profile completion</span>
            <span>{completion}%</span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-[var(--radius-full)] bg-[color:var(--color-surface-3)]"
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Profile completion"
          >
            <div
              className="h-full rounded-[var(--radius-full)] bg-[color:var(--color-brand)] motion-safe:transition-[width] motion-safe:duration-[var(--transition-slow)]"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      {profile.role === "admin" && (
        <div className="mt-8 rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--brand-green)_35%,var(--color-border))] bg-[color:var(--brand-green-muted)] px-4 py-4 dark:bg-[color:color-mix(in_srgb,var(--brand-green)_15%,var(--color-surface-2))]">
          <p className="text-small font-semibold text-[color:var(--color-text)]">Site administration</p>
          <p className="mt-1 text-small text-[color:var(--color-text-muted)]">
            Content, members, notices, and events are managed in the admin area—not on this page. After you log in you are sent there automatically; use the button below if you landed here.
          </p>
          <Link
            href="/admin"
            className="mt-3 inline-flex rounded-[var(--radius-full)] bg-[color:var(--brand-green)] px-5 py-2.5 text-sm font-semibold text-[color:var(--color-surface)] motion-safe:transition-opacity motion-safe:duration-[var(--transition-fast)] hover:opacity-95"
          >
            Open admin dashboard
          </Link>
        </div>
      )}

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card variant="default">
          <p className="text-small font-medium text-[color:var(--color-text-muted)]">Membership</p>
          <p className="mt-1 text-2xl font-semibold capitalize text-[color:var(--color-text)]">{profile.membership_status}</p>
          <Link
            href="/join"
            className="mt-3 inline-block text-small font-semibold text-[color:var(--accent)] hover:text-[color:var(--color-brand)] motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)]"
          >
            View or edit application
          </Link>
        </Card>
        <Card variant="default">
          <p className="text-small font-medium text-[color:var(--color-text-muted)]">Access level</p>
          <p className="mt-1 text-2xl font-semibold capitalize text-[color:var(--color-text)]">{profile.role}</p>
        </Card>
        <Card variant="default">
          <p className="text-small font-medium text-[color:var(--color-text-muted)]">University</p>
          <p className="mt-1 text-lg font-semibold text-[color:var(--color-text)]">{universityName}</p>
          <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">{profile.department || "Department not set"}</p>
        </Card>
        {profile.role === "admin" && pendingCount !== null && (
          <Card variant="default">
            <p className="text-small font-medium text-[color:var(--color-text-muted)]">Applications awaiting review</p>
            <p className="mt-1 text-2xl font-semibold text-[color:var(--color-brand)]">{pendingCount}</p>
            <Link
              href="/admin/members"
              className="mt-3 inline-block text-small font-semibold text-[color:var(--accent)] hover:text-[color:var(--color-brand)] motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)]"
            >
              Open member queue
            </Link>
          </Card>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-h3 text-[color:var(--color-text)]">Quick actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Link href="/events">
            <Card variant="elevated" className="h-full p-5 motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-0.5">
              <p className="font-semibold text-[color:var(--color-text)]">Browse events</p>
              <p className="text-small mt-1 text-[color:var(--color-text-muted)]">See upcoming programmes and meetings.</p>
            </Card>
          </Link>
          <Link href="/notices">
            <Card variant="elevated" className="h-full p-5 motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-0.5">
              <p className="font-semibold text-[color:var(--color-text)]">Read notices</p>
              <p className="text-small mt-1 text-[color:var(--color-text-muted)]">Official letters and updates.</p>
            </Card>
          </Link>
          <Link href="/dashboard/profile">
            <Card variant="elevated" className="h-full p-5 motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-0.5">
              <p className="font-semibold text-[color:var(--color-text)]">Update profile</p>
              <p className="text-small mt-1 text-[color:var(--color-text-muted)]">Keep your chapter details current.</p>
            </Card>
          </Link>
          <Link href="/join">
            <Card variant="elevated" className="h-full p-5 motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-0.5">
              <p className="font-semibold text-[color:var(--color-text)]">Membership details</p>
              <p className="text-small mt-1 text-[color:var(--color-text-muted)]">Review your application information.</p>
            </Card>
          </Link>
        </div>
      </div>

      {profile.membership_status === "pending" && (
        <div className="mt-10 rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-warning)_40%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-warning)_10%,var(--color-surface))] px-4 py-3 text-small text-[color:var(--color-text)]">
          Membership pending. Confirm your application on{" "}
          <Link href="/join" className="font-semibold underline decoration-[color:var(--color-brand)]">
            Join PUNAB
          </Link>{" "}
          is complete and up to date.
        </div>
      )}
    </div>
  );
}
