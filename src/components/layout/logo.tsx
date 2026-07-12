import Image from "next/image";
import { cn } from "@/components/ui/cn";

type LogoProps = {
  variant?: "navbar" | "footer" | "icon";
  className?: string;
};

// Keep a single source constant so a corrected transparent asset
// can be swapped later without touching header/footer layout code.
export const PUNAB_LOGO_SRC = "/branding/punab-logo-v2.png";

export function Logo({ variant = "navbar", className }: LogoProps) {
  const isNavbar = variant === "navbar";
  const isFooter = variant === "footer";
  const iconSize = isNavbar ? 60 : isFooter ? 64 : 40;

  const brandGap = isNavbar ? "gap-2.5" : "gap-3";

  return (
    <div className={cn("flex min-w-0 shrink-0 items-center", brandGap, className)}>
      <Image
        src={PUNAB_LOGO_SRC}
        alt="PUNAB Logo"
        width={iconSize}
        height={iconSize}
        className={cn(
          "object-contain",
          isNavbar && "h-[60px] max-h-[60px] w-auto max-w-[min(220px,55vw)]",
          isFooter && "h-16 max-h-16 w-auto max-w-[min(280px,70vw)]",
          !isNavbar && !isFooter && "h-10 w-10 max-w-10",
        )}
        sizes={isNavbar ? "60px" : isFooter ? "64px" : "40px"}
      />
    </div>
  );
}
