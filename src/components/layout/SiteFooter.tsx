import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { cn } from "@/components/ui/cn";

const footerLink =
  "rounded-sm text-[color:var(--color-text-muted)] motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)] hover:text-[color:var(--color-brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--color-brand)]";

export type FooterContent = {
  blurb: string;
  address: string;
  email: string;
};

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.05rem] w-[1.05rem]" fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.9h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.05rem] w-[1.05rem]" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.62 0 4.29 2.38 4.29 5.48v6.26ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.05rem] w-[1.05rem]" fill="currentColor" aria-hidden>
      <path d="M23.5 7.2s-.23-1.64-.94-2.36c-.9-.95-1.9-.95-2.36-1C16.95 3.6 12 3.6 12 3.6h-.01s-4.95 0-8.2.24c-.46.05-1.46.05-2.36 1-.71.72-.94 2.36-.94 2.36S0 9.13 0 11.05v1.79c0 1.93.23 3.86.23 3.86s.23 1.64.94 2.36c.9.95 2.08.92 2.6 1.02C5.6 20.27 12 20.33 12 20.33s4.95 0 8.2-.25c.46-.05 1.46-.05 2.36-1 .71-.72.94-2.36.94-2.36s.23-1.93.23-3.86v-1.79c0-1.92-.23-3.85-.23-3.85ZM9.55 14.93V8.93l6.27 3-6.27 3Z" />
    </svg>
  );
}

const social = [
  { label: "Facebook", href: "https://www.facebook.com/punab24", icon: FacebookIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com", icon: LinkedInIcon },
  { label: "YouTube", href: "https://www.youtube.com", icon: YouTubeIcon },
];

export function SiteFooter({ content }: { content: FooterContent }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]">
      <MarketingContainer className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
        <div className="lg:col-span-1">
          <Logo variant="footer" />
          <p className="mt-3 max-w-sm text-small leading-relaxed text-[color:var(--color-text-muted)]">{content.blurb}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">Quick links</p>
          <ul className="mt-4 space-y-2.5 text-small">
            <li>
              <Link href="/about" className={footerLink}>
                About
              </Link>
            </li>
            <li>
              <Link href="/leadership" className={footerLink}>
                Executive Leadership
              </Link>
            </li>
            <li>
              <Link href="/forums" className={footerLink}>
                Forums
              </Link>
            </li>
            <li>
              <Link href="/certificate/verify" className={footerLink}>
                Certificate Verify
              </Link>
            </li>
            <li>
              <Link href="/events" className={footerLink}>
                Upcoming Events
              </Link>
            </li>
            <li>
              <Link href="/notices" className={footerLink}>
                Notices
              </Link>
            </li>
            <li>
              <Link href="/archive" className={footerLink}>
                Archive
              </Link>
            </li>
            <li>
              <Link href="/contact" className={footerLink}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">Services</p>
          <ul className="mt-4 space-y-2.5 text-small">
            <li>
              <span className="text-[color:var(--color-text-muted)]">BloodHero — coming soon</span>
            </li>
            <li>
              <Link href="/join" className={footerLink}>
                Join PUNAB
              </Link>
            </li>
            <li>
              <Link href="/login" className={footerLink}>
                Member login
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">Contact</p>
          <p className="mt-4 text-small leading-relaxed text-[color:var(--color-text-muted)]">{content.address}</p>
          <p className="mt-3 text-small">
            <a
              href={`mailto:${content.email}`}
              className={cn(footerLink, "font-medium text-[color:var(--accent)] hover:text-[color:var(--color-brand)]")}
            >
              {content.email}
            </a>
          </p>
        </div>
      </MarketingContainer>

      <div className="border-t border-[color:var(--color-border)]">
        <MarketingContainer className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:justify-between sm:py-6">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-[var(--radius-full)] border border-[color:var(--color-border)] text-[color:var(--color-text-muted)] motion-safe:transition-[color,border-color,transform] motion-safe:duration-[var(--transition-fast)] hover:scale-[1.06] hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)]",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--color-brand)]",
                )}
                aria-label={s.label}
              >
                <s.icon />
              </a>
            ))}
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <p className="text-center text-xs text-[color:var(--color-text-muted)] sm:text-left">
              © {year} PUNAB. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wide text-[color:var(--color-text-muted)]">
                Developed by
              </span>
              <a
                href="https://www.nextgenit.online"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex shrink-0 rounded-sm opacity-90 motion-safe:transition-opacity hover:opacity-100",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--color-brand)]",
                )}
                aria-label="NextGenIT — website by NextGenIT"
              >
                <Image
                  src="/branding/nextgenit-logo.png"
                  alt="NextGenIT Logo"
                  width={100}
                  height={28}
                  className="h-6 w-auto max-w-[100px] object-contain object-left"
                />
              </a>
            </div>
          </div>
        </MarketingContainer>
      </div>
    </footer>
  );
}
