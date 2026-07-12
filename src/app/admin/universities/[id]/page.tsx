import Link from "next/link";
import { notFound } from "next/navigation";
import { UniversityForm } from "@/components/admin/UniversityForm";
import { Card } from "@/components/ui/Card";
import { getUniversityAdmin } from "@/lib/repositories/chapters-repository";

type Props = { params: Promise<{ id: string }> };

export default async function EditUniversityPage({ params }: Props) {
  const { id } = await params;
  const university = await getUniversityAdmin(id);

  if (!university) {
    notFound();
  }

  return (
    <div>
      <Link href="/admin/universities" className="text-sm text-accent hover:underline">
        ← Universities
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">Edit university</h1>
      <Card className="mt-8 max-w-xl">
        <UniversityForm university={university} />
      </Card>
    </div>
  );
}
