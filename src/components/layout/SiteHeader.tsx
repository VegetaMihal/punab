"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { signOut } from "@/actions/auth";
import { Logo } from "@/components/layout/logo";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { cn } from "@/components/ui/cn";
import { HONORARY_POSITION_PAGE_TITLE } from "@/lib/leadership-constants";
import { PUNAB_MEMBERSHIP_GOOGLE_FORM_URL } from "@/lib/punab-external-urls";

type NavLink = { href: string; label: string };
type NavDisabledSubItem = { label: string; disabled: true; note: string };
type NavSubItem = NavLink | NavDisabledSubItem;
type NavDropdown = { label: string; items: NavSubItem[] };
type NavItem = NavLink | NavDropdown;

const nav: NavItem[] = [
  { href: "/", label: "Home" },
  {
    label: "Leadership",
    items: [
      { href: "/leadership", label: "Executive Leadership" },
      { href: "/leadership/honorary", label: HONORARY_POSITION_PAGE_TITLE },
    ],
  },
  {
    label: "Wings",
    items: [
      { href: "/forums", label: "Forums" },
      {
        disabled: true,
        label: "Chapters",
        note: "Coming soon — university chapters directory will appear here.",
      },
    ],
  },
  { href: "/events", label: "Upcoming Events" },
  {
    label: "July Award",
    items: [
      { href: "/july-award-2026", label: "July Award 2026" },
      { href: "/july-award-2026/participants/register", label: "Register as a participant" },
      { href: "/july-award-2026/facecard", label: "Facecard generator" },
    ],
  },
  {
    label: "Services",
    items: [
      {
        label: "BloodHero",
        disabled: true,
        note: "Coming soon — we're working hard on this",
      },
    ],
  },
  { href: "/notices", label: "Notices" },
  { href: "/archive", label: "Archive" },
];

function isDropdown(item: NavItem): item is NavDropdown {
  return "items" in item;
}

function isDisabledNavSubItem(item: NavSubItem): item is NavDisabledSubItem {
  return "disabled" in item && item.disabled === true;
}

function leadershipPathsActive(pathname: string) {
  return pathname === "/leadership" || pathname.startsWith("/leadership/");
}

function wingsPathsActive(pathname: string) {
  return pathname === "/chapters" || pathname === "/forums" || pathname.startsWith("/forums/");
}

function julyAwardPathsActive(pathname: string) {
  return pathname === "/july-award-2026" || pathname.startsWith("/july-award-2026/");
}

function navSubLinkActive(pathname: string, href: string) {
  if (href === "/forums") {
    return pathname === "/forums" || pathname.startsWith("/forums/");
  }
  if (href === "/july-award-2026") {
    return pathname === "/july-award-2026";
  }
  if (href.startsWith("/july-award-2026/")) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
}

function archivePathsActive(pathname: string) {
  return pathname === "/archive" || pathname.startsWith("/archive/");
}

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-brand)]";

const navDesktopBase =
  "relative whitespace-nowrap rounded-[var(--radius-full)] px-3 py-2 text-[0.9rem] font-semibold motion-safe:transition-[background-color,color,box-shadow] " +
  focusRing;
const navDesktopIdle =
  "text-[color:color-mix(in_srgb,var(--color-surface)_88%,transparent)] hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)] hover:shadow-[0_10px_24px_color-mix(in_srgb,black_18%,transparent)]";
const navDesktopActive =
  "bg-[color:var(--color-surface)] text-[color:var(--color-brand)] shadow-[0_10px_24px_color-mix(in_srgb,black_18%,transparent)] after:absolute after:left-1/2 after:top-full after:h-1 after:w-8 after:-translate-x-1/2 after:rounded-[var(--radius-full)] after:bg-[color:var(--brand-green)]";

const navMobileItem =
  "block min-h-11 rounded-md px-3 py-2.5 text-sm font-medium motion-safe:transition-colors " + focusRing;

const dropdownLinkBase =
  "block px-3 py-2 text-sm font-semibold text-[color:var(--color-text-2)] motion-safe:transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-brand)_8%,var(--color-surface))] hover:text-[color:var(--color-brand)] " +
  focusRing;
const dropdownLinkActive =
  "bg-[color:color-mix(in_srgb,var(--color-brand)_10%,var(--color-surface))] text-[color:var(--color-brand)]";

type Props = {
  user: User | null;
  isAdmin?: boolean;
};

export function SiteHeader({ user, isAdmin }: Props) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [finePointerHover, setFinePointerHover] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setFinePointerHover(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileNavOpen(false); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <header className="sticky top-0 z-[100] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--color-brand)_86%,black)_0%,color-mix(in_srgb,var(--color-brand)_72%,var(--brand-green))_100%)] shadow-[0_12px_40px_color-mix(in_srgb,var(--color-brand)_24%,transparent)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_120%_at_18%_120%,color-mix(in_srgb,var(--brand-green)_42%,transparent)_0%,transparent_58%),linear-gradient(115deg,transparent_0%,color-mix(in_srgb,var(--color-surface)_12%,transparent)_48%,transparent_68%)]"
        aria-hidden
      />
      <MarketingContainer className="relative z-[1] flex min-h-20 items-center gap-5 py-2">
        <Link href="/" className={cn("group flex min-w-0 shrink-0 items-center rounded-sm", focusRing)}>
          <span className="rounded-[var(--radius-md)] bg-[color:color-mix(in_srgb,var(--color-surface)_92%,transparent)] px-2 py-1 shadow-[var(--shadow-sm)]">
            <Logo variant="navbar" />
          </span>
        </Link>

        <div className="ml-auto flex min-w-0 items-center gap-4">
          <nav
            className="hidden min-w-0 items-center justify-center gap-1 xl:flex"
            aria-label="Primary"
          >
            {nav.map((item) =>
              isDropdown(item) ? (
                <details
                  key={item.label}
                  className="relative"
                  onMouseEnter={(e) => {
                    if (!finePointerHover) return;
                    (e.currentTarget as HTMLDetailsElement).open = true;
                  }}
                  onMouseLeave={(e) => {
                    if (!finePointerHover) return;
                    (e.currentTarget as HTMLDetailsElement).open = false;
                  }}
                >
                  <summary
                    className={cn(
                      "flex cursor-pointer list-none items-center gap-1 marker:hidden transition-colors [&::-webkit-details-marker]:hidden",
                      navDesktopBase,
                      (item.label === "Leadership" && leadershipPathsActive(pathname)) ||
                      (item.label === "Wings" && wingsPathsActive(pathname)) ||
                      (item.label === "July Award" && julyAwardPathsActive(pathname))
                        ? navDesktopActive
                        : navDesktopIdle,
                    )}
                  >
                    {item.label}
                    <svg className="h-3.5 w-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="absolute left-0 top-full z-[110] min-w-48 pt-1">
                    <div className="ds-dropdown-panel rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] py-1 shadow-[var(--shadow-md)]">
                      {item.items.map((sub) =>
                        isDisabledNavSubItem(sub) ? (
                          <div key={sub.label} className="px-3 py-2">
                            <p className="cursor-default text-sm font-medium text-[color:var(--color-text-muted)]">
                              {sub.label}
                            </p>
                            <p className="mt-1 text-xs leading-snug text-[color:var(--color-text-muted)]">{sub.note}</p>
                          </div>
                        ) : (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              dropdownLinkBase,
                              navSubLinkActive(pathname, sub.href) && dropdownLinkActive,
                            )}
                          >
                            {sub.label}
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                </details>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    navDesktopBase,
                    (item.href === "/archive" ? archivePathsActive(pathname) : pathname === item.href)
                      ? navDesktopActive
                      : navDesktopIdle,
                  )}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {user ? (
            <div className="hidden items-center gap-1.5 xl:flex">
              {isAdmin && (
                <Link
                  href="/admin"
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-green hover:bg-brand-green-muted motion-safe:transition-colors dark:hover:bg-stone-900",
                    focusRing,
                  )}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/dashboard"
                className={cn(navDesktopBase, navDesktopIdle)}
              >
                Dashboard
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className={cn(
                    "rounded-md border border-stone-300 px-2.5 py-1.5 text-sm font-medium text-stone-700 motion-safe:transition-colors hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-900",
                    focusRing,
                  )}
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : null}

          {!user && (
            <Link
              href={PUNAB_MEMBERSHIP_GOOGLE_FORM_URL}
              prefetch={false}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "hidden min-h-11 items-center justify-center rounded-[var(--radius-full)] bg-[color:var(--color-surface)] px-5 text-sm font-bold text-[color:var(--color-brand)] shadow-[0_14px_34px_color-mix(in_srgb,black_24%,transparent)] motion-safe:transition-[transform,background-color,box-shadow] motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-[color:color-mix(in_srgb,var(--color-surface)_92%,var(--brand-green-muted))] xl:inline-flex",
                focusRing,
              )}
            >
              Join PUNAB
            </Link>
          )}

          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-surface)_34%,transparent)] bg-[color:color-mix(in_srgb,var(--color-surface)_14%,transparent)] p-2 text-[color:var(--color-surface)] motion-safe:transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-surface)_22%,transparent)] xl:hidden",
              focusRing,
            )}
            aria-expanded={mobileNavOpen}
            aria-controls="site-mobile-nav"
            aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="text-lg leading-none text-[color:var(--color-surface)]" aria-hidden>
              {mobileNavOpen ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </MarketingContainer>
      {/* Mobile bottom sheet — xl:hidden matches hamburger */}
      <div
        className={cn(
          "fixed inset-0 z-[200] xl:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={mobileNavOpen ? undefined : true}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
          className={cn(
            "absolute inset-0 bg-stone-950/60 backdrop-blur-sm motion-safe:transition-opacity duration-300",
            mobileNavOpen ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Bottom sheet */}
        <div
          id="site-mobile-nav"
          className={cn(
            "absolute bottom-0 left-0 right-0 flex max-h-[88svh] flex-col rounded-t-2xl bg-[color:var(--color-surface)] shadow-[0_-8px_40px_rgba(0,0,0,0.18)] motion-safe:transition-transform duration-300 ease-out",
            mobileNavOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          {/* Drag handle */}
          <div className="flex shrink-0 justify-center pb-2 pt-3" aria-hidden>
            <div className="h-1 w-10 rounded-full bg-stone-300 dark:bg-stone-600" />
          </div>

          {/* Sheet header */}
          <div className="flex shrink-0 items-center justify-between px-5 pb-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[color:var(--color-text-muted)]">Navigation</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setMobileNavOpen(false)}
              className={cn("rounded-full p-1.5 text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] motion-safe:transition-colors", focusRing)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Scrollable nav */}
          <nav className="flex-1 overflow-y-auto overscroll-contain px-4 pb-2" aria-label="Primary mobile">
            <div className="flex flex-col gap-0.5">
              {nav.map((item) =>
                isDropdown(item) ? (
                  <div key={item.label}>
                    <p className="px-3 pb-1 pt-4 text-[0.68rem] font-bold uppercase tracking-widest text-[color:var(--color-text-muted)]">
                      {item.label}
                    </p>
                    <div className="flex flex-col gap-0.5">
                      {item.items.map((sub) =>
                        isDisabledNavSubItem(sub) ? (
                          <div key={sub.label} className="flex items-center gap-3 rounded-xl px-4 py-3 opacity-40">
                            <div className="min-w-0">
                              <p className="text-[0.9rem] font-medium text-[color:var(--color-text)]">{sub.label}</p>
                              <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">{sub.note}</p>
                            </div>
                          </div>
                        ) : (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMobileNavOpen(false)}
                            className={cn(
                              "flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-[0.9rem] font-medium motion-safe:transition-colors",
                              focusRing,
                              navSubLinkActive(pathname, sub.href)
                                ? "bg-[color:color-mix(in_srgb,var(--color-brand)_10%,var(--color-surface))] font-semibold text-[color:var(--color-brand)]"
                                : "text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-2)]",
                            )}
                          >
                            {sub.label}
                            <svg className="h-4 w-4 shrink-0 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        ),
                      )}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center justify-between rounded-xl px-4 py-3 text-[0.9rem] font-medium motion-safe:transition-colors",
                      focusRing,
                      (item.href === "/archive" ? archivePathsActive(pathname) : pathname === item.href)
                        ? "bg-[color:color-mix(in_srgb,var(--color-brand)_10%,var(--color-surface))] font-semibold text-[color:var(--color-brand)]"
                        : "text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-2)]",
                    )}
                  >
                    {item.label}
                    <svg className="h-4 w-4 shrink-0 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ),
              )}
            </div>
          </nav>

          {/* Footer: auth + CTA */}
          <div className="shrink-0 border-t border-[color:var(--color-border)] px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
            {user ? (
              <div className="flex flex-col gap-1.5">
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileNavOpen(false)}
                    className={cn("flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-green hover:bg-brand-green-muted motion-safe:transition-colors", focusRing)}
                  >
                    Admin panel
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className={cn("flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-2)] hover:bg-[color:var(--color-surface-2)] motion-safe:transition-colors", focusRing)}
                >
                  Dashboard
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    className={cn("w-full min-h-11 rounded-xl border border-[color:var(--color-border)] px-4 py-2.5 text-left text-sm font-medium text-[color:var(--color-text-2)] hover:bg-[color:var(--color-surface-2)] motion-safe:transition-colors", focusRing)}
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href={PUNAB_MEMBERSHIP_GOOGLE_FORM_URL}
                prefetch={false}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileNavOpen(false)}
                className={cn("flex min-h-12 w-full items-center justify-center rounded-[var(--radius-full)] bg-[color:var(--color-brand)] px-5 text-sm font-bold text-white shadow-md motion-safe:transition-[transform,box-shadow] motion-safe:active:scale-95", focusRing)}
              >
                Join PUNAB
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
