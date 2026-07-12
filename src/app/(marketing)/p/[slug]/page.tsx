import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { getPublishedPageBySlug } from "@/lib/data/site-content";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) {
    return { title: "Page" };
  }
  return {
    title: page.title,
    description: page.meta_description ?? undefined,
  };
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) {
    notFound();
  }

  return (
    <>
      <PageHeader title={page.title} description={page.meta_description ?? undefined} />
      <MarketingContainer maxWidth="3xl" className="py-12">
        <div className="prose prose-stone max-w-none whitespace-pre-wrap dark:prose-invert">{page.body}</div>
      </MarketingContainer>
    </>
  );
}
