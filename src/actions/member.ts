"use server";

import { createClient } from "@/lib/supabase/server";
import { updateMemberApplication, updateProfilePhotoUrl } from "@/lib/repositories/profiles-repository";
import { applicationSchema } from "@/lib/validations/member";
import { revalidatePath } from "next/cache";

export type MemberActionState = {
  error?: string;
  success?: boolean;
};

export async function updateApplication(
  _prev: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in." };
  }

  const uni = formData.get("universityId")?.toString() ?? "";
  const parsed = applicationSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    universityId: uni || undefined,
    universityOther: formData.get("universityOther")?.toString() || undefined,
    department: formData.get("department"),
    studentId: formData.get("studentId"),
    session: formData.get("session"),
    district: formData.get("district"),
  });

  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    const msg =
      f.fullName?.[0] ??
      f.phone?.[0] ??
      f.department?.[0] ??
      f.studentId?.[0] ??
      f.session?.[0] ??
      f.district?.[0] ??
      parsed.error.message;
    return { error: msg };
  }

  const uid =
    parsed.data.universityId &&
    /^[0-9a-f-]{36}$/i.test(parsed.data.universityId)
      ? parsed.data.universityId
      : null;

  try {
    await updateMemberApplication(user.id, {
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      university_id: uid,
      university_other: parsed.data.universityOther || null,
      department: parsed.data.department,
      student_id: parsed.data.studentId,
      session: parsed.data.session,
      district: parsed.data.district,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Update failed" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/join");
  revalidatePath("/dashboard/profile");
  return { success: true };
}

export async function updatePhotoUrl(photoUrl: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in." };
  }

  try {
    await updateProfilePhotoUrl(user.id, photoUrl);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Update failed" };
  }

  revalidatePath("/dashboard/profile");
  return { success: true };
}
