"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  submitJulyParticipantRegistration,
  type JulyParticipantRegistrationState,
} from "@/actions/july-participant-registration";
import { Button } from "@/components/ui/Button";
import {
  emptyJulyParticipantFields,
  type JulyParticipantFieldValues,
} from "@/lib/july-participant-fields";

const initial: JulyParticipantRegistrationState = {};

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

type ClubOption = { clubName: string; universityName: string };

export function JulyParticipantRegistrationForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitJulyParticipantRegistration, initial);
  const [textFields, setTextFields] = useState<JulyParticipantFieldValues>(() => emptyJulyParticipantFields());
  const [clubs, setClubs] = useState<ClubOption[]>([]);
  const [withClub, setWithClub] = useState<"" | "yes" | "no">("no");
  const [donatesBlood, setDonatesBlood] = useState<"" | "yes" | "no">("");

  const patch = (key: keyof JulyParticipantFieldValues, value: string) => {
    setTextFields((p) => ({ ...p, [key]: value }));
  };

  useEffect(() => {
    fetch("/api/july-award/clubs")
      .then((r) => r.json())
      .then((d: { clubs?: ClubOption[] }) => setClubs(d.clubs ?? []))
      .catch(() => setClubs([]));
  }, []);

  const sortedClubs = [...clubs].sort((a, b) => a.clubName.localeCompare(b.clubName));

  useEffect(() => {
    if (!state?.duplicateEmail) return;
    router.push("/july-award-2026/participants/register?alreadyRegistered=1");
  }, [state?.duplicateEmail, router]);

  useEffect(() => {
    if (!state?.success) return;
    toast.success("Registration received. Your ticket has been sent to your email.");
    const url = state.photoUrl
      ? `/july-award-2026/facecard?photo=${encodeURIComponent(state.photoUrl)}`
      : "/july-award-2026/facecard";
    const t = setTimeout(() => router.push(url), 3000);
    return () => clearTimeout(t);
  }, [state?.success, state?.photoUrl, router]);

  useEffect(() => {
    if (state?.success) return;
    if (!state?.fieldValues) return;
    setTextFields((prev) => ({ ...prev, ...state.fieldValues }));
  }, [state?.fieldValues, state?.success]);

  return (
    <form action={formAction} className="mx-auto max-w-2xl space-y-6">
      {state?.success ? (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-success)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_10%,var(--color-surface))] px-4 py-4 text-[color:var(--color-text)]"
          role="status"
        >
          <p className="text-base font-semibold text-[color:var(--color-success)]">You&apos;re registered.</p>
          <p className="mt-2 text-small leading-relaxed text-(--color-text-muted)">
            Your ticket with QR code has been sent to your email. Redirecting you to your photocard…
          </p>
        </div>
      ) : state?.duplicateEmail ? (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-4 py-4 text-(--color-text)"
          role="alert"
        >
          <p className="text-base font-semibold text-(--color-error)">Already registered.</p>
          <p className="mt-2 text-small leading-relaxed text-(--color-text-muted)">
            This email address has already been registered. If you believe this is an error, please contact us.
          </p>
        </div>
      ) : (
        <div
          className="rounded-[var(--radius-md)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-small leading-relaxed text-[color:var(--color-text-muted)]"
          role="note"
        >
          <strong className="font-semibold text-[color:var(--color-text)]">Note:</strong> register here to confirm
          your seat at the July Uprising Memorial Award programme.
        </div>
      )}

      {state?.error && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)]"
          role="alert"
        >
          {state.error}
        </div>
      )}

      {!state?.success && (
        <>
          <div>
            <div className="flex items-start gap-3">
              <input
                id="martyrsPledge"
                name="martyrsPledge"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 shrink-0"
                aria-describedby={state?.fieldErrors?.martyrsPledge ? "martyrsPledge-err" : undefined}
              />
              <label htmlFor="martyrsPledge" className="ds-label mb-0!">
                I deeply respect the martyrs and injured heroes of July 2024. {req}
              </label>
            </div>
            <FieldError id="martyrsPledge-err" message={state?.fieldErrors?.martyrsPledge} />
          </div>

          <div>
            <label htmlFor="fullName" className="ds-label">
              Full name {req}
            </label>
            <input
              id="fullName"
              name="fullName"
              required
              className="ds-input"
              autoComplete="name"
              value={textFields.fullName}
              onChange={(e) => patch("fullName", e.target.value)}
              aria-describedby={state?.fieldErrors?.fullName ? "fullName-err" : undefined}
            />
            <FieldError id="fullName-err" message={state?.fieldErrors?.fullName} />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="ds-label">
              Phone number {req}
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              className="ds-input"
              autoComplete="tel"
              value={textFields.phoneNumber}
              onChange={(e) => patch("phoneNumber", e.target.value)}
              aria-describedby={state?.fieldErrors?.phoneNumber ? "phoneNumber-err" : undefined}
            />
            <FieldError id="phoneNumber-err" message={state?.fieldErrors?.phoneNumber} />
          </div>

          <div>
            <label htmlFor="email" className="ds-label">
              Email {req}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="ds-input"
              autoComplete="email"
              value={textFields.email}
              onChange={(e) => patch("email", e.target.value)}
              aria-describedby={state?.fieldErrors?.email ? "email-err" : undefined}
            />
            <FieldError id="email-err" message={state?.fieldErrors?.email} />
          </div>

          <div>
            <label htmlFor="universityName" className="ds-label">
              University {req}
            </label>
            <input
              id="universityName"
              name="universityName"
              required
              className="ds-input"
              autoComplete="organization"
              value={textFields.universityName}
              onChange={(e) => patch("universityName", e.target.value)}
              aria-describedby={state?.fieldErrors?.universityName ? "universityName-err" : undefined}
            />
            <FieldError id="universityName-err" message={state?.fieldErrors?.universityName} />
          </div>

          <div>
            <p className="ds-label mb-2">Are you part of a club? {req}</p>
            <div className="flex gap-4">
              {(["no", "yes"] as const).map((v) => (
                <label key={v} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="withClub"
                    value={v}
                    checked={withClub === v}
                    onChange={() => {
                      setWithClub(v);
                      if (v === "no") patch("clubName", "");
                    }}
                    className="accent-(--color-brand)"
                  />
                  {v === "yes" ? "Yes" : "No"}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-(--color-text-muted)">
              If you are registering as part of a club, select <strong>Yes</strong>. Otherwise, leave it as <strong>No</strong>.
            </p>
          </div>

          {withClub === "yes" && (
            <div>
              <label htmlFor="clubSelect" className="ds-label">
                Club {req}
              </label>
              <input type="hidden" name="clubMode" value="select" />
              <select
                id="clubSelect"
                className="ds-input"
                value={textFields.clubName}
                onChange={(e) => patch("clubName", e.target.value)}
              >
                <option value="">Select your club…</option>
                {sortedClubs.map((c, i) => (
                  <option key={`${c.clubName}-${c.universityName}-${i}`} value={c.clubName}>
                    {c.clubName} ({c.universityName})
                  </option>
                ))}
              </select>
              <input type="hidden" name="clubName" value={textFields.clubName} />
              <FieldError id="clubName-err" message={state?.fieldErrors?.clubName} />
            </div>
          )}

          <div>
            <label htmlFor="departmentOrRole" className="ds-label">
              Department / role {req}
            </label>
            <input
              id="departmentOrRole"
              name="departmentOrRole"
              required
              className="ds-input"
              value={textFields.departmentOrRole}
              onChange={(e) => patch("departmentOrRole", e.target.value)}
              aria-describedby={state?.fieldErrors?.departmentOrRole ? "departmentOrRole-err" : undefined}
            />
            <FieldError id="departmentOrRole-err" message={state?.fieldErrors?.departmentOrRole} />
          </div>

          <div>
            <label className="ds-label">
              Do you donate blood? {req}
            </label>
            <p className="mb-1.5 text-small text-[color:var(--color-text-muted)]">
              If yes, please write down your blood group for our future reference. If not, you may leave this field
              blank.
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-small">
                <input
                  type="radio"
                  name="donatesBlood"
                  value="yes"
                  checked={donatesBlood === "yes"}
                  onChange={() => setDonatesBlood("yes")}
                  required
                />
                Yes
              </label>
              <label className="flex items-center gap-1.5 text-small">
                <input
                  type="radio"
                  name="donatesBlood"
                  value="no"
                  checked={donatesBlood === "no"}
                  onChange={() => setDonatesBlood("no")}
                />
                No
              </label>
            </div>
            <FieldError id="donatesBlood-err" message={state?.fieldErrors?.donatesBlood} />
            {donatesBlood === "yes" && (
              <div className="mt-2">
                <label htmlFor="bloodGroup" className="ds-label">
                  Blood group {req}
                </label>
                <input
                  id="bloodGroup"
                  name="bloodGroup"
                  className="ds-input"
                  placeholder="e.g. B+"
                  value={textFields.bloodGroup}
                  onChange={(e) => patch("bloodGroup", e.target.value)}
                  aria-describedby={state?.fieldErrors?.bloodGroup ? "bloodGroup-err" : undefined}
                />
                <FieldError id="bloodGroup-err" message={state?.fieldErrors?.bloodGroup} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-start gap-3">
              <input
                id="attendanceConfirm"
                name="attendanceConfirm"
                type="checkbox"
                required
                className="mt-1 h-4 w-4 shrink-0"
                aria-describedby={state?.fieldErrors?.attendanceConfirm ? "attendanceConfirm-err" : undefined}
              />
              <label htmlFor="attendanceConfirm" className="ds-label mb-0!">
                I hereby confirm that I am able to attend the program and will be present on time. If I am unable to
                attend, I will email PUNAB at least 3 days before the program so that my name can be removed from the
                list. {req}
              </label>
            </div>
            <FieldError id="attendanceConfirm-err" message={state?.fieldErrors?.attendanceConfirm} />
          </div>

          <div>
            <label htmlFor="photo" className="ds-label">
              Photo {req}
            </label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              required
              className="block w-full text-small text-[color:var(--color-text-muted)] file:mr-3 file:rounded-[var(--radius-md)] file:border-0 file:bg-[color:var(--color-surface-2)] file:px-3 file:py-2 file:font-semibold file:text-[color:var(--color-text)]"
              aria-describedby={state?.fieldErrors?.photo ? "photo-err" : undefined}
            />
            <p className="mt-1.5 text-small text-[color:var(--color-text-muted)]">
              Upload your photo for the photocard, then put it up on your socials. JPEG, PNG, WebP, or GIF — up to 10 MB.
            </p>
            <FieldError id="photo-err" message={state?.fieldErrors?.photo} />
          </div>

          <Button type="submit" variant="primary" loading={pending} className="w-full sm:w-auto">
            {pending ? "Submitting…" : "Submit registration"}
          </Button>
        </>
      )}

      <p className="text-center text-small text-[color:var(--color-text-muted)]">
        <Link href="/july-award-2026" className="font-semibold text-[color:var(--color-brand)] underline-offset-2 hover:underline">
          Back to July Award 2026
        </Link>
      </p>
    </form>
  );
}
