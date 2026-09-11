"use client";

import { useActionState } from "react";
import { signUp, type AuthActionState } from "@/actions/auth";
import { Button } from "@/components/ui/Button";

const initial: AuthActionState = {};

type UniversityOption = {
  id: string;
  name: string;
};

export function SignupForm({ universities }: { universities: UniversityOption[] }) {
  const [state, formAction, pending] = useActionState(signUp, initial);

  return (
    <form action={formAction} className="space-y-5" encType="multipart/form-data">
      {state?.error && (
        <div
          className="rounded-[var(--radius-md)] border border-[color:color-mix(in_srgb,var(--color-error)_35%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-error)_8%,var(--color-surface))] px-3 py-2 text-small text-[color:var(--color-error)]"
          role="alert"
        >
          {state.error}
        </div>
      )}
      <div>
        <label htmlFor="fullName" className="ds-label">
          Full name
        </label>
        <input id="fullName" name="fullName" type="text" autoComplete="name" required minLength={2} className="ds-input" />
      </div>
      <div>
        <label htmlFor="email" className="ds-label">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="email" required className="ds-input" />
      </div>
      <div>
        <label htmlFor="phone" className="ds-label">
          Phone
        </label>
        <input id="phone" name="phone" type="tel" required className="ds-input" />
      </div>
      <div>
        <label htmlFor="universityId" className="ds-label">
          University
        </label>
        <select id="universityId" name="universityId" required defaultValue="" className="ds-select">
          <option value="" disabled>
            Select a university
          </option>
          {universities.map((uni) => (
            <option key={uni.id} value={uni.id}>
              {uni.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="department" className="ds-label">
          Department
        </label>
        <input id="department" name="department" type="text" required className="ds-input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="studentId" className="ds-label">
            Student ID
          </label>
          <input id="studentId" name="studentId" type="text" required className="ds-input" />
        </div>
        <div>
          <label htmlFor="session" className="ds-label">
            Session
          </label>
          <input id="session" name="session" type="text" required placeholder="e.g. 2023-24" className="ds-input" />
        </div>
      </div>
      <div>
        <label htmlFor="district" className="ds-label">
          District
        </label>
        <input id="district" name="district" type="text" required className="ds-input" />
      </div>
      <div>
        <label htmlFor="photo" className="ds-label">
          Photo (optional)
        </label>
        <input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="ds-input" />
        <p className="ds-helper">Used on your member profile. You can also add or change it later.</p>
      </div>
      <p className="ds-helper">
        No password needed here. Once the secretariat approves your application, we&apos;ll email you a
        temporary login password.
      </p>
      <Button type="submit" variant="primary" className="w-full" loading={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
