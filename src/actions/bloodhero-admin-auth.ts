"use server";

import {
  canAccessBloodHeroAdmin,
  safeBloodHeroAdminRedirectTarget,
} from "@/lib/bloodhero/is-bloodhero-admin";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type BloodHeroAdminAuthState = {
  error?: string;
};

export async function bloodHeroAdminSignIn(
  _prev: BloodHeroAdminAuthState,
  formData: FormData
): Promise<BloodHeroAdminAuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    return {
      error: f.email?.[0] ?? f.password?.[0] ?? parsed.error.message,
    };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  const userId = authData.user?.id;
  if (!userId) {
    return { error: "Sign-in succeeded but no user id was returned. Try again." };
  }

  const allowed = await canAccessBloodHeroAdmin(supabase);
  if (!allowed) {
    await supabase.auth.signOut();
    return {
      error:
        "This account is not authorized for BloodHero administration. If you need access, contact a project owner.",
    };
  }

  revalidatePath("/", "layout");
  redirect(safeBloodHeroAdminRedirectTarget(formData.get("redirect")));
}

export async function bloodHeroAdminSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/bloodhero/admin/login");
}
