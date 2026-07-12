export const revalidate = 60;

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { listPublishedNoticesSummary } from "@/lib/repositories/notices-repository";

export const metadata = {
  title: "Notices & news",
};

export default async function NoticesPage() {
  let notices: Awaited<ReturnType<typeof listPublishedNoticesSummary>> = [];
  let error: string | null = null;
  try {
    notices = await listPublishedNoticesSummary();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error";
  }

  return (
    <>
      <PageHeader
        title="Notices & news"
        description="Official letters, circulars, and secretariat updates—newest first."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Notices" }]}
      />
      <MarketingContainer className="py-12 md:py-16">
        {error && <EmptyState title="Unable to load notices" description={error} />}
        {!error && notices.length === 0 && (
          <EmptyState title="No notices published" description="Official notices will appear here once they are released." />
        )}
        {!error && notices.length > 0 && (
          <ul className="divide-y divide-[color:var(--color-border)] rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[var(--shadow-sm)]">
            {notices.map((n, i) => (
              <li
                key={n.id}
                className="motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)] hover:bg-[color:var(--color-surface-2)]"
              >
                <Reveal staggerIndex={i % 6}>
                  <Link href={`/notices/${n.id}`} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:gap-6 sm:p-5">
                    <div className="flex shrink-0 flex-row items-center gap-3 sm:w-40 sm:flex-col sm:items-start">
                      {n.published_at ? (
                        <time
                          dateTime={n.published_at}
                          className="text-small font-semibold tabular-nums text-[color:var(--color-text-2)]"
                        >
                          {new Date(n.published_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                      ) : (
                        <span className="text-small text-[color:var(--color-text-muted)]">—</span>
                      )}
                      <span className="inline-flex w-fit rounded-[var(--radius-full)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]">
                        Notice
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-h3 text-[color:var(--color-text)]">{n.title}</h2>
                      {n.excerpt && <p className="text-small mt-2 text-[color:var(--color-text-muted)]">{n.excerpt}</p>}
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </MarketingContainer>
    </>
  );
}
