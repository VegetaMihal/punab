import Image from "next/image";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { ensureSupabasePublicObjectUrl } from "@/lib/storage";
import type { LeadershipLayer, LeadershipMember } from "@/types/database";

export type LeadershipSectionGroup = {
  layer: LeadershipLayer;
  members: LeadershipMember[];
};

type Props = {
  sectionData: LeadershipSectionGroup[];
  loadError: string | null;
  errorTitle: string;
  emptyTitle: string;
  emptyDescription: string;
  /** When true, skip per-layer title/description (e.g. honorary page already uses PageHeader). */
  omitLayerHeaders?: boolean;
};

export function LeadershipSections({
  sectionData,
  loadError,
  errorTitle,
  emptyTitle,
  emptyDescription,
  omitLayerHeaders = false,
}: Props) {
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
          {sectionData.map(({ layer, members: group }) => (
            <section key={layer.id}>
              {!omitLayerHeaders && (
                <div className="border-b border-[color:var(--color-border)] pb-4">
                  <h2 className="text-h2 text-[color:var(--color-text)]">{layer.title}</h2>
                  {layer.description && (
                    <p className="text-body mt-2 max-w-3xl text-[color:var(--color-text-muted)]">{layer.description}</p>
                  )}
                </div>
              )}
              <ul
                className={
                  omitLayerHeaders
                    ? "grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                    : "mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {group.map((m, i) => {
                  const cardClass =
                    "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] pt-1 shadow-[var(--shadow-sm)] motion-safe:transition-[transform,box-shadow] motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[var(--shadow-md)]";
                  const card = (
                    <li key={m.id} className={cardClass}>
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
                            sizes="(max-width: 640px) 128px, 144px"
                            quality={75}
                            priority={omitLayerHeaders && i < 6}
                            className="object-cover motion-safe:transition-transform motion-safe:duration-[var(--transition-base)] group-hover:scale-110"
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
                  );
                  return omitLayerHeaders ? (
                    card
                  ) : (
                    <Reveal key={m.id} staggerIndex={i % 5}>
                      {card}
                    </Reveal>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
