import Link from "next/link";
import { UniversityForm } from "@/components/admin/UniversityForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "New university",
};

export default function NewUniversityPage() {
  return (
    <div>
      <Link href="/admin/universities" className="text-sm text-accent hover:underline">
        ← Universities
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">New university</h1>
      <Card className="mt-8 max-w-xl">
        <UniversityForm />
      </Card>
    </div>
  );
}
