"use server";

import { defaultAdminHome, resolveAdminAccess } from "@/lib/auth/admin-access";
import { generateUnusablePassword } from "@/lib/auth/temp-password";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";
import {
  upsertProfileAfterSignup,
  completeFirstLoginPasswordChange as repoCompleteFirstLoginPasswordChange,
} from "@/lib/repositories/profiles-repository";
import { firstLoginPasswordSchema, loginSchema, signupSchema } from "@/lib/validations/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type AuthActionState = {
  error?: string;
  success?: boolean;
};

export async function signIn(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      error:
        f.email?.[0] ?? f.password?.[0] ?? parsed.error.message,
    };
  }

  const supabase = await createClient();
  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  const signedInUser = signInData.user;
  if (!signedInUser) {
    return { error: "Sign in succeeded but no user was returned. Please try again." };
  }

  revalidatePath("/", "layout");

  const rawRedirect = formData.get("redirect")?.toString().trim() || "/dashboard";
  const requested = rawRedirect.replace(/\/+$/, "") || "/dashboard";
  let destination = requested;

  // AUTH-003: temporary password is single-use and time-boxed; force the change screen before anything else.
  const authRow = await prisma.profile.findUnique({
    where: { id: signedInUser.id },
    select: { role: true, admin_scopes: true, first_login_required: true, temp_password_expires_at: true },
  });
  if (authRow?.first_login_required) {
    if (authRow.temp_password_expires_at && authRow.temp_password_expires_at.getTime() < Date.now()) {
      await supabase.auth.signOut();
      return {
        error: "Your temporary password has expired. Contact PUNAB administration to reissue your account.",
      };
    }
    redirect("/auth/change-password");
  }

  const defaultMemberLanding = requested === "/dashboard" || requested === "";
  if (defaultMemberLanding) {
    try {
      const row = authRow;
      if (row?.role?.toLowerCase() === "admin") {
        const access = resolveAdminAccess({
          role: "admin",
          admin_scopes: (row.admin_scopes ?? []).filter(
            (s): s is "invitations" | "certificates" | "july_award_cards" =>
              s === "invitations" || s === "certificates" || s === "july_award_cards",
          ),
        });
        destination = access.isFullAdmin ? "/admin" : defaultAdminHome(access);
      }
    } catch {
      /* keep requested path if Prisma unavailable */
    }
  }

  redirect(destination);
}

/**
 * Public membership application (AUTH-001 flow). No password is collected here — the account
 * is provisioned with a temporary password only after an admin approves the application.
 */
export async function signUp(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    universityId: formData.get("universityId"),
    department: formData.get("department"),
    studentId: formData.get("studentId"),
    session: formData.get("session"),
    district: formData.get("district"),
  });
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      first.fullName?.[0] ??
      first.email?.[0] ??
      first.phone?.[0] ??
      first.universityId?.[0] ??
      first.department?.[0] ??
      first.studentId?.[0] ??
      first.session?.[0] ??
      first.district?.[0] ??
      parsed.error.message;
    return { error: msg };
  }

  const serviceRole = createServiceRoleSupabase();
  const { data: created, error } = await serviceRole.auth.admin.createUser({
    email: parsed.data.email,
    password: generateUnusablePassword(),
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName },
  });

  if (error) {
    return { error: error.message };
  }

  const userId = created.user?.id;
  if (!userId) {
    return { error: "Application could not be submitted. Please try again." };
  }

  try {
    await upsertProfileAfterSignup({
      id: userId,
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      university_id: parsed.data.universityId,
      department: parsed.data.department,
      student_id: parsed.data.studentId,
      session: parsed.data.session,
      district: parsed.data.district,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not save profile" };
  }

  redirect("/register/submitted");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

/** AUTH-003: forced password change after first login with a temporary password. */
export async function completeFirstLoginPasswordChange(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = firstLoginPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return { error: f.password?.[0] ?? f.confirmPassword?.[0] ?? parsed.error.message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Session expired. Please log in again." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: error.message };
  }

  await repoCompleteFirstLoginPasswordChange(user.id);

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
