"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createForumAction, type OrgActionState } from "@/actions/org";
import { Button } from "@/components/ui/Button";

const initial: OrgActionState = {};

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CreateForumForm({ schemes }: { schemes: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(createForumAction, initial);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) router.push("/portal/admin/forums");
  }, [state?.success, router]);

  return (
    <form
      action={formAction}
      className="space-y-5"
      onSubmit={(e) => {
        const form = e.currentTarget;
        const nameInput = form.elements.namedItem("name") as HTMLInputElement;
        const slugInput = form.elements.namedItem("slug") as HTMLInputElement;
        if (!slugInput.value) slugInput.value = slugify(nameInput.value);
      }}
    >
      {state?.error && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300" role="alert">
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="ds-label">Forum name</label>
        <input id="name" name="name" type="text" required minLength={2} className="ds-input" placeholder="e.g. Debate Forum" />
      </div>
      <div>
        <label htmlFor="forumType" className="ds-label">What kind of Forum?</label>
        <select id="forumType" name="forumType" defaultValue="standard" className="ds-select">
          <option value="standard">Standard — follows the usual leadership levels</option>
          <option value="external">Follows its own structure (e.g. IMUN)</option>
        </select>
      </div>
      <div>
        <label htmlFor="hierarchySchemeId" className="ds-label">Which leadership levels does it use?</label>
        <select id="hierarchySchemeId" name="hierarchySchemeId" required defaultValue="" className="ds-select">
          <option value="" disabled>Select one</option>
          {schemes.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {schemes.length === 0 && (
          <p className="ds-helper text-amber-700 dark:text-amber-400">
            None set up yet — go back and click &quot;Set up standard levels&quot; first.
          </p>
        )}
      </div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted">Advanced (optional)</summary>
        <div className="mt-2">
          <label htmlFor="slug" className="ds-label">Web link</label>
          <input id="slug" name="slug" type="text" pattern="[a-z0-9-]+" className="ds-input" placeholder="Filled in automatically if left blank" />
        </div>
      </details>
      <Button type="submit" variant="primary" className="w-full" loading={pending} disabled={schemes.length === 0}>
        {pending ? "Creating…" : "Create Forum"}
      </Button>
    </form>
  );
}
