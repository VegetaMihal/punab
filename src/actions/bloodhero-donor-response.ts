"use server";

import { redirect } from "next/navigation";
import { verifyBloodHeroResponseToken } from "@/lib/bloodhero/response-token";
import { createServiceRoleSupabase } from "@/lib/supabase/service-role";

type RpcApplyResult = {
  error?: string;
  ok?: boolean;
};

export async function confirmBloodHeroDonorResponse(formData: FormData) {
  const token = formData.get("token")?.toString() ?? "";
  const verified = verifyBloodHeroResponseToken(token);

  if (!verified.ok) {
    const q =
      verified.reason === "expired"
        ? "expired"
        : verified.reason === "bad_signature" || verified.reason === "invalid_format"
          ? "invalid"
          : verified.reason === "config"
            ? "config"
            : "invalid";
    redirect(`/bloodhero/respond/error?reason=${encodeURIComponent(q)}`);
  }

  let supabase;
  try {
    supabase = createServiceRoleSupabase();
  } catch {
    redirect("/bloodhero/respond/error?reason=config");
  }

  const { data, error } = await supabase.rpc("bloodhero_apply_donor_response", {
    p_notification_id: verified.notificationId,
    p_action: verified.action,
  });

  if (error) {
    redirect(`/bloodhero/respond/error?reason=server&detail=${encodeURIComponent(error.message)}`);
  }

  const payload = data as RpcApplyResult | null;
  if (payload?.error === "not_pending_or_missing") {
    redirect("/bloodhero/respond/error?reason=used");
  }
  if (payload?.error) {
    redirect(`/bloodhero/respond/error?reason=apply&detail=${encodeURIComponent(payload.error)}`);
  }

  const outcomeMap = {
    accept: "accepted",
    block_3m: "block_3m",
    block_2m: "block_2m",
    block_1m: "block_1m",
  } as const;
  const outcome =
    outcomeMap[verified.action as keyof typeof outcomeMap] ?? "accepted";
  redirect(`/bloodhero/respond/done?outcome=${encodeURIComponent(outcome)}`);
}
