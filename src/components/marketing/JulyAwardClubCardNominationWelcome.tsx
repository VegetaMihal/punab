"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type Props = { initialOpen: boolean };

export function JulyAwardClubCardNominationWelcome({ initialOpen }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(initialOpen);

  useEffect(() => {
    if (!initialOpen) setOpen(false);
  }, [initialOpen]);

  const continueToGenerator = useCallback(() => {
    setOpen(false);
    router.replace(pathname ?? "/july-award-2026/club-card", { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => dialogRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div className="absolute inset-0 bg-black/55" aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        aria-labelledby="july-award-club-welcome-title"
        className="relative z-[1] w-full max-w-lg rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[var(--shadow-md)] outline-none sm:p-6"
      >
        <h2
          id="july-award-club-welcome-title"
          className="text-lg font-semibold tracking-tight text-[color:var(--color-text)]"
        >
          Club card
        </h2>
        <p className="mt-3 text-small leading-relaxed text-[color:var(--color-text-muted)]">
          Please <strong className="font-semibold text-[color:var(--color-text)]">generate</strong> your card below and{" "}
          <strong className="font-semibold text-[color:var(--color-text)]">share it on your socials</strong> (and
          anywhere else you promote the club). That is a{" "}
          <strong className="font-semibold text-[color:var(--color-text)]">prerequisite for selection.</strong>
        </p>
        <p className="mt-2 text-small leading-relaxed text-[color:var(--color-text-muted)]">
          <strong className="font-semibold text-[color:var(--color-text)]">Optional:</strong> members may create
          personal facecards too. It is appreciated.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <Button type="button" variant="primary" size="md" className="w-full sm:w-auto" onClick={continueToGenerator}>
            Continue to generator
          </Button>
          <Button href="/july-award-2026/facecard" variant="secondary" size="md" className="w-full sm:w-auto">
            Member facecard generator
          </Button>
        </div>
      </div>
    </div>
  );
}
