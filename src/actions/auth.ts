"use server";

import { defaultAdminHome, resolveAdminAccess } from "@/lib/auth/admin-access";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { upsertProfileAfterSignup } from "@/lib/repositories/profiles-repository";
import { loginSchema, signupSchema } from "@/lib/validations/auth";
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

  const defaultMemberLanding = requested === "/dashboard" || requested === "";
  if (defaultMemberLanding) {
    try {
      const row = await prisma.profile.findUnique({
        where: { id: signedInUser.id },
        select: { role: true, admin_scopes: true },
      });
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

export async function signUp(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
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
      first.password?.[0] ??
      first.phone?.[0] ??
      first.universityId?.[0] ??
      first.department?.[0] ??
      first.studentId?.[0] ??
      first.session?.[0] ??
      first.district?.[0] ??
      parsed.error.message;
    return { error: msg };
  }

  const supabase = await createClient();
  const { data: signupData, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  const userId = signupData.user?.id;
  if (!userId) {
    return { error: "Account created but user was not returned. Please log in and complete your profile." };
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

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (signInError) {
    return { error: signInError.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
