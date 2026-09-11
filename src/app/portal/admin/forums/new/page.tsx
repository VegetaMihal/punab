import { listHierarchySchemes } from "@/lib/repositories/org-forums-repository";
import { CreateForumForm } from "@/components/org/CreateForumForm";

export const metadata = { title: "New Forum — Org Portal" };

export default async function NewForumPage() {
  const schemes = await listHierarchySchemes();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-xl font-semibold text-stone-900 dark:text-stone-100">New Forum</h1>
      <CreateForumForm schemes={schemes.map((s) => ({ id: s.id, name: s.name }))} />
    </div>
  );
}
