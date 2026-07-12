import { CERTIFICATE_PUBLIC_VERIFY_BASE } from "@/lib/certificates/constants";

export function buildCertificateVerificationUrl(certificateNumber: string): string {
  return `${CERTIFICATE_PUBLIC_VERIFY_BASE}/${encodeURIComponent(certificateNumber)}`;
}
