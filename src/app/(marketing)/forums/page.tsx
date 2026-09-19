export const revalidate = 60;

import { ForumDirectoryCard } from "@/components/forums/ForumDirectoryCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { listPublishedForums } from "@/lib/repositories/forums-repository";
import type { Forum } from "@/types/database";

export const metadata = {
  title: "Forums",
};

export default async function ForumsDirectoryPage() {
  let forums: Forum[] = [];
  let error: string | null = null;
  try {
    forums = await listPublishedForums();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <>
      <PageHeader
        title="Forums"
        description="PUNAB wings forums — debate, media, and more. Open a forum to see moderators and teams."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Wings" }, { label: "Forums" }]}
      />
      <MarketingContainer className="py-12 md:py-16">
        {error && <EmptyState title="Unable to load forums" description={error} />}
        {!error && forums.length === 0 && (
          <EmptyState
            title="No forums published yet"
            description="Nothing is listed here yet. Check back later."
          />
        )}
        {!error && forums.length > 0 && (
          <>
            <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {forums.map((f, i) => (
                <li key={f.id} className="h-full">
                  <ForumDirectoryCard forum={f} index={i} />
                </li>
              ))}
            </ul>
          </>
        )}
      </MarketingContainer>
    </>
  );
}
