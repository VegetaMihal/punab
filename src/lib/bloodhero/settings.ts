import type { SupabaseClient } from "@supabase/supabase-js";

const BLOODHERO_SETTINGS_SINGLETON_ID = true;
const BLOODHERO_SETTINGS_KEY_DONOR_AUTO_APPROVAL = "donor_auto_approval";
// TEMP DIAGNOSTICS: remove after auto-approval rollout is stable.
const BLOODHERO_AUTO_APPROVAL_DIAGNOSTICS = true;

type SupabaseSettingsError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export class BloodHeroSettingsError extends Error {
  constructor(
    message: string,
    public readonly userMessage: string
  ) {
    super(message);
    this.name = "BloodHeroSettingsError";
  }
}

function isMissingBloodHeroSettingsTableError(err: SupabaseSettingsError | null): boolean {
  if (!err) return false;
  const code = String(err.code ?? "");
  if (code === "PGRST205" || code === "42P01") return true;
  const m = (err.message ?? "").toLowerCase();
  return m.includes("bloodhero_settings") && (m.includes("schema cache") || m.includes("does not exist"));
}

function isMissingLegacySettingsColumnsError(err: SupabaseSettingsError | null): boolean {
  if (!err) return false;
  const code = String(err.code ?? "");
  if (code === "42703" || code === "PGRST204") return true;
  const m = (err.message ?? "").toLowerCase();
  return (
    (m.includes("value_json") || m.includes("column key")) &&
    (m.includes("column") || m.includes("schema cache"))
  );
}

type LegacyKvSettingsRow = {
  key: string;
  value_json: { enabled?: unknown } | null;
};

function logAutoApprovalDiag(message: string, meta?: Record<string, unknown>): void {
  if (!BLOODHERO_AUTO_APPROVAL_DIAGNOSTICS) return;
  console.info("[BloodHero:auto-approval:diag]", message, meta ?? {});
}

export async function getBloodHeroDonorAutoApprovalSetting(
  supabase: SupabaseClient
): Promise<boolean> {
  // Primary model: key/value-json schema.
  const legacy = await supabase
    .from("bloodhero_settings")
    .select("key, value_json")
    .eq("key", BLOODHERO_SETTINGS_KEY_DONOR_AUTO_APPROVAL)
    .maybeSingle<LegacyKvSettingsRow>();
  logAutoApprovalDiag("legacy query completed", {
    querySucceeded: !legacy.error,
    rowFound: Boolean(legacy.data),
    usedModel: "legacy",
    hasEnabledField:
      legacy.data?.value_json != null &&
      typeof legacy.data.value_json === "object" &&
      Object.prototype.hasOwnProperty.call(legacy.data.value_json, "enabled"),
  });

  if (!legacy.error) {
    if (!legacy.data) {
      console.info(
        "[BloodHero:auto-approval] donor_auto_approval key missing in bloodhero_settings (legacy model); defaulting to disabled"
      );
      return false;
    }
    return Boolean(legacy.data?.value_json?.enabled);
  }

  if (!isMissingLegacySettingsColumnsError(legacy.error)) {
    if (isMissingBloodHeroSettingsTableError(legacy.error)) {
      throw new BloodHeroSettingsError(
        legacy.error.message || "bloodhero_settings table is missing",
        "BloodHero settings are not ready yet. Ask a developer to apply migration 018 in Supabase."
      );
    }
    throw new BloodHeroSettingsError(
      legacy.error.message || "Failed to read BloodHero settings (legacy model)",
      "Could not load BloodHero auto approval setting."
    );
  }

  // Compatibility fallback: support older singleton boolean-column schema.
  const modern = await supabase
    .from("bloodhero_settings")
    .select("donor_auto_approval_enabled")
    .eq("id", BLOODHERO_SETTINGS_SINGLETON_ID)
    .maybeSingle();
  logAutoApprovalDiag("modern query completed", {
    querySucceeded: !modern.error,
    rowFound: Boolean(modern.data),
    usedModel: "modern-fallback",
  });

  if (modern.error) {
    throw new BloodHeroSettingsError(
      modern.error.message || "Failed to read BloodHero settings (modern fallback)",
      "Could not load BloodHero auto approval setting."
    );
  }
  if (!modern.data) {
    console.info(
      "[BloodHero:auto-approval] settings row missing in bloodhero_settings (modern fallback); defaulting to disabled"
    );
    return false;
  }
  return Boolean(modern.data?.donor_auto_approval_enabled);
}

export async function setBloodHeroDonorAutoApprovalSetting(
  supabase: SupabaseClient,
  enabled: boolean
): Promise<void> {
  // Primary model: key/value-json schema.
  const legacy = await supabase.from("bloodhero_settings").upsert(
    {
      key: BLOODHERO_SETTINGS_KEY_DONOR_AUTO_APPROVAL,
      value_json: { enabled },
    },
    { onConflict: "key" }
  );
  if (!legacy.error) return;

  if (!isMissingLegacySettingsColumnsError(legacy.error)) {
    if (isMissingBloodHeroSettingsTableError(legacy.error)) {
      throw new BloodHeroSettingsError(
        legacy.error.message || "bloodhero_settings table is missing",
        "BloodHero settings are not ready yet. Ask a developer to apply migration 018 in Supabase."
      );
    }
    throw new BloodHeroSettingsError(
      legacy.error.message || "Failed to update BloodHero settings",
      "Could not update BloodHero auto approval setting."
    );
  }

  // Compatibility fallback: older singleton boolean-column schema.
  const modern = await supabase.from("bloodhero_settings").upsert(
    {
      id: BLOODHERO_SETTINGS_SINGLETON_ID,
      donor_auto_approval_enabled: enabled,
    },
    { onConflict: "id" }
  );

  if (modern.error) {
    throw new BloodHeroSettingsError(
      modern.error.message || "Failed to update BloodHero settings (modern fallback)",
      "Could not update BloodHero auto approval setting."
    );
  }
}
