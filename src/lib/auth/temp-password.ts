import { randomBytes } from "node:crypto";

/**
 * AUTH-003: secure one-time temporary password. Mixed-case + digits + symbol,
 * long enough that rate limiting (not brute force) is the realistic attack surface.
 */
export function generateTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  const bytes = randomBytes(16);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/** Opaque placeholder password for accounts not yet approved — never emailed, never enters first-login flow. */
export function generateUnusablePassword(): string {
  return randomBytes(32).toString("hex");
}
