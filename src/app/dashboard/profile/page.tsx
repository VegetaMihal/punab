import { PhotoUpload } from "@/components/member/PhotoUpload";
import { ApplicationForm } from "@/components/member/ApplicationForm";
import { SmartBackLink } from "@/components/ui/SmartBackLink";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSessionProfile } from "@/lib/auth/session";
import { listUniversitiesForOptions } from "@/lib/repositories/chapters-repository";

export const metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { user, profile } = await getSessionProfile();
  const universities = await listUniversitiesForOptions();

  if (!user || !profile) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <EmptyState title="Profile unavailable" description="Sign in again or contact the secretariat." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Profile</h1>
      <p className="mt-1 text-sm text-muted">
        Membership:{" "}
        <span className="font-medium capitalize text-stone-800 dark:text-stone-200">{profile.membership_status}</span>
      </p>

      <div className="mt-8 space-y-8">
        <Card>
          <h2 className="text-lg font-semibold">Photo</h2>
          <div className="mt-4">
            <PhotoUpload userId={user.id} currentUrl={profile.photo_url} />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Application details</h2>
          <div className="mt-4">
            <ApplicationForm profile={profile} universities={universities} />
          </div>
        </Card>
        <p className="text-center text-sm text-muted">
          <SmartBackLink fallbackHref="/dashboard" className="font-medium text-accent hover:underline">
            ← Back to dashboard
          </SmartBackLink>
        </p>
      </div>
    </div>
  );
}
