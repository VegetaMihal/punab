import type { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

type PaddingY = "none" | "sm" | "md" | "lg";

const pyClass: Record<PaddingY, string> = {
  none: "",
  sm: "py-6",
  md: "py-10",
  lg: "py-14",
};

const maxWidthClass = {
  "6xl": "max-w-6xl",
  "3xl": "max-w-3xl",
  "2xl": "max-w-2xl",
  md: "max-w-md",
  lg: "max-w-lg",
  auth: "max-w-[var(--container-auth)]",
} as const;

export type MarketingMaxWidth = keyof typeof maxWidthClass;

type Props = {
  children: ReactNode;
  className?: string;
  /** Vertical padding inside the max-width column */
  paddingY?: PaddingY;
  as?: "div" | "section";
  maxWidth?: MarketingMaxWidth;
};

export function MarketingContainer({
  children,
  className,
  paddingY = "none",
  as: Tag = "div",
  maxWidth = "6xl",
}: Props) {
  return (
    <Tag className={cn("mx-auto w-full px-4", maxWidthClass[maxWidth], pyClass[paddingY], className)}>
      {children}
    </Tag>
  );
}
