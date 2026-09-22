import QRCode from "qrcode";

export const BABBF_TICKET_VERIFY_BASE = "https://punab.com/babbf-championship-2026/ticket";

export function buildBabbfTicketUrl(referenceNumber: string): string {
  return `${BABBF_TICKET_VERIFY_BASE}/${encodeURIComponent(referenceNumber)}`;
}

/** PNG buffer of the ticket QR (encodes the public ticket verify URL); send as a cid attachment, not an inline data: URI — most mail clients strip those. */
export async function generateBabbfTicketQrCodePngBuffer(ticketUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(ticketUrl, {
    width: 240,
    margin: 1,
    color: {
      dark: "#C8161E",
      light: "#ffffff",
    },
  });
}
