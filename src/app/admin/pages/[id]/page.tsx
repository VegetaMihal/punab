import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageAdmin } from "@/actions/cms";
import { DeletePageButton } from "@/components/admin/DeletePageButton";
import { PageForm } from "@/components/admin/PageForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditPagePage({ params }: Props) {
  const { id } = await params;
  const page = await getPageAdmin(id);
  if (!page) {
    notFound();
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/admin/pages" className="text-sm text-accent hover:underline">
          ← Pages
        </Link>
        <DeletePageButton id={id} />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit page</h1>
      <div className="mt-8">
        <PageForm page={page} />
      </div>
    </div>
  );
}
