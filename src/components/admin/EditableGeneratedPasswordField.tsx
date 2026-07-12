"use client";

import { useCallback, useId, useState } from "react";
import { toast } from "sonner";
import { copyTextToClipboard } from "@/lib/utils/copy-to-clipboard";
import { generateAdminPassword } from "@/lib/utils/generate-admin-password";

type Props = {
  name?: string;
  inputId?: string;
  className?: string;
  inputClassName?: string;
  label?: string;
  autoGenerate?: boolean;
  showGeneratorControls?: boolean;
  inputType?: "text" | "password";
  instanceKey?: string | number;
};

export function EditableGeneratedPasswordField({
  name = "password",
  inputId,
  className,
  inputClassName,
  label = "Password",
  autoGenerate = true,
  showGeneratorControls = true,
  inputType = "text",
  instanceKey,
}: Props) {
  const fallbackId = useId();
  const id = inputId ?? fallbackId;
  const storageKey = `edgpf_${name}_${instanceKey ?? 0}`;
  const [password, setPassword] = useState(() => {
    if (!autoGenerate) return "";
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) return saved;
    } catch {}
    const fresh = generateAdminPassword();
    try { sessionStorage.setItem(storageKey, fresh); } catch {}
    return fresh;
  });
  const [copied, setCopied] = useState(false);

  const regenerate = useCallback(() => {
    const fresh = generateAdminPassword();
    try { sessionStorage.setItem(storageKey, fresh); } catch {}
    setPassword(fresh);
    setCopied(false);
  }, [storageKey]);

  const copyPassword = useCallback(async () => {
    if (!password) return;
    const ok = await copyTextToClipboard(password);
    if (ok) {
      setCopied(true);
      toast.success("Password copied to clipboard.");
      window.setTimeout(() => setCopied(false), 2000);
      return;
    }
    toast.error("Could not copy. Select the password and copy manually.");
  }, [password]);

  return (
    <div className={className}>
      <span className="font-medium text-stone-700 dark:text-stone-300">{label}</span>
      <div className="mt-1 flex flex-wrap gap-2">
        <input
          id={id}
          type={inputType}
          name={name}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            try { sessionStorage.setItem(storageKey, e.target.value); } catch {}
          }}
          required
          minLength={8}
          autoComplete="off"
          spellCheck={false}
          placeholder={showGeneratorControls ? "Generated password" : "Enter new password"}
          aria-label={label}
          className={
            inputClassName ??
            "min-w-[160px] flex-1 rounded-md border border-stone-300 bg-white px-3 py-2 font-mono text-sm dark:border-stone-600 dark:bg-stone-900"
          }
        />
        {showGeneratorControls && (
          <>
            <button
              type="button"
              onClick={regenerate}
              className="rounded-md border border-stone-300 px-2 py-2 text-xs font-medium dark:border-stone-600"
            >
              Regenerate
            </button>
            <button
              type="button"
              onClick={() => void copyPassword()}
              disabled={!password}
              className="rounded-md border border-stone-300 px-2 py-2 text-xs font-medium disabled:opacity-40 dark:border-stone-600"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
