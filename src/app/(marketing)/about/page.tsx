export const revalidate = 120;

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { getPublishedAlbums, getPublicSettings } from "@/lib/data/site-content";
import { getSetting } from "@/lib/site-defaults";

export const metadata = {
  title: "About",
};

function formatAlbumPeriod(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export default async function AboutPage() {
  const [settings, archiveAlbums] = await Promise.all([getPublicSettings(), getPublishedAlbums()]);
  const valuesRaw = getSetting(settings, "about.values");
  const valueLines = valuesRaw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <>
      <PageHeader
        title="About PUNAB"
        description="Private University National Association of Bangladesh — national representation for private university communities."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        tone="pattern"
      />
      <MarketingContainer maxWidth="3xl" className="space-y-12 py-12 md:py-16">
        <Reveal>
          <p className="text-body text-[color:var(--color-text-2)]">{getSetting(settings, "about.intro")}</p>
        </Reveal>

        <section aria-labelledby="about-milestones">
          <Reveal>
            <h2 id="about-milestones" className="text-h2 text-[color:var(--color-text)]">
              Milestones
            </h2>
            <p className="text-small mt-2 text-[color:var(--color-text-muted)]">
              Each entry is a published archive album—titles and dates come from the archive.
            </p>
          </Reveal>
          {archiveAlbums.length === 0 ? (
            <Reveal staggerIndex={1}>
              <EmptyState
                className="mt-10"
                title="No archive albums yet"
                description="When albums are published in the archive, they appear here as milestones."
                action={
                  <Link
                    href="/archive"
                    className="text-sm font-semibold text-[color:var(--color-brand)] underline-offset-4 hover:underline"
                  >
                    Browse archive
                  </Link>
                }
              />
            </Reveal>
          ) : (
            <div className="relative mt-10 pl-8 md:pl-0">
              <div
                className="absolute left-[11px] top-2 bottom-2 w-px bg-[color:var(--color-border-strong)] md:left-1/2 md:-translate-x-1/2"
                aria-hidden
              />
              <ol className="space-y-10">
                {archiveAlbums.map((album, index) => (
                  <Reveal key={album.id} staggerIndex={index % 3}>
                    <li
                      className={`relative grid gap-4 md:grid-cols-2 md:gap-8 ${index % 2 === 1 ? "md:text-right" : ""}`}
                    >
                      <div className={index % 2 === 1 ? "md:order-2 md:pr-10" : "md:pl-10"}>
                        <span className="absolute left-0 flex h-6 w-6 items-center justify-center rounded-[var(--radius-full)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-xs font-bold text-[color:var(--color-brand)] md:left-1/2 md:-translate-x-1/2">
                          {index + 1}
                        </span>
                        <p className="text-small font-semibold uppercase tracking-wide text-[color:var(--color-brand)]">
                          Archive · {formatAlbumPeriod(album.created_at)}
                        </p>
                        <h3 className="text-h3 mt-1 text-[color:var(--color-text)]">
                          <Link
                            href={`/archive/${album.slug}?returnTo=${encodeURIComponent("/about")}`}
                            className="hover:text-[color:var(--color-brand)] motion-safe:transition-colors"
                          >
                            {album.title}
                          </Link>
                        </h3>
                        {album.description ? (
                          <p className="text-body mt-2 text-[color:var(--color-text-muted)]">{album.description}</p>
                        ) : null}
                        <p className="mt-3">
                          <Link
                            href={`/archive/${album.slug}?returnTo=${encodeURIComponent("/about")}`}
                            className="text-small font-semibold text-[color:var(--color-brand)] underline-offset-4 hover:underline"
                          >
                            View album
                          </Link>
                        </p>
                      </div>
                      <div className={`hidden md:block ${index % 2 === 1 ? "md:order-1" : ""}`} />
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          )}
        </section>

        <section aria-labelledby="about-values">
          <Reveal>
            <h2 id="about-values" className="text-h2 text-[color:var(--color-text)]">
              Our values
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {valueLines.map((line, i) => (
              <Reveal key={line} staggerIndex={i % 4}>
                <Card variant="default" className="h-full p-5">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[color:var(--color-brand-light)] text-sm font-bold text-[color:var(--color-brand)]">
                    {i + 1}
                  </div>
                  <p className="text-body font-medium text-[color:var(--color-text)]">{line}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <Reveal>
          <div>
            <h2 className="text-h2 text-[color:var(--color-text)]">Our vision</h2>
            <p className="text-body mt-4 text-[color:var(--color-text-muted)]">{getSetting(settings, "about.vision")}</p>
          </div>
        </Reveal>

        <Reveal>
          <div>
            <h2 className="text-h2 text-[color:var(--color-text)]">Our mission</h2>
            <p className="text-body mt-4 text-[color:var(--color-text-muted)]">{getSetting(settings, "about.mission")}</p>
          </div>
        </Reveal>

        <Reveal>
          <Card variant="elevated" className="bg-[color:var(--color-surface-2)] p-6">
            <h2 className="text-h3 text-[color:var(--color-text)]">Media recognition</h2>
            <p className="text-body mt-3 text-[color:var(--color-text-muted)]">{getSetting(settings, "about.media")}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-[color:var(--color-border)] pt-6 opacity-80">
              {["Daily Star", "Prothom Alo", "UNB"].map((name) => (
                <span
                  key={name}
                  className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-text-muted)]"
                >
                  {name}
                </span>
              ))}
            </div>
          </Card>
        </Reveal>
      </MarketingContainer>
    </>
  );
}
