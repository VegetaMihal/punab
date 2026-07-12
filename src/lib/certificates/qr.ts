import QRCode from "qrcode";

export async function generateCertificateQrCodeDataUrl(verificationUrl: string): Promise<string> {
  return QRCode.toDataURL(verificationUrl, {
    width: 220,
    margin: 1,
    color: {
      dark: "#1b5e2e",
      light: "#ffffff",
    },
  });
}
