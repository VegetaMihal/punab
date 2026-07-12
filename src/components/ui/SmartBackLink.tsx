"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

type SmartBackLinkProps = {
  fallbackHref: string;
  className?: string;
  children: ReactNode;
};

export function SmartBackLink({ fallbackHref, className, children }: SmartBackLinkProps) {
  const router = useRouter();

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (typeof window === "undefined") {
      return;
    }

    const hasHistory = window.history.length > 1;

    if (hasHistory) {
      event.preventDefault();
      router.back();
    }
  };

  return (
    <Link href={fallbackHref} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
