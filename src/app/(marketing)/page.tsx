export const revalidate = 60;

import Image from "next/image";
import { CtaBand } from "@/components/home/CtaBand";
import { FeaturedGallery } from "@/components/home/FeaturedGallery";
import { Hero } from "@/components/home/Hero";
import { StatsSection } from "@/components/home/StatsSection";
import { PUNAB_LOGO_SRC } from "@/components/layout/logo";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { WaveDivider } from "@/components/ui/WaveDivider";
import { getFeaturedHomeAlbums, getPublicSettings } from "@/lib/data/site-content";
import { getHomeStats } from "@/lib/data/public";
import { prisma } from "@/lib/db/prisma";
import { getSetting } from "@/lib/site-defaults";

export default async function HomePage() {
  const [settings, stats, successfulEvents, featuredAlbums] = await Promise.all([
    getPublicSettings(),
    getHomeStats().catch(() => ({ chapters: 0, events: 0, notices: 0 })),
    prisma.galleryAlbum.count().catch(() => 0),
    getFeaturedHomeAlbums(),
  ]);

  const featuredGalleryBlocks = featuredAlbums.filter((b) => b.images.length > 0);

  const heroImage = getSetting(settings, "hero.image_url").trim();

  return (
    <>
      <Hero
        content={{
          title: getSetting(settings, "hero.title"),
          subtitle: getSetting(settings, "hero.subtitle"),
          ctaPrimary: getSetting(settings, "hero.cta_primary"),
          imageUrl: heroImage || undefined,
        }}
      />

      <Section surface="white" divider paddingY="section">
        <MarketingContainer className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <Reveal variant="left">
            <p className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">Who we are</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight text-[color:var(--color-text)] md:text-5xl">
              {getSetting(settings, "home.who_title")}
            </h2>
            <div className="mt-6 grid gap-4 text-body text-[color:var(--color-text-muted)]">
              <p>{getSetting(settings, "home.who_body")}</p>
              <p>{getSetting(settings, "home.who_body_2")}</p>
            </div>
          </Reveal>
          <Reveal staggerIndex={1} variant="right">
            <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[color:color-mix(in_srgb,var(--color-brand)_20%,var(--color-border))] bg-[color:var(--color-surface)] p-4 shadow-[var(--shadow-lg)] sm:p-5">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,color-mix(in_srgb,var(--brand-green)_22%,transparent),transparent_32%),radial-gradient(circle_at_88%_86%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_34%)]" aria-hidden />
              <div className="relative grid gap-4 sm:grid-cols-[0.9fr_1fr]">
                <div className="flex min-h-[300px] flex-col justify-between rounded-[calc(var(--radius-lg)-0.25rem)] bg-[color:color-mix(in_srgb,var(--color-brand)_92%,black)] p-6 text-[color:var(--color-surface)]">
                  <div className="grid h-32 w-32 place-items-center rounded-2xl bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
                    <Image src={PUNAB_LOGO_SRC} alt="" width={120} height={120} className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-small font-bold uppercase tracking-[0.18em] text-[color:color-mix(in_srgb,var(--brand-green)_62%,white)]">National network</p>
                    <p className="mt-3 text-3xl font-black leading-none tracking-tight">Private University Network</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {["Chapters across campuses", "Events with real reach", "A lifelong member network"].map((item, index) => (
                    <div key={item} className="border-l-4 border-[color:var(--color-brand)] bg-[color:color-mix(in_srgb,var(--color-surface-2)_82%,white)] p-5 shadow-[var(--shadow-sm)]">
                      <p className="text-small font-bold uppercase tracking-[0.16em] text-[color:var(--color-brand)]">0{index + 1}</p>
                      <p className="mt-2 text-xl font-bold leading-snug text-[color:var(--color-text)]">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </MarketingContainer>
      </Section>
      <WaveDivider from="white" to="muted" />

      <Section surface="muted" divider paddingY="section">
        <MarketingContainer className="grid gap-12 lg:grid-cols-2">
          <Reveal variant="scale">
            <article className="h-full border-t-4 border-[color:var(--color-brand)] bg-[color:var(--color-surface)] p-7 shadow-[var(--shadow-sm)]">
              <span className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--color-brand)]">
                Mission
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight text-[color:var(--color-text)]">{getSetting(settings, "home.mission_title")}</h2>
              <p className="text-body mt-4 text-[color:var(--color-text-muted)]">{getSetting(settings, "home.mission_body")}</p>
            </article>
          </Reveal>
          <Reveal staggerIndex={1} variant="scale">
            <article className="h-full border-t-4 border-[color:var(--brand-green)] bg-[color:var(--color-surface)] p-7 shadow-[var(--shadow-sm)]">
              <span className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">
                Vision
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight text-[color:var(--color-text)]">{getSetting(settings, "home.vision_title")}</h2>
              <p className="text-body mt-4 text-[color:var(--color-text-muted)]">{getSetting(settings, "home.vision_body")}</p>
            </article>
          </Reveal>
        </MarketingContainer>
      </Section>
      <WaveDivider from="muted" to="white" />

      <StatsSection
        chapters={stats.chapters}
        events={stats.events}
        successfulEvents={successfulEvents}
      />
      <WaveDivider from="white" to={featuredGalleryBlocks.length > 0 ? "muted" : "transparent"} />

      {featuredGalleryBlocks.length > 0 && (
        <div className="flex flex-col bg-[color:var(--color-surface-2)]">
          {featuredGalleryBlocks.map(({ album, images }, index) => (
            <FeaturedGallery
              key={album.id}
              album={album}
              images={images}
              sectionSpacing={index > 0 ? "tight" : "normal"}
            />
          ))}
        </div>
      )}
      <div className="bg-[color:var(--color-bg)]">
        {featuredGalleryBlocks.length > 0 && <WaveDivider from="muted" to="transparent" />}

        <Section surface="transparent" divider={false} paddingY="none" className="py-16 md:py-20">
          <MarketingContainer>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
              <Reveal variant="left">
                <p className="text-small font-bold uppercase tracking-[0.18em] text-[color:var(--brand-green)]">Network engine</p>
                <h2 className="mt-3 text-h2 text-[color:var(--color-text)]">{getSetting(settings, "home.coord_title")}</h2>
                <p className="text-body mt-4 text-[color:var(--color-text-muted)]">{getSetting(settings, "home.coord_body")}</p>
                <ul className="mt-6 space-y-3 text-small leading-relaxed text-[color:var(--color-text-2)]">
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--color-brand)]" aria-hidden />
                    {getSetting(settings, "home.coord_bullet_1")}
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--brand-green)]" aria-hidden />
                    {getSetting(settings, "home.coord_bullet_2")}
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--accent)]" aria-hidden />
                    {getSetting(settings, "home.coord_bullet_3")}
                  </li>
                </ul>
              </Reveal>
              <Reveal staggerIndex={1} variant="right">
                <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[var(--shadow-sm)] motion-safe:transition-[box-shadow,transform] motion-safe:duration-[var(--transition-base)] motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[var(--shadow-md)]">
                  <p className="text-small font-semibold text-[color:var(--color-brand)]">{getSetting(settings, "home.featured_label")}</p>
                  <p className="text-h3 mt-2 leading-snug text-[color:var(--color-text)]">{getSetting(settings, "home.featured_title")}</p>
                  <p className="text-small mt-3 leading-relaxed text-[color:var(--color-text-muted)]">
                    {getSetting(settings, "home.featured_body")}
                  </p>
                </div>
              </Reveal>
            </div>
          </MarketingContainer>
        </Section>
        <WaveDivider from="transparent" to="brand" />
      </div>

      <CtaBand
        content={{
          title: getSetting(settings, "home.cta_title"),
          body: getSetting(settings, "home.cta_body"),
        }}
      />
    </>
  );
}
