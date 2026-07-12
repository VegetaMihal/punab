import QRCode from "qrcode";

/** PNG buffer of the ticket QR (encodes the public ticket lookup URL); send as a cid attachment, not an inline data: URI — most mail clients strip those. */
export async function generateJulyAwardTicketQrCodePngBuffer(ticketUrl: string): Promise<Buffer> {
  return QRCode.toBuffer(ticketUrl, {
    width: 240,
    margin: 1,
    color: {
      dark: "#1b5e2e",
      light: "#ffffff",
    },
  });
}
