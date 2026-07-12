import { notFound } from "next/navigation";
import { SmartBackLink } from "@/components/ui/SmartBackLink";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublishedNoticeById } from "@/lib/repositories/notices-repository";

type Props = { params: Promise<{ id: string }> };

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const notice = await getPublishedNoticeById(id);

  if (!notice) {
    notFound();
  }

  return (
    <>
      <PageHeader title={notice.title} />
      <MarketingContainer maxWidth="3xl" className="py-10">
        {notice.published_at && (
          <p className="text-sm text-muted">
            Published {new Date(notice.published_at).toLocaleDateString("en-GB", { dateStyle: "long" })}
          </p>
        )}
        <div className="mt-6 max-w-none text-stone-700 dark:text-stone-300">
          <p className="whitespace-pre-wrap">{notice.body}</p>
        </div>
        <SmartBackLink
          fallbackHref="/notices"
          className="mt-8 inline-block text-sm font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          ← All notices
        </SmartBackLink>
      </MarketingContainer>
    </>
  );
}
