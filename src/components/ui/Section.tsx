import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type Surface = "white" | "muted" | "transparent";

const surfaceClass: Record<Surface, string> = {
  white: "bg-[color:var(--color-surface)]",
  muted: "bg-[color:var(--color-surface-2)]",
  transparent: "bg-transparent",
};

type PaddingY = "none" | "sm" | "md" | "lg" | "section";

const sectionPy: Record<PaddingY, string> = {
  none: "",
  sm: "py-8",
  md: "py-12",
  lg: "py-14",
  section: "py-[length:var(--section-py-mobile)] md:py-[length:var(--section-py-desktop)]",
};

type Props = {
  children: ReactNode;
  className?: string;
  surface?: Surface;
  /** Bottom border between stacked sections */
  divider?: boolean;
  paddingY?: PaddingY;
};

export function Section({
  children,
  className,
  surface = "white",
  paddingY = "section",
}: Props) {
  return (
    <section
      className={cn(
        "relative overflow-hidden",
        surfaceClass[surface],
        sectionPy[paddingY],
        className,
      )}
    >
      {children}
    </section>
  );
}
