"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  submitJulyAwardDebateRegistration,
  type JulyAwardDebateRegistrationState,
} from "@/actions/july-award-debate-registration";
import { Button } from "@/components/ui/Button";
import { saveJulyAwardParticipationPrefill } from "@/lib/marketing/july-award-participation-prefill";
import { validateJulyAwardLogoFile } from "@/lib/marketing/july-award-nomination-upload";

const initial: JulyAwardDebateRegistrationState = {};

export function JulyAwardDebateCardRegistrationForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitJulyAwardDebateRegistration, initial);
  const [clubName, setClubName] = useState("");
  const [universityName, setUniversityName] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const logoPreview = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile]
  );

  useEffect(() => {
    if (!logoPreview) return;
    return () => URL.revokeObjectURL(logoPreview);
  }, [logoPreview]);

  useEffect(() => {
    if (!state?.success || !state.participationPrefill) return;
    toast.success("Details saved. Create your Debate Forum card next.");
    saveJulyAwardParticipationPrefill(state.participationPrefill);
    const { clubName: c, universityName: u } = state.participationPrefill;
    const q = new URLSearchParams({
      club: c,
      university: u,
      from: "debate-registration",
    });
    router.push(`/july-award-2026/participation-card?${q.toString()}`);
  }, [state?.success, state?.participationPrefill, router]);

  useEffect(() => {
    if (state?.success || !state?.fieldValues) return;
    setClubName(state.fieldValues.clubName);
    setUniversityName(state.fieldValues.universityName);
  }, [state?.fieldValues, state?.success]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!logoFile) {
      toast.error("Club logo is required (image, max 10 MB).");
      return;
    }
    const err = validateJulyAwardLogoFile(logoFile);
    if (err) {
      toast.error(err);
      return;
    }
    const fd = new FormData();
    fd.set("clubName", clubName);
    fd.set("universityName", universityName);
    fd.set("clubLogoFile", logoFile);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-6 rounded-[var(--radius-xl)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 md:p-8">
      <div>
        <h2 className="text-h3 text-[color:var(--color-text)]">Register for your participation card</h2>
        <p className="mt-2 text-small leading-relaxed text-[color:var(--color-text-muted)]">
          Debate chapters do not use the full nomination upload. Enter your club details here — we save them for
          PUNAB admin and take you to generate your card with partnership name{" "}
          <strong className="font-semibold text-[color:var(--color-text)]">Debate Forum</strong> (not an AP number).
        </p>
      </div>

      {state?.error ? (
        <p className="text-small text-[color:var(--color-error)]" role="alert">
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="debate-clubName" className="ds-label">
          Club name <span className="text-[color:var(--color-error)]">*</span>
        </label>
        <input
          id="debate-clubName"
          name="clubName"
          required
          className="ds-input mt-2"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="debate-universityName" className="ds-label">
          University name <span className="text-[color:var(--color-error)]">*</span>
        </label>
        <input
          id="debate-universityName"
          name="universityName"
          required
          className="ds-input mt-2"
          value={universityName}
          onChange={(e) => setUniversityName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="debate-clubLogoFile" className="ds-label">
          Club logo <span className="text-[color:var(--color-error)]">*</span>
        </label>
        <p className="mt-1 text-small text-[color:var(--color-text-muted)]">JPEG, PNG, WebP, or GIF — max 10 MB.</p>
        {logoPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoPreview}
            alt=""
            className="mt-2 h-16 w-16 rounded-full border border-[color:var(--color-border)] object-contain bg-white p-1"
          />
        ) : null}
        <input
          ref={logoInputRef}
          id="debate-clubLogoFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="mt-2 block w-full text-small file:mr-3 file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-surface-2)] file:px-3 file:py-2 file:font-semibold"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (file) {
              const pickErr = validateJulyAwardLogoFile(file);
              if (pickErr) {
                toast.error(pickErr);
                e.target.value = "";
                setLogoFile(null);
                return;
              }
            }
            setLogoFile(file);
          }}
        />
        {state?.fieldErrors?.clubLogoFile ? (
          <p className="mt-1.5 text-small text-[color:var(--color-error)]">{state.fieldErrors.clubLogoFile}</p>
        ) : null}
      </div>

      <Button type="submit" variant="primary" loading={pending} disabled={!logoFile && !state?.success}>
        {pending ? "Saving…" : "Continue to card generator"}
      </Button>
    </form>
  );
}
