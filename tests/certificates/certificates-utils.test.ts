import test from "node:test";
import assert from "node:assert/strict";
import { buildCertificateVerificationUrl } from "@/lib/certificates/verification";
import { formatCertificateNumber } from "@/lib/certificates/numbering";

test("formatCertificateNumber formats with random token", () => {
  const value = formatCertificateNumber(2026, "A1B2C3D4E5F6");
  assert.equal(value, "PUNAB-CERT-2026-A1B2C3D4E5F6");
});

test("buildCertificateVerificationUrl URL-encodes certificate number", () => {
  const value = buildCertificateVerificationUrl("PUNAB-CERT-2026-000001");
  assert.equal(value, "https://punab.com/certificate/verify/PUNAB-CERT-2026-000001");
});
