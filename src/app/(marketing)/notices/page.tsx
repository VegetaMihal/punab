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
          <ul className="grid gap-9 md:grid-cols-2">
            {notices.map((n, i) => (
              <li key={n.id}>
                <Reveal staggerIndex={i % 6}>
                  <Link
                    href={`/notices/${n.id}`}
                    className={`wall-sheet wall-text block h-full p-6 pt-9 ${i % 2 === 0 ? "-rotate-1" : "rotate-1"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-[#c41e3a] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#fffaf2]">
                        Notice
                      </span>
                      {n.published_at && (
                        <time dateTime={n.published_at} className="text-small font-semibold tabular-nums text-[#3a382f]">
                          {new Date(n.published_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                      )}
                    </div>
                    <h2 className="text-h3 mt-4 text-[#1b1a17]">{n.title}</h2>
                    {n.excerpt && <p className="text-small mt-3 line-clamp-4 leading-relaxed text-[#3a382f]">{n.excerpt}</p>}
                    <span className="mt-5 inline-block border-b-[3px] border-[#c41e3a] pb-0.5 text-small font-extrabold uppercase tracking-wide text-[#a5182f]">
                      Read notice →
                    </span>
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
