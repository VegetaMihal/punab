import Image from "next/image";
import { EmptyState } from "@/components/ui/EmptyState";
import { InView } from "@/components/home/InView";
import { ensureSupabasePublicObjectUrl } from "@/lib/storage";
import type { LeadershipLayer, LeadershipMember } from "@/types/database";

const SHEET_TILT = ["-rotate-1", "rotate-1", "rotate-2", "-rotate-2"];

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
                <div>
                  <h2 className="text-h2 text-[color:var(--color-text)]">{layer.title}</h2>
                  {layer.description && (
                    <p className="text-body mt-2 max-w-3xl text-[color:var(--color-text-muted)]">{layer.description}</p>
                  )}
                </div>
              )}
              <ul
                className={
                  omitLayerHeaders
                    ? "grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
                    : "mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
                }
              >
                {group.map((m, i) => (
                  <li key={m.id}>
                    <InView variant="paste" delay={(i % 3) * 120}>
                      <div className={`wall-sheet wall-text group p-3 pb-6 ${SHEET_TILT[i % SHEET_TILT.length]}`}>
                        <div className="relative aspect-[4/5] overflow-hidden bg-[#cfc9ba]">
                          {m.photo_url ? (
                            <Image
                              src={ensureSupabasePublicObjectUrl(m.photo_url)}
                              alt={m.name}
                              fill
                              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
                              quality={80}
                              priority={omitLayerHeaders && i < 6}
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm font-semibold text-[#5a564a]">
                              No photo
                            </div>
                          )}
                        </div>
                        <p className="mt-4 text-xl font-extrabold leading-snug text-[#1b1a17]">{m.name}</p>
                        <p className="mt-1 inline-block border-b-[3px] border-[#c41e3a] pb-0.5 text-sm font-extrabold uppercase tracking-wide text-[#a5182f]">
                          {m.position}
                        </p>
                        {m.bio && <p className="mt-3 text-sm leading-relaxed text-[#3a382f]">{m.bio}</p>}
                      </div>
                    </InView>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
