import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AdminAccessEditor } from "@/components/admin/AdminAccessEditor";
import { getSessionProfile } from "@/lib/auth/session";
import { getProfileById } from "@/lib/repositories/admin-access-repository";

export const metadata = {
  title: "Manage admin",
};

// Access changes must never be served from a cached render.
export const dynamic = "force-dynamic";

export default async function AdminAccessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, isFullAdmin } = await getSessionProfile();
  if (!isFullAdmin) {
    redirect("/dashboard?notice=admin-access");
  }

  const profile = await getProfileById(id);
  if (!profile || profile.role !== "admin") {
    notFound();
  }
  if (profile.id === user?.id) {
    redirect("/admin/access");
  }

  return (
    <div>
      <Link href="/admin/access" className="text-xs text-accent hover:underline">
        ← Admin access
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-50">{profile.full_name}</h1>
      <p className="mt-1 text-sm text-muted">{profile.email}</p>
      <div className="mt-8 max-w-2xl rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
        <AdminAccessEditor profile={profile} />
      </div>
    </div>
  );
}
