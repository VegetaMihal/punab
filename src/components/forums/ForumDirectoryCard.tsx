import Image from "next/image";
import Link from "next/link";
import { InView } from "@/components/home/InView";
import type { Forum } from "@/types/database";

type Props = { forum: Forum; index?: number };

const TILT = ["-rotate-1", "rotate-1", "rotate-2", "-rotate-2"];

export function ForumDirectoryCard({ forum, index = 0 }: Props) {
  const initial = forum.title.trim().charAt(0).toUpperCase() || "F";
  const fallback = "View members, moderators, and roles for this forum.";

  return (
    <InView variant="paste" delay={(index % 3) * 120} className="h-full">
      <Link
        href={`/forums/${forum.slug}`}
        className={`wall-sheet wall-text group flex h-full min-h-[15rem] flex-col p-6 pt-8 outline-none ${TILT[index % TILT.length]}`}
      >
        <div className="flex items-start gap-4">
          <span
            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-[#d8d2c3] text-2xl font-extrabold text-[#a5182f]"
            aria-hidden
          >
            {forum.logo_url ? (
              <Image
                src={forum.logo_url}
                alt=""
                width={64}
                height={64}
                className="h-full w-full object-contain p-1"
              />
            ) : (
              initial
            )}
          </span>
          <h2 className="min-w-0 text-2xl leading-tight text-[#1b1a17]">{forum.title}</h2>
        </div>

        <p className="mt-4 line-clamp-4 flex-1 text-sm leading-relaxed text-[#3a382f]">
          {forum.description?.trim() || fallback}
        </p>

        <span className="mt-5 inline-flex w-fit items-center gap-2 border-b-[3px] border-[#c41e3a] pb-0.5 text-sm font-extrabold uppercase tracking-wide text-[#a5182f] motion-safe:transition-[gap] motion-safe:duration-[var(--transition-base)] group-hover:gap-3">
          Enter forum
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </Link>
    </InView>
  );
}
