"use client";

import { useActionState } from "react";
import { updateApplication, type MemberActionState } from "@/actions/member";
import type { Profile } from "@/types/database";

type Uni = { id: string; name: string };

const initial: MemberActionState = {};

type Props = {
  profile: Profile;
  universities: Uni[];
};

export function ApplicationForm({ profile, universities }: Props) {
  const [state, formAction, pending] = useActionState(updateApplication, initial);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg border border-brand-green/30 bg-brand-green-muted px-3 py-2 text-sm text-brand-green dark:bg-brand-green-muted/20">
          Application saved successfully.
        </div>
      )}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          defaultValue={profile.full_name}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          defaultValue={profile.phone ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label htmlFor="universityId" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          University
        </label>
        <select
          id="universityId"
          name="universityId"
          defaultValue={profile.university_id ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        >
          <option value="">Select…</option>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="universityOther" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Other university (if not listed)
        </label>
        <input
          id="universityOther"
          name="universityOther"
          type="text"
          defaultValue={profile.university_other ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div>
        <label htmlFor="department" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          Department
        </label>
        <input
          id="department"
          name="department"
          type="text"
          required
          defaultValue={profile.department ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="studentId" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Student ID
          </label>
          <input
            id="studentId"
            name="studentId"
            type="text"
            required
            defaultValue={profile.student_id ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
          />
        </div>
        <div>
          <label htmlFor="session" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
            Session
          </label>
          <input
            id="session"
            name="session"
            type="text"
            required
            placeholder="e.g. 2023–24"
            defaultValue={profile.session ?? ""}
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
          />
        </div>
      </div>
      <div>
        <label htmlFor="district" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
          District
        </label>
        <input
          id="district"
          name="district"
          type="text"
          required
          defaultValue={profile.district ?? ""}
          className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 dark:border-stone-600 dark:bg-stone-900"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-red px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-red/90 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save application"}
      </button>
    </form>
  );
}
