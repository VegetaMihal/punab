import Link from "next/link";
import { NoticeForm } from "@/components/admin/NoticeForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "New notice",
};

export default function NewNoticePage() {
  return (
    <div>
      <Link href="/admin/notices" className="text-sm text-accent hover:underline">
        ← All notices
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">New notice</h1>
      <Card className="mt-8 max-w-2xl">
        <NoticeForm />
      </Card>
    </div>
  );
}
