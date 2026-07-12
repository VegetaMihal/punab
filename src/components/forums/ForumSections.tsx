import Image from "next/image";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { ensureSupabasePublicObjectUrl } from "@/lib/storage";
import type { ForumLabel, ForumMember } from "@/types/database";

export type ForumSectionGroup = {
  label: ForumLabel;
  members: ForumMember[];
};

type Props = {
  sectionData: ForumSectionGroup[];
  loadError: string | null;
  errorTitle: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function ForumSections({ sectionData, loadError, errorTitle, emptyTitle, emptyDescription }: Props) {
  return (
    <>
      {loadError && (
        <div className="mt-2">
          <EmptyState title={errorTitle} description={loadError} />
        </div>
      )}
      {!loadError && sectionData.length === 0 && (
        <div className="mt-2">
          <EmptyState title={emptyTitle} description={emptyDescription} />
        </div>
      )}
      {!loadError && sectionData.length > 0 && (
        <div className="mt-2 space-y-14">
          {sectionData.map(({ label, members: group }) => (
            <section key={label.id}>
              <div className="border-b border-[color:var(--color-border)] pb-4">
                <h2 className="text-h2 text-[color:var(--color-text)]">{label.title}</h2>
                {label.description && (
                  <p className="text-body mt-2 max-w-3xl text-[color:var(--color-text-muted)]">{label.description}</p>
                )}
              </div>
              <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {group.map((m, i) => (
                  <Reveal key={m.id} staggerIndex={i % 5}>
                    <li className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] pt-1 shadow-[var(--shadow-sm)] motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[var(--shadow-md)]">
                      <span
                        aria-hidden
                        className={`absolute inset-x-0 top-0 h-1.5 ${i % 2 === 0 ? "bg-[linear-gradient(90deg,var(--color-brand)_0%,var(--brand-green)_100%)]" : "bg-[linear-gradient(90deg,var(--brand-green)_0%,var(--color-brand)_100%)]"}`}
                      />
                      <div className="relative mx-auto mt-7 h-32 w-32 shrink-0 overflow-hidden rounded-full ring-4 ring-[color:color-mix(in_srgb,var(--brand-green-muted)_55%,var(--color-surface))] sm:h-36 sm:w-36">
                        {m.photo_url ? (
                          <Image
                            src={ensureSupabasePublicObjectUrl(m.photo_url)}
                            alt={m.name}
                            fill
                            className="object-cover motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] group-hover:scale-110"
                            sizes="(max-width: 640px) 128px, 144px"
                            quality={100}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[color:var(--color-surface-3)] text-small text-[color:var(--color-text-muted)]">
                            No photo
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col items-center p-5 text-center">
                        <p className="font-semibold text-[color:var(--color-text)]">{m.name}</p>
                        <p className="mt-2 inline-flex rounded-[var(--radius-full)] bg-[color:color-mix(in_srgb,var(--brand-green-muted)_55%,var(--color-surface))] px-3 py-1 text-small font-semibold text-[color:var(--brand-green)]">
                          {m.position}
                        </p>
                        {m.bio && <p className="text-small mt-3 text-left text-[color:var(--color-text-muted)]">{m.bio}</p>}
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
