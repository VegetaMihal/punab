"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      richColors
      closeButton
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "!rounded-[var(--radius-md)] !border !border-[color:var(--color-border)] !bg-[color:var(--color-surface)] !text-[color:var(--color-text)] !shadow-[var(--shadow-md)]",
          title: "!font-semibold !text-[color:var(--color-text)]",
          description: "!text-[color:var(--color-text-muted)]",
          success: "!border-[color:color-mix(in_srgb,var(--color-success)_35%,var(--color-border))]",
          error: "!border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))]",
        },
      }}
    />
  );
}
