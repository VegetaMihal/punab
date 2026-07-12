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
  submitJulyAwardNomination,
  type JulyAwardNominationState,
} from "@/actions/july-award-nomination";
import { Button } from "@/components/ui/Button";
import type { JulyAwardClubCategory } from "@/lib/july-award-2026-clubs";
import {
  emptyJulyAwardNominationFields,
  type JulyAwardNominationFieldValues,
} from "@/lib/july-award-nomination-fields";
import {
  hasJulyAwardSupportingDocument,
  JULY_AWARD_SUPPORTING_DOCUMENTS_REQUIRED_MSG,
} from "@/lib/validations/july-award-nomination";
import { saveJulyAwardParticipationPrefill } from "@/lib/marketing/july-award-participation-prefill";
import {
  firstJulyAwardNominationErrorFieldId,
  JULY_AWARD_NOMINATION_FORM_ERROR_ID,
  scrollToJulyAwardNominationField,
} from "@/lib/marketing/july-award-nomination-form-scroll";
import {
  validateJulyAwardLogoFile,
  validateJulyAwardPdfFile,
} from "@/lib/marketing/july-award-nomination-upload";

const initial: JulyAwardNominationState = {};

const req = (
  <span className="text-[color:var(--color-error)]" aria-hidden>
    *
  </span>
);

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-small font-medium text-[color:var(--color-error)]" role="alert">
      {message}
    </p>
  );
}

function SelectedFileBadge({
  label,
  name,
  onClear,
}: {
  label: string;
  name: string;
  onClear: () => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-small">
      <span className="text-[color:var(--color-text-muted)]">{label}:</span>
      <span className="font-medium text-[color:var(--color-text)]">{name}</span>
      <button
        type="button"
        className="ml-auto font-semibold text-[color:var(--color-error)] hover:underline"
        onClick={onClear}
      >
        Remove
      </button>
    </div>
  );
}

type Props = { category: JulyAwardClubCategory };

export function JulyAwardNominationForm({ category }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    submitJulyAwardNomination.bind(null, category.key),
    initial
  );

  const [textFields, setTextFields] = useState<JulyAwardNominationFieldValues>(() =>
    emptyJulyAwardNominationFields()
  );
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [clearedStagedLogoKey, setClearedStagedLogoKey] = useState("");
  const [clearedStagedPdfKey, setClearedStagedPdfKey] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const scrollAfterSubmitRef = useRef(0);

  const patch = (key: keyof JulyAwardNominationFieldValues, value: string) => {
    setTextFields((p) => ({ ...p, [key]: value }));
  };

  const stagedLogoKey = state?.stagedUploads?.logoUrl ?? "";
  const stagedPdfKey = state?.stagedUploads?.supportingPdfUrl ?? "";
  const stagedLogoUrl =
    stagedLogoKey && clearedStagedLogoKey !== stagedLogoKey ? stagedLogoKey : "";
  const stagedPdfUrl = stagedPdfKey && clearedStagedPdfKey !== stagedPdfKey ? stagedPdfKey : "";
  const hasLogo = Boolean(logoFile || stagedLogoUrl);
  const hasSupportingDoc = hasJulyAwardSupportingDocument(
    textFields.supportingDriveLinks,
    Boolean(pdfFile || stagedPdfUrl)
  );
  const logoBlobPreview = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile]
  );
  const logoPreviewUrl = logoBlobPreview || stagedLogoUrl || null;

  useEffect(() => {
    if (!logoBlobPreview) return;
    return () => URL.revokeObjectURL(logoBlobPreview);
  }, [logoBlobPreview]);

  useEffect(() => {
    if (!state?.success || !state.participationPrefill) return;
    toast.success("Nomination submitted.");
    saveJulyAwardParticipationPrefill(state.participationPrefill);
    const { clubName, universityName } = state.participationPrefill;
    const q = new URLSearchParams({
      club: clubName,
      university: universityName,
      from: "registration",
    });
    router.push(`/july-award-2026/participation-card?${q.toString()}`);
  }, [state?.success, state?.participationPrefill, router]);

  useEffect(() => {
    if (state?.success) return;
    if (!state?.fieldValues) return;
    setTextFields((prev) => ({ ...prev, ...state.fieldValues }));
  }, [state?.fieldValues, state?.success]);

  useEffect(() => {
    if (pending || state?.success) return;
    const targetId = firstJulyAwardNominationErrorFieldId(
      state?.fieldErrors,
      Boolean(state?.error)
    );
    if (!targetId) return;
    const generation = scrollAfterSubmitRef.current;
    const timer = window.setTimeout(() => {
      if (generation !== scrollAfterSubmitRef.current) return;
      scrollToJulyAwardNominationField(targetId);
    }, 50);
    return () => window.clearTimeout(timer);
  }, [state?.fieldErrors, state?.error, state?.success, pending]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (logoFile) {
      const logoErr = validateJulyAwardLogoFile(logoFile);
      if (logoErr) {
        toast.error(logoErr);
        scrollToJulyAwardNominationField(
          logoErr.includes("PDF upload") ? "supportingPdf" : "clubLogoFile"
        );
        return;
      }
    }

    if (pdfFile) {
      const pdfErr = validateJulyAwardPdfFile(pdfFile);
      if (pdfErr) {
        toast.error(pdfErr);
        scrollToJulyAwardNominationField("supportingPdf");
        return;
      }
    }

    if (!hasJulyAwardSupportingDocument(textFields.supportingDriveLinks, Boolean(pdfFile || stagedPdfUrl))) {
      toast.error(JULY_AWARD_SUPPORTING_DOCUMENTS_REQUIRED_MSG);
      scrollToJulyAwardNominationField("supportingDriveLinks");
      return;
    }

    const fd = new FormData(e.currentTarget);
    if (logoFile) {
      fd.set("clubLogoFile", logoFile);
    } else {
      fd.delete("clubLogoFile");
    }
    if (pdfFile) {
      fd.set("supportingPdf", pdfFile);
    } else {
      fd.delete("supportingPdf");
    }
    if (stagedLogoUrl) {
      fd.set("stagedLogoUrl", stagedLogoUrl);
    } else {
      fd.delete("stagedLogoUrl");
    }
    if (stagedPdfUrl) {
      fd.set("stagedSupportingPdfUrl", stagedPdfUrl);
    } else {
      fd.delete("stagedSupportingPdfUrl");
    }
    scrollAfterSubmitRef.current += 1;
    startTransition(() => {
      formAction(fd);
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-6 [&_input]:scroll-mt-28 [&_select]:scroll-mt-28 [&_textarea]:scroll-mt-28"
      noValidate
    >
      {state?.error && (
        <div
          id={JULY_AWARD_NOMINATION_FORM_ERROR_ID}
          tabIndex={-1}
          className="scroll-mt-28 rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)] outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-error)]"
          role="alert"
        >
          {state.error}
        </div>
      )}
      {state?.success && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-success)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_10%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-success)]"
          role="status"
        >
          Thank you — your nomination was received. The committee will review it.
        </div>
      )}

      <div>
        <label htmlFor="clubName" className="ds-label">
          Club name {req}
        </label>
        <input
          id="clubName"
          name="clubName"
          required
          className="ds-input"
          autoComplete="organization"
          value={textFields.clubName}
          onChange={(e) => patch("clubName", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.clubName ? "clubName-err" : undefined}
        />
        <FieldError id="clubName-err" message={state?.fieldErrors?.clubName} />
      </div>

      <div>
        <label htmlFor="clubLogoFile" className="ds-label">
          Club logo {req}
        </label>
        <p className="mt-1 text-small text-[color:var(--color-text-muted)]">
          Square or horizontal logo works best. JPEG, PNG, WebP, or GIF — max 10 MB.
        </p>
        {logoPreviewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- blob/staged preview
          <img
            src={logoPreviewUrl}
            alt=""
            className="mt-2 h-20 w-20 rounded-[var(--radius-md)] border border-[color:var(--color-border)] object-contain bg-white"
          />
        ) : null}
        {logoFile ? (
          <SelectedFileBadge
            label="Selected logo"
            name={logoFile.name}
            onClear={() => {
              setLogoFile(null);
              if (logoInputRef.current) logoInputRef.current.value = "";
            }}
          />
        ) : stagedLogoUrl ? (
          <SelectedFileBadge
            label="Logo saved"
            name="Uploaded — kept from your last attempt"
            onClear={() => setClearedStagedLogoKey(stagedLogoKey)}
          />
        ) : null}
        <input
          ref={logoInputRef}
          id="clubLogoFile"
          type="file"
          className="mt-2 block w-full text-small text-[color:var(--color-text-muted)] file:mr-3 file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-surface-2)] file:px-3 file:py-2 file:font-semibold file:text-[color:var(--color-text)]"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={state?.success}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (file) {
              const err = validateJulyAwardLogoFile(file);
              if (err) {
                toast.error(err);
                e.target.value = "";
                setLogoFile(null);
                if (err.includes("PDF upload")) {
                  scrollToJulyAwardNominationField("supportingPdf");
                }
                return;
              }
            }
            setLogoFile(file);
            if (file) setClearedStagedLogoKey(stagedLogoKey);
          }}
          aria-describedby={
            state?.fieldErrors?.clubLogoFile ? "clubLogoFile-err clubLogoFile-hint" : "clubLogoFile-hint"
          }
        />
        <p id="clubLogoFile-hint" className="sr-only">
          Required image file for club logo.
        </p>
        <FieldError id="clubLogoFile-err" message={state?.fieldErrors?.clubLogoFile} />
      </div>

      <div>
        <label htmlFor="universityName" className="ds-label">
          University name {req}
        </label>
        <input
          id="universityName"
          name="universityName"
          required
          className="ds-input"
          autoComplete="organization"
          value={textFields.universityName}
          onChange={(e) => patch("universityName", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.universityName ? "universityName-err" : undefined}
        />
        <FieldError id="universityName-err" message={state?.fieldErrors?.universityName} />
      </div>

      <div>
        <label htmlFor="clubSocialLink" className="ds-label">
          Club social network link {req}
        </label>
        <input
          id="clubSocialLink"
          name="clubSocialLink"
          type="url"
          required
          placeholder="https://"
          className="ds-input"
          value={textFields.clubSocialLink}
          onChange={(e) => patch("clubSocialLink", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.clubSocialLink ? "clubSocialLink-err" : undefined}
        />
        <FieldError id="clubSocialLink-err" message={state?.fieldErrors?.clubSocialLink} />
      </div>

      <div>
        <label htmlFor="yearEstablished" className="ds-label">
          Year established
        </label>
        <input
          id="yearEstablished"
          name="yearEstablished"
          className="ds-input"
          inputMode="numeric"
          value={textFields.yearEstablished}
          onChange={(e) => patch("yearEstablished", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.yearEstablished ? "yearEstablished-err" : undefined}
        />
        <FieldError id="yearEstablished-err" message={state?.fieldErrors?.yearEstablished} />
      </div>

      <div>
        <label htmlFor="communicationEmail" className="ds-label">
          Email for communication {req}
        </label>
        <input
          id="communicationEmail"
          name="communicationEmail"
          type="email"
          required
          className="ds-input"
          autoComplete="email"
          value={textFields.communicationEmail}
          onChange={(e) => patch("communicationEmail", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.communicationEmail ? "communicationEmail-err" : undefined}
        />
        <FieldError id="communicationEmail-err" message={state?.fieldErrors?.communicationEmail} />
      </div>

      <div>
        <label htmlFor="mobileNumber" className="ds-label">
          Mobile number {req}
        </label>
        <input
          id="mobileNumber"
          name="mobileNumber"
          type="tel"
          required
          className="ds-input"
          autoComplete="tel"
          placeholder="+880 …"
          value={textFields.mobileNumber}
          onChange={(e) => patch("mobileNumber", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.mobileNumber ? "mobileNumber-err" : undefined}
        />
        <FieldError id="mobileNumber-err" message={state?.fieldErrors?.mobileNumber} />
      </div>

      <div>
        <label htmlFor="activeMembersApprox" className="ds-label">
          Approximate number of active members
        </label>
        <input
          id="activeMembersApprox"
          name="activeMembersApprox"
          className="ds-input"
          inputMode="numeric"
          value={textFields.activeMembersApprox}
          onChange={(e) => patch("activeMembersApprox", e.target.value)}
          disabled={state?.success}
          aria-describedby={
            state?.fieldErrors?.activeMembersApprox ? "activeMembersApprox-err" : undefined
          }
        />
        <FieldError id="activeMembersApprox-err" message={state?.fieldErrors?.activeMembersApprox} />
      </div>

      <div>
        <label htmlFor="eventsLast12Months" className="ds-label">
          Number of events organized in the last 12 months {req}
        </label>
        <input
          id="eventsLast12Months"
          name="eventsLast12Months"
          required
          className="ds-input"
          inputMode="numeric"
          value={textFields.eventsLast12Months}
          onChange={(e) => patch("eventsLast12Months", e.target.value)}
          disabled={state?.success}
          aria-describedby={
            state?.fieldErrors?.eventsLast12Months ? "eventsLast12Months-err" : undefined
          }
        />
        <FieldError id="eventsLast12Months-err" message={state?.fieldErrors?.eventsLast12Months} />
      </div>

      <div>
        <label htmlFor="presidentName" className="ds-label">
          Current president name
        </label>
        <input
          id="presidentName"
          name="presidentName"
          className="ds-input"
          autoComplete="name"
          value={textFields.presidentName}
          onChange={(e) => patch("presidentName", e.target.value)}
          disabled={state?.success}
          aria-describedby={state?.fieldErrors?.presidentName ? "presidentName-err" : undefined}
        />
        <FieldError id="presidentName-err" message={state?.fieldErrors?.presidentName} />
      </div>

      <fieldset className="space-y-4 border-0 p-0">
        <legend className="ds-label mb-0">Faculty contact {req}</legend>
        <p className="mb-1 text-small leading-relaxed text-[color:var(--color-text-muted)]">
          Provide <strong className="font-semibold text-[color:var(--color-text)]">one</strong> contact only. Choose
          whether they are the <strong className="font-semibold text-[color:var(--color-text)]">teacher</strong>,{" "}
          <strong className="font-semibold text-[color:var(--color-text)]">convener</strong>, or{" "}
          <strong className="font-semibold text-[color:var(--color-text)]">advisor</strong> from the list, then enter
          their <strong className="font-semibold text-[color:var(--color-text)]">full name</strong> and{" "}
          <strong className="font-semibold text-[color:var(--color-text)]">mobile number</strong> below.
        </p>

        <div>
          <label htmlFor="facultyRole" className="text-small font-semibold text-[color:var(--color-text)]">
            Role {req}
          </label>
          <select
            id="facultyRole"
            name="facultyRole"
            required
            className="ds-input mt-1"
            value={textFields.facultyRole}
            onChange={(e) => patch("facultyRole", e.target.value)}
            disabled={state?.success}
            aria-describedby={state?.fieldErrors?.facultyRole ? "facultyRole-err" : undefined}
          >
            <option value="" disabled>
              Select one…
            </option>
            <option value="teacher">Teacher</option>
            <option value="convener">Convener</option>
            <option value="advisor">Advisor</option>
          </select>
          <FieldError id="facultyRole-err" message={state?.fieldErrors?.facultyRole} />
        </div>

        <div>
          <label htmlFor="facultyContactName" className="text-small font-semibold text-[color:var(--color-text)]">
            Full name {req}
          </label>
          <input
            id="facultyContactName"
            name="facultyContactName"
            required
            className="ds-input mt-1"
            autoComplete="name"
            value={textFields.facultyContactName}
            onChange={(e) => patch("facultyContactName", e.target.value)}
            disabled={state?.success}
            aria-describedby={state?.fieldErrors?.facultyContactName ? "facultyContactName-err" : undefined}
          />
          <FieldError id="facultyContactName-err" message={state?.fieldErrors?.facultyContactName} />
        </div>

        <div>
          <label htmlFor="facultyContactMobile" className="text-small font-semibold text-[color:var(--color-text)]">
            Mobile number {req}
          </label>
          <input
            id="facultyContactMobile"
            name="facultyContactMobile"
            type="tel"
            required
            className="ds-input mt-1"
            autoComplete="tel"
            placeholder="+880 …"
            value={textFields.facultyContactMobile}
            onChange={(e) => patch("facultyContactMobile", e.target.value)}
            disabled={state?.success}
            aria-describedby={
              state?.fieldErrors?.facultyContactMobile ? "facultyContactMobile-err" : undefined
            }
          />
          <FieldError id="facultyContactMobile-err" message={state?.fieldErrors?.facultyContactMobile} />
        </div>
      </fieldset>

      <fieldset className="space-y-6 border-0 p-0">
        <legend className="ds-label mb-0">
          Supporting documents {req}
        </legend>
        <p className="text-small text-[color:var(--color-text-muted)]">
          <strong className="font-semibold text-[color:var(--color-text)]">Required:</strong> provide{" "}
          <strong className="font-semibold text-[color:var(--color-text)]">Google Drive / Docs link(s)</strong>, a{" "}
          <strong className="font-semibold text-[color:var(--color-text)]">PDF upload</strong>, or both.
        </p>
        <div>
        <label htmlFor="supportingDriveLinks" className="text-small font-semibold text-[color:var(--color-text)]">
          Google Drive / Docs links
        </label>
        <p className="mt-2 rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-3 text-small leading-relaxed text-[color:var(--color-text-muted)]">
          <span className="font-semibold text-[color:var(--color-text)]">What to share:</span> Offer a vivid picture of
          your club — highlight initiatives, impact, and milestones — and make a concise case for why your work stands
          out for this award. Linked folders or decks may use any format you prefer.
        </p>
        <p className="mt-2 text-small text-[color:var(--color-text-muted)]">
          Paste one or more <strong className="font-semibold text-[color:var(--color-text)]">Google Drive or Google Docs</strong>{" "}
          sharing links (one per line or separated by commas).
        </p>
        <textarea
          id="supportingDriveLinks"
          name="supportingDriveLinks"
          rows={4}
          className="ds-textarea mt-2"
          placeholder="https://drive.google.com/…"
          value={textFields.supportingDriveLinks}
          onChange={(e) => patch("supportingDriveLinks", e.target.value)}
          disabled={state?.success}
          aria-describedby={
            state?.fieldErrors?.supportingDriveLinks ? "supportingDriveLinks-err" : undefined
          }
        />
        <FieldError id="supportingDriveLinks-err" message={state?.fieldErrors?.supportingDriveLinks} />
      </div>
      <div>
        <label htmlFor="supportingPdf" className="text-small font-semibold text-[color:var(--color-text)]">
          PDF upload
        </label>
        <p className="mt-1 text-small text-[color:var(--color-text-muted)]">
          PDF only, max 5 MB. Required if you do not add Drive link(s) above.
        </p>
        {pdfFile ? (
          <SelectedFileBadge
            label="Selected PDF"
            name={pdfFile.name}
            onClear={() => {
              setPdfFile(null);
              if (pdfInputRef.current) pdfInputRef.current.value = "";
            }}
          />
        ) : stagedPdfUrl ? (
          <SelectedFileBadge
            label="PDF saved"
            name="Uploaded — kept from your last attempt"
            onClear={() => setClearedStagedPdfKey(stagedPdfKey)}
          />
        ) : null}
        <input
          ref={pdfInputRef}
          id="supportingPdf"
          type="file"
          className="mt-2 block w-full text-small text-[color:var(--color-text-muted)] file:mr-3 file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-surface-2)] file:px-3 file:py-2 file:font-semibold file:text-[color:var(--color-text)]"
          accept="application/pdf"
          disabled={state?.success}
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            if (file) {
              const err = validateJulyAwardPdfFile(file);
              if (err) {
                toast.error(err);
                e.target.value = "";
                setPdfFile(null);
                return;
              }
            }
            setPdfFile(file);
            if (file) setClearedStagedPdfKey(stagedPdfKey);
          }}
          aria-describedby={
            state?.fieldErrors?.supportingPdf ? "supportingPdf-err" : undefined
          }
        />
        <FieldError id="supportingPdf-err" message={state?.fieldErrors?.supportingPdf} />
      </div>
      </fieldset>

      <Button
        type="submit"
        variant="primary"
        loading={pending}
        className="w-full sm:w-auto"
        disabled={state?.success || !hasLogo || !hasSupportingDoc}
      >
        {pending ? "Submitting…" : "Submit nomination"}
      </Button>
    </form>
  );
}
