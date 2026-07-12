"use client";

import { useActionState } from "react";
import { setAdminPasswordByEmailAction, type AdminAccessActionState } from "@/actions/admin-access";
import { EditableGeneratedPasswordField } from "@/components/admin/EditableGeneratedPasswordField";

type Props = {
  email: string;
};

const initial: AdminAccessActionState = {};

export function AdminPasswordResetForm({ email }: Props) {
  const [state, formAction, pending] = useActionState(setAdminPasswordByEmailAction, initial);

  return (
    <form action={formAction} className="flex w-full min-w-[280px] flex-col gap-2">
      <input type="hidden" name="email" value={email} />
      {state.error && (
        <p className="text-xs text-red-700 dark:text-red-300">{state.error}</p>
      )}
      {state.success && (
        <p className="text-xs text-green-700 dark:text-green-300">Password updated.</p>
      )}
      <EditableGeneratedPasswordField
        label={`Password for ${email}`}
        instanceKey={email}
        className="text-xs"
        inputClassName="w-full rounded-md border border-stone-300 bg-white px-2 py-1 font-mono text-xs dark:border-stone-600 dark:bg-stone-900"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md border border-stone-300 px-2 py-1 text-xs dark:border-stone-600"
      >
        {pending ? "Saving…" : "Set password"}
      </button>
    </form>
  );
}
