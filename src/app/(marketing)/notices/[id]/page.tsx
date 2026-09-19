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
        <article className="wall-sheet wall-text -rotate-1 p-6 pt-10 sm:p-10 sm:pt-12">
          {notice.published_at && (
            <p className="text-small font-extrabold uppercase tracking-[0.14em] text-[#a5182f]">
              Published {new Date(notice.published_at).toLocaleDateString("en-GB", { dateStyle: "long" })}
            </p>
          )}
          <p className="mt-5 whitespace-pre-wrap text-[1.0625rem] leading-relaxed text-[#1b1a17]">{notice.body}</p>
        </article>
        <SmartBackLink
          fallbackHref="/notices"
          className="wall-link mt-10 inline-block"
        >
          ← All notices
        </SmartBackLink>
      </MarketingContainer>
    </>
  );
}
