import Link from "next/link";
import type { HTMLAttributeAnchorTarget, ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type Variant = "primary" | "secondary" | "ghost" | "inverse" | "inverseOutline" | "heroPulseGreen" | "heroPulseRed";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold motion-safe:transition-[transform,box-shadow,background-color,border-color,color,opacity] motion-safe:duration-[var(--transition-fast)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--color-brand)] rounded-[var(--radius-full)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-[color:var(--color-brand)] text-[color:var(--color-surface)] shadow-[var(--shadow-sm)] hover:scale-[1.02] motion-safe:hover:shadow-[var(--shadow-brand)] hover:bg-[color:var(--color-brand-dark)]",
  secondary:
    "border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-text-2)] shadow-[var(--shadow-sm)] hover:scale-[1.02] hover:border-[color:var(--color-brand)] hover:text-[color:var(--color-brand)] dark:bg-[color:var(--color-surface-2)]",
  ghost:
    "border border-transparent bg-transparent text-[color:var(--color-text-2)] hover:bg-[color:var(--color-surface-2)] hover:scale-[1.01] underline-offset-4 hover:underline",
  inverse:
    "bg-[color:var(--color-surface)] text-[color:var(--color-brand)] shadow-[var(--shadow-md)] hover:scale-[1.02] hover:bg-[color:var(--color-surface-2)]",
  inverseOutline:
    "border border-[color:color-mix(in_srgb,var(--color-surface)_45%,transparent)] text-[color:var(--color-surface)] hover:scale-[1.02] hover:bg-[color:color-mix(in_srgb,var(--color-surface)_12%,transparent)]",
  heroPulseGreen:
    "hero-cta-pulse--green motion-safe:hover:scale-[1.02] motion-safe:hover:brightness-[1.06]",
  heroPulseRed:
    "hero-cta-pulse--red motion-safe:hover:scale-[1.02] motion-safe:hover:brightness-[1.06]",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm min-h-[2.25rem]",
  md: "px-5 py-2.5 text-base min-h-[2.75rem]",
  lg: "px-7 py-3.5 text-lg min-h-[3.25rem]",
};

function Spinner() {
  return (
    <span
      className="inline-block h-[1em] w-[1em] shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-90"
      aria-hidden
    />
  );
}

type Common = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

type LinkButtonProps = Common & {
  href: string;
  prefetch?: boolean;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
};

type NativeButtonProps = Common & {
  href?: undefined;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export type ButtonProps = LinkButtonProps | NativeButtonProps;

export function Button(props: ButtonProps) {
  if ("href" in props && props.href) {
    const { children, className, variant = "primary", size = "md", loading = false, href, prefetch, target, rel } =
      props;
    const classes = cn(
      base,
      variantClass[variant],
      sizeClass[size],
      loading && "pointer-events-none opacity-70",
      className,
    );
    return (
      <Link
        href={href}
        prefetch={prefetch}
        target={target}
        rel={rel}
        className={classes}
      >
        {loading && <Spinner />}
        {children}
      </Link>
    );
  }

  const {
    children,
    className,
    variant = "primary",
    size = "md",
    loading = false,
    type = "button",
    disabled,
    ...rest
  } = props as NativeButtonProps;
  const classes = cn(
    base,
    variantClass[variant],
    sizeClass[size],
    loading && "pointer-events-none opacity-70",
    className,
  );
  const isDisabled = disabled || loading;
  return (
    <button type={type} disabled={isDisabled} className={classes} {...rest}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}
