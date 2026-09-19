export const revalidate = 60;

import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/home/CountUp";
import { Hero } from "@/components/home/Hero";
import { InView } from "@/components/home/InView";
import { WaveRibbon } from "@/components/home/WaveRibbon";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { getFeaturedHomeAlbums, getPublicSettings } from "@/lib/data/site-content";
import { getHomeStats } from "@/lib/data/public";
import { prisma } from "@/lib/db/prisma";
import { getSetting } from "@/lib/site-defaults";

const G = "#0f3b2e";
const SHEET_TILT = ["-rotate-2", "rotate-1", "rotate-2", "-rotate-1"];

export default async function HomePage() {
  const [settings, stats, successfulEvents, featuredAlbums] = await Promise.all([
    getPublicSettings(),
    getHomeStats().catch(() => ({ chapters: 0, events: 0, notices: 0 })),
    prisma.galleryAlbum.count().catch(() => 0),
    getFeaturedHomeAlbums(),
  ]);

  const featuredGalleryBlocks = featuredAlbums.filter((b) => b.images.length > 0);

  const heroImages = [getSetting(settings, "hero.image_url"), getSetting(settings, "hero.image_url_2")]
    .map((u) => u.trim())
    .filter(Boolean);

  return (
    <>
      <Hero
        content={{
          title: getSetting(settings, "hero.title"),
          subtitle: getSetting(settings, "hero.subtitle"),
          ctaPrimary: getSetting(settings, "hero.cta_primary"),
          images: heroImages,
        }}
      />

      <InView variant="ribbon" className="bg-[#0f3b2e]">
        <WaveRibbon from={G} to={G} />
      </InView>
      <div className="wall">
        <MarketingContainer className="grid items-center gap-14 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <InView variant="rise">
            <h2 className="wall-brush max-w-3xl text-balance text-4xl leading-[1.25] text-[color:var(--wall-chalk)] sm:text-5xl">
              {getSetting(settings, "home.who_title")}
            </h2>
            <div className="wall-text mt-6 grid max-w-[62ch] gap-4 text-lg leading-relaxed text-[color:var(--wall-chalk-dim)]">
              <p>{getSetting(settings, "home.who_body")}</p>
              <p>{getSetting(settings, "home.who_body_2")}</p>
            </div>
          </InView>
          <InView variant="paste" delay={150} className="mx-auto w-full max-w-md">
          <dl className="wall-sheet wall-text w-full rotate-1 px-7 pb-6 pt-9 sm:px-9">
            {[
              { value: stats.chapters, label: "chapters" },
              { value: stats.events, label: "events on the calendar" },
              { value: successfulEvents, label: "albums in the archive" },
            ].map((row, i) => (
              <div
                key={row.label}
                className={`flex items-baseline gap-5 py-4 ${i > 0 ? "border-t-2 border-dashed border-[#1b1a17]/25" : ""}`}
              >
                <dd className="wall-brush order-1 w-[4.75rem] shrink-0 text-6xl leading-none text-[color:var(--wall-crimson)] sm:w-[6rem] sm:text-7xl">
                  <CountUp value={row.value} />
                </dd>
                <dt className="order-2 text-lg font-extrabold leading-snug text-[#1b1a17] sm:text-xl">{row.label}</dt>
              </div>
            ))}
          </dl>
          </InView>
        </MarketingContainer>
      </div>

      {featuredGalleryBlocks.length > 0 && (
        <InView variant="ribbon" className="bg-[#0f3b2e]">
          <WaveRibbon from={G} to={G} />
        </InView>
      )}
      {featuredGalleryBlocks.map(({ album, images }) => (
        <div key={album.id} className="wall">
          <MarketingContainer className="py-16 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="wall-brush text-3xl leading-[1.25] text-[color:var(--wall-chalk)] sm:text-4xl">{album.title}</h2>
              <Link href={`/archive/${album.slug}`} className="wall-link">
                Open archive
              </Link>
            </div>
            <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
              {images.slice(0, 4).map((img, index) => (
                <li key={img.id}>
                  <InView variant="paste" delay={index * 130}>
                  <Link
                    href={`/archive/${album.slug}`}
                    className={`wall-sheet block p-2 ${SHEET_TILT[index % SHEET_TILT.length]}`}
                  >
                    <span className="relative block aspect-[4/5] overflow-hidden bg-[color:var(--color-surface-3)]">
                      <Image
                        src={img.public_url}
                        alt={img.alt_text || img.caption || album.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1023px) 45vw, 22vw"
                      />
                    </span>
                  </Link>
                  </InView>
                </li>
              ))}
            </ul>
          </MarketingContainer>
        </div>
      ))}

      <InView variant="ribbon" className="bg-[#0f3b2e]">
        <WaveRibbon from={G} to={G} />
      </InView>
      <div className="wall">
        <MarketingContainer className="grid gap-16 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
          <InView variant="rise">
          <article>
            <h2 className="wall-brush text-4xl leading-[1.25] text-[color:var(--wall-chalk)] sm:text-5xl">
              {getSetting(settings, "home.mission_title")}
            </h2>
            <p className="wall-text mt-4 max-w-[52ch] text-lg leading-relaxed text-[color:var(--wall-chalk-dim)]">
              {getSetting(settings, "home.mission_body")}
            </p>
          </article>
          </InView>
          <InView variant="rise" delay={150} className="lg:mt-24">
          <article>
            <h2 className="wall-brush text-4xl leading-[1.25] text-[color:var(--wall-chalk)] sm:text-5xl">
              {getSetting(settings, "home.vision_title")}
            </h2>
            <InView variant="grow" delay={500} className="mt-2 h-1.5 w-32 bg-[color:var(--wall-paint)]">
              {null}
            </InView>
            <p className="wall-text mt-4 max-w-[52ch] text-lg leading-relaxed text-[color:var(--wall-chalk-dim)]">
              {getSetting(settings, "home.vision_body")}
            </p>
          </article>
          </InView>
        </MarketingContainer>
      </div>

      <InView variant="ribbon" className="bg-[#0f3b2e]">
        <WaveRibbon from={G} to={G} />
      </InView>
      <div className="wall">
        <MarketingContainer className="grid items-start gap-14 py-16 lg:grid-cols-2 lg:py-24">
          <InView variant="rise">
            <h2 className="wall-brush text-3xl leading-[1.25] text-[color:var(--wall-chalk)] sm:text-4xl">
              {getSetting(settings, "home.coord_title")}
            </h2>
            <p className="wall-text mt-4 max-w-[52ch] text-lg leading-relaxed text-[color:var(--wall-chalk-dim)]">
              {getSetting(settings, "home.coord_body")}
            </p>
          </InView>
          <InView variant="paste" delay={150}>
          <div className="wall-sheet wall-text rotate-1 p-6 pt-8 sm:p-8 sm:pt-10">
            <p className="text-sm font-bold uppercase tracking-wide text-[color:var(--wall-crimson)]">
              {getSetting(settings, "home.featured_label")}
            </p>
            <p className="mt-2 text-2xl font-extrabold leading-snug">{getSetting(settings, "home.featured_title")}</p>
            <p className="mt-3 leading-relaxed text-[#3a382f]">{getSetting(settings, "home.featured_body")}</p>
            <ul className="mt-6 space-y-2 border-t border-[#1b1a17]/25 pt-5 font-semibold">
              <li>– {getSetting(settings, "home.coord_bullet_1")}</li>
              <li>– {getSetting(settings, "home.coord_bullet_2")}</li>
              <li>– {getSetting(settings, "home.coord_bullet_3")}</li>
            </ul>
          </div>
          </InView>
        </MarketingContainer>
      </div>

      <div className="bg-[#0f3b2e]" aria-hidden>
        <svg className="block h-16 w-full sm:h-24" viewBox="0 0 1440 200" preserveAspectRatio="none">
          <path d="M0,114 C 240,34 480,154 720,114 C 960,74 1200,194 1440,114 L1440,200 L0,200 Z" fill="#c41e3a" />
        </svg>
      </div>
      <section className="wall home-cta !bg-[color:var(--wall-crimson)] !bg-none">
        <MarketingContainer className="py-16 lg:py-24">
          <div className="w-fit max-w-full">
          <InView variant="wipe">
          <h2 className="wall-brush max-w-4xl text-balance text-4xl leading-[1.25] text-[color:var(--wall-chalk)] sm:text-6xl">
            {getSetting(settings, "home.cta_title")}
          </h2>
          </InView>
          <InView variant="ribbon" delay={400} className="mt-3">
            <svg viewBox="0 0 600 24" preserveAspectRatio="none" className="block h-4 w-full overflow-visible" aria-hidden>
              <path
                className="wave-line"
                d="M3,12 C 110,1 200,23 300,12 S 490,1 597,12"
                pathLength={1}
                fill="none"
                stroke="#2fb26f"
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={1}
              />
            </svg>
          </InView>
          </div>
          <p className="wall-text mt-5 max-w-[56ch] text-lg leading-relaxed text-[color:var(--wall-chalk)]">
            {getSetting(settings, "home.cta_body")}
          </p>
          <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <Link href="/register" className="wall-btn wall-btn--chalk w-full sm:w-auto">
              Become a Member
            </Link>
            <Link href="/contact" className="wall-link">
              Contact us
            </Link>
          </div>
        </MarketingContainer>
      </section>
    </>
  );
}
