import Link from "next/link";
import { PageForm } from "@/components/admin/PageForm";

export const metadata = {
  title: "New page",
};

export default function NewPagePage() {
  return (
    <div>
      <Link href="/admin/pages" className="text-sm text-accent hover:underline">
        ← Pages
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">New page</h1>
      <div className="mt-8">
        <PageForm />
      </div>
    </div>
  );
}
