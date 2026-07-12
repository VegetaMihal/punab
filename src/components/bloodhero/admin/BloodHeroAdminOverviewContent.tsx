import Link from "next/link";
import type { BloodHeroAdminUrls } from "@/lib/bloodhero/admin-paths";

const sectionDefs = [
  {
    title: "Pending donors",
    description: "Review donor registrations (status pending) and approve or reject.",
    key: "pending" as const,
  },
  {
    title: "Requests",
    description: "Blood requests, tracking, and coordinator workflow.",
    key: "requests" as const,
  },
  {
    title: "Notifications",
    description: "Email queue and delivery status for donor outreach.",
    key: "notifications" as const,
  },
  {
    title: "Matches",
    description: "Matching runs and donor–request pairings.",
    key: "matches" as const,
  },
  {
    title: "Certificates",
    description: "Recognition and certificate tooling.",
    key: "certificates" as const,
  },
] as const;

function hrefForSection(paths: BloodHeroAdminUrls, key: (typeof sectionDefs)[number]["key"]): string | null {
  if (key === "pending") return paths.pendingDonors;
  if (key === "requests") return paths.requests;
  return null;
}

export function BloodHeroAdminOverviewContent({
  paths,
  variant,
}: {
  paths: BloodHeroAdminUrls;
  variant: "standalone" | "punab";
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Overview</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        {variant === "punab"
          ? "Manage BloodHero donors and blood requests from this admin section."
          : "BloodHero administration is separate from the main PUNAB admin. Open a section below to manage that area."}
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sectionDefs.map((item) => {
          const href = hrefForSection(paths, item.key);
          const inner = (
            <>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{item.title}</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{item.description}</p>
              <p className="mt-3 text-xs font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                {href ? "Open" : "Coming soon"}
              </p>
            </>
          );
          if (href) {
            return (
              <li key={item.key}>
                <Link
                  href={href}
                  className="block rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-red-300/60 hover:shadow dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-red-900/50"
                >
                  {inner}
                </Link>
              </li>
            );
          }
          return (
            <li
              key={item.key}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              {inner}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
