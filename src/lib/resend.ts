/**
 * Server-only Resend client. Never import from client components or `"use client"` modules.
 */
import { Resend } from "resend";

let cached: Resend | null = null;

/** Throws if `RESEND_API_KEY` is missing or blank. */
export function requireResendApiKey(): string {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error("RESEND_API_KEY is missing or empty");
  }
  return key;
}

/** Singleton Resend instance for the Node server process. */
export function getResendClient(): Resend {
  if (!cached) {
    cached = new Resend(requireResendApiKey());
  }
  return cached;
}

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}
