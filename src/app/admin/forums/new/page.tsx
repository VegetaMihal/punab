import Link from "next/link";
import { ForumForm } from "@/components/admin/ForumForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "New forum",
};

export default function NewForumPage() {
  return (
    <div>
      <Link href="/admin/forums" className="text-sm text-accent hover:underline">
        ← Forums
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-stone-50">New forum</h1>
      <Card className="mt-8 max-w-xl">
        <ForumForm />
      </Card>
    </div>
  );
}
