import Image from "next/image";
import Link from "next/link";
import { MarketingContainer } from "@/components/ui/MarketingContainer";
import { SmartBackLink } from "@/components/ui/SmartBackLink";
import { cn } from "@/components/ui/cn";

export type BreadcrumbItem = { label: string; href?: string };

type Props = {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
  tone?: "default" | "pattern";
  /** Shown next to the title, e.g. a forum's uploaded logo. */
  logoUrl?: string | null;
};

export function PageHeader({ title, description, breadcrumbs, className, tone = "default", logoUrl }: Props) {
  const breadcrumbFallback =
    breadcrumbs?.length && breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2]?.href : undefined;
  const backFallback = breadcrumbFallback || "/";

  return (
    <div
      className={cn(
        "w-full border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] py-10 md:py-14",
        tone === "pattern" &&
          "bg-[linear-gradient(125deg,color-mix(in_srgb,var(--color-brand)_7%,var(--color-surface-2))_0%,var(--color-surface-2)_42%,color-mix(in_srgb,var(--color-brand)_6%,var(--color-surface-2))_100%)]",
        className,
      )}
    >
      <MarketingContainer>
        <SmartBackLink
          fallbackHref={backFallback}
          className="text-small mb-4 inline-flex items-center text-[color:var(--color-text-muted)] hover:text-[color:var(--color-brand)] motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)]"
        >
          ← Back
        </SmartBackLink>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="text-small mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-[color:var(--color-text-muted)]">
            {breadcrumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="inline-flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-[color:var(--color-border-strong)]">/</span>}
                {c.href ? (
                  <Link
                    href={c.href}
                    className="hover:text-[color:var(--color-brand)] motion-safe:transition-colors motion-safe:duration-[var(--transition-fast)]"
                  >
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-[color:var(--color-text-2)]">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-center gap-5 sm:flex-nowrap sm:gap-6">
          {logoUrl && (
            <span className="relative h-24 w-24 shrink-0 overflow-hidden rounded-3xl border border-[color:color-mix(in_srgb,var(--color-brand)_18%,var(--color-border))] bg-[linear-gradient(160deg,var(--color-surface)_0%,color-mix(in_srgb,var(--brand-green-muted)_35%,var(--color-surface))_100%)] p-2 shadow-[var(--shadow-md)] sm:h-32 sm:w-32">
              <Image src={logoUrl} alt="" aria-hidden fill sizes="128px" className="object-contain p-1.5" />
            </span>
          )}
          <h1 className="text-h1 text-[color:var(--color-text)]">{title}</h1>
        </div>
        {description && (
          <p className="text-body mt-4 max-w-3xl text-[color:var(--color-text-muted)]">{description}</p>
        )}
      </MarketingContainer>
    </div>
  );
}
