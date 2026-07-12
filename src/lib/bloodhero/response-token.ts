/**
 * Signed tokens for BloodHero donor response links (server-only).
 *
 * Strategy: HMAC-SHA256 over a compact JSON payload `{ nid, act, exp }`.
 * - `nid` = bloodhero_request_notifications.id (UUID)
 * - `act` = accept | block_1m | block_2m | block_3m
 * - `exp` = Unix seconds (UTC)
 *
 * Wire format: base64url(payloadJson) + "." + base64url(hmac)
 * Verification uses timing-safe comparison. Secret: BLOODHERO_RESPONSE_TOKEN_SECRET (≥32 chars).
 */
import { createHmac, timingSafeEqual } from "crypto";

export const BLOODHERO_RESPONSE_ACTIONS = [
  "accept",
  "block_1m",
  "block_2m",
  "block_3m",
] as const;

export type BloodHeroResponseAction = (typeof BLOODHERO_RESPONSE_ACTIONS)[number];

const TTL_SECONDS_DEFAULT = 14 * 24 * 60 * 60;

function getSecret(): string {
  const s = process.env.BLOODHERO_RESPONSE_TOKEN_SECRET;
  if (!s || s.length < 32) {
    throw new Error("BLOODHERO_RESPONSE_TOKEN_SECRET must be set (at least 32 characters).");
  }
  return s;
}

export function signBloodHeroResponseToken(
  notificationId: string,
  action: BloodHeroResponseAction,
  expiresAtSec?: number
): string {
  const exp = expiresAtSec ?? Math.floor(Date.now() / 1000) + TTL_SECONDS_DEFAULT;
  const payload = JSON.stringify({ nid: notificationId, act: action, exp });
  const secret = getSecret();
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  const body = Buffer.from(payload, "utf8").toString("base64url");
  return `${body}.${sig}`;
}

export type VerifyBloodHeroTokenResult =
  | { ok: true; notificationId: string; action: BloodHeroResponseAction; exp: number }
  | { ok: false; reason: "invalid_format" | "bad_signature" | "expired" | "invalid_action" | "config" };

export function verifyBloodHeroResponseToken(token: string): VerifyBloodHeroTokenResult {
  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return { ok: false, reason: "config" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { ok: false, reason: "invalid_format" };
  }
  const [bodyB64, sigB64] = parts;
  if (!bodyB64 || !sigB64) {
    return { ok: false, reason: "invalid_format" };
  }

  let payloadRaw: string;
  try {
    payloadRaw = Buffer.from(bodyB64, "base64url").toString("utf8");
  } catch {
    return { ok: false, reason: "invalid_format" };
  }

  const expectedSig = createHmac("sha256", secret).update(payloadRaw).digest();
  let providedSig: Buffer;
  try {
    providedSig = Buffer.from(sigB64, "base64url");
  } catch {
    return { ok: false, reason: "invalid_format" };
  }

  if (providedSig.length !== expectedSig.length || !timingSafeEqual(providedSig, expectedSig)) {
    return { ok: false, reason: "bad_signature" };
  }

  let parsed: { nid?: string; act?: string; exp?: number };
  try {
    parsed = JSON.parse(payloadRaw) as { nid?: string; act?: string; exp?: number };
  } catch {
    return { ok: false, reason: "invalid_format" };
  }

  if (
    typeof parsed.nid !== "string" ||
    typeof parsed.act !== "string" ||
    typeof parsed.exp !== "number"
  ) {
    return { ok: false, reason: "invalid_format" };
  }

  if (!BLOODHERO_RESPONSE_ACTIONS.includes(parsed.act as BloodHeroResponseAction)) {
    return { ok: false, reason: "invalid_action" };
  }

  if (parsed.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired" };
  }

  return {
    ok: true,
    notificationId: parsed.nid,
    action: parsed.act as BloodHeroResponseAction,
    exp: parsed.exp,
  };
}

export function bloodHeroResponseActionLabel(action: BloodHeroResponseAction): string {
  switch (action) {
    case "accept":
      return "I can donate to this request";
    case "block_3m":
      return "I donated recently — block me for the next 3 months";
    case "block_2m":
      return "I donated recently — block me for the next 2 months";
    case "block_1m":
      return "I donated recently — block me for the next 1 month";
    default:
      return action;
  }
}
