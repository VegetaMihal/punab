"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { saveSiteSettingsForm, uploadSiteAsset, type CmsResult } from "@/actions/cms";
import { SITE_DEFAULTS } from "@/lib/site-defaults";
import { Card } from "@/components/ui/Card";

const FIELD_LABELS: Partial<Record<keyof typeof SITE_DEFAULTS, string>> = {
  "hero.title": "Homepage hero title",
  "hero.subtitle": "Homepage hero subtitle",
  "hero.cta_primary": "Homepage primary CTA text",
  "about.intro": "About intro",
  "about.mission": "About mission text",
  "about.vision": "About vision text",
  "footer.address": "Footer address",
  "footer.email": "Footer email",
  "contact.intro": "Contact page intro",
  "join.intro": "Join page intro",
};

const GROUPS: { title: string; keys: (keyof typeof SITE_DEFAULTS)[] }[] = [
  {
    title: "Quick edit (daily content)",
    keys: [
      "hero.title",
      "hero.subtitle",
      "hero.cta_primary",
      "about.intro",
      "about.mission",
      "about.vision",
      "footer.address",
      "footer.email",
      "contact.intro",
      "join.intro",
    ],
  },
  {
    title: "Hero",
    keys: ["hero.title", "hero.subtitle", "hero.cta_primary", "hero.image_url"],
  },
  {
    title: "Home — sections",
    keys: [
      "home.who_title",
      "home.who_body",
      "home.who_body_2",
      "home.mission_title",
      "home.mission_body",
      "home.vision_title",
      "home.vision_body",
      "home.coord_title",
      "home.coord_body",
      "home.coord_bullet_1",
      "home.coord_bullet_2",
      "home.coord_bullet_3",
      "home.featured_label",
      "home.featured_title",
      "home.featured_body",
      "home.cta_title",
      "home.cta_body",
    ],
  },
  { title: "Footer", keys: ["footer.blurb", "footer.address", "footer.email"] },
  { title: "Contact", keys: ["contact.intro", "contact.welcome", "contact.form_note"] },
  { title: "Join", keys: ["join.intro", "join.body"] },
  {
    title: "About page",
    keys: ["about.intro", "about.vision", "about.values", "about.mission", "about.media"],
  },
];

const initial: CmsResult = {};

export function SiteContentForm({ initialValues }: { initialValues: Record<string, string> }) {
  const [state, formAction, pending] = useActionState(saveSiteSettingsForm, initial);

  useEffect(() => {
    if (state?.success) {
      toast.success("Site content saved");
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  async function onHeroUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadSiteAsset(fd);
    if (res.error) {
      toast.error(res.error);
      return;
    }
    if (res.url) {
      const input = document.querySelector<HTMLInputElement>('input[name="s__hero.image_url"]');
      if (input) {
        input.value = res.url;
      }
      toast.success("Hero image uploaded — save to apply");
    }
  }

  return (
    <form action={formAction} className="space-y-10">
      {state?.error && !state.success && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {GROUPS.map((g) => (
        <Card key={g.title} className="p-6">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{g.title}</h2>
          <div className="mt-4 space-y-4">
            {g.keys.map((key) => {
              const val = initialValues[key] ?? SITE_DEFAULTS[key] ?? "";
              const multiline =
                key.includes("body") ||
                key.includes("intro") ||
                key.includes("blurb") ||
                key.includes("vision") ||
                key.includes("values") ||
                key.includes("mission") ||
                key.includes("media") ||
                key.includes("welcome") ||
                key.includes("coord_body") ||
                key.includes("featured_body") ||
                key === "hero.subtitle";
              return (
                <div key={key}>
                  <label className="block text-xs font-medium uppercase tracking-wide text-muted">
                    {FIELD_LABELS[key] ?? key}
                  </label>
                  {key === "hero.image_url" ? (
                    <div className="mt-1 space-y-2">
                      <input
                        type="url"
                        name={`s__${key}`}
                        defaultValue={val}
                        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
                        placeholder="https://…"
                      />
                      <div>
                        <label className="text-xs text-muted">Upload to site assets</label>
                        <input type="file" accept="image/*" onChange={onHeroUpload} className="mt-1 text-sm" />
                      </div>
                    </div>
                  ) : multiline ? (
                    <textarea
                      name={`s__${key}`}
                      defaultValue={val}
                      rows={key === "about.values" ? 8 : 4}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
                    />
                  ) : (
                    <input
                      type="text"
                      name={`s__${key}`}
                      defaultValue={val}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-600 dark:bg-stone-900"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-red px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save all site content"}
      </button>
    </form>
  );
}
