"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutJulyAwardVolunteer } from "@/actions/july-award-ticket-verify";

export function VolunteerSwitchClubButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await logoutJulyAwardVolunteer();
          router.refresh();
        })
      }
      className="text-small font-medium text-[color:var(--color-text-muted)] underline hover:text-[color:var(--color-text)]"
    >
      {pending ? "Switching…" : "Not your club? Switch passcode"}
    </button>
  );
}
