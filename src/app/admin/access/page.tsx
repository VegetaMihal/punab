import { redirect } from "next/navigation";
import { AdminAccessManager } from "@/components/admin/AdminAccessManager";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSessionProfile } from "@/lib/auth/session";
import { listAdminProfiles } from "@/lib/repositories/admin-access-repository";

export const metadata = {
  title: "Admin access",
};

export default async function AdminAccessPage() {
  const { user, profile, isFullAdmin } = await getSessionProfile();
  if (!isFullAdmin) {
    redirect("/dashboard?notice=admin-access");
  }

  let admins: Awaited<ReturnType<typeof listAdminProfiles>> = [];
  let error: string | null = null;
  try {
    admins = await listAdminProfiles();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load";
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Admin access</h1>
      <p className="mt-1 text-sm text-muted">
        Add coordinators by email and password — they can log in immediately without signing up. Leave both scopes
        unchecked when adding for full admin.
      </p>
      <div className="mt-8 rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        {error && <EmptyState title="Could not load admins" description={error} />}
        {!error && user && (
          <AdminAccessManager admins={admins} currentUserEmail={profile?.email ?? user.email ?? ""} />
        )}
      </div>
    </div>
  );
}
