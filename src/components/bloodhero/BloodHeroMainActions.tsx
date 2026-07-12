import Link from "next/link";
import { bloodHeroMainActionLinks } from "@/components/bloodhero/bloodhero-nav";

const baseBtn =
  "inline-flex w-full touch-manipulation items-center justify-center rounded-2xl px-5 py-3.5 text-center text-base font-semibold leading-snug shadow-sm transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:min-h-[3.25rem] sm:rounded-xl sm:py-0 sm:text-[0.9375rem]";

/** Shared primary action trio — mobile-first stack with strong tap targets. */
export function BloodHeroMainActions({ id }: { id?: string }) {
  const [donor, request, track] = bloodHeroMainActionLinks;

  return (
    <div id={id} className="w-full max-w-xl sm:max-w-2xl">
      <ul className="flex flex-col gap-4 sm:grid sm:grid-cols-3 sm:gap-3">
        <li>
          <Link
            href={donor.href}
            className={`${baseBtn} min-h-[3.25rem] bg-red-600 text-white shadow-md shadow-red-600/25 hover:bg-red-700 focus-visible:outline-red-600 sm:shadow-sm dark:bg-red-500 dark:shadow-red-900/30 dark:hover:bg-red-600`}
          >
            {donor.label}
          </Link>
        </li>
        <li>
          <Link
            href={request.href}
            className={`${baseBtn} min-h-[3.25rem] border-2 border-red-600 bg-white text-red-800 hover:bg-red-50 focus-visible:outline-red-600 dark:border-red-500 dark:bg-zinc-900/40 dark:text-red-200 dark:hover:bg-red-950/50`}
          >
            {request.label}
          </Link>
        </li>
        <li>
          <Link
            href={track.href}
            className={`${baseBtn} min-h-[3.25rem] border-2 border-zinc-400 bg-white text-zinc-900 hover:border-zinc-500 hover:bg-zinc-50 focus-visible:outline-zinc-500 dark:border-zinc-500 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800`}
          >
            {track.label}
          </Link>
        </li>
      </ul>
    </div>
  );
}
