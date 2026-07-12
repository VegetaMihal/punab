import test from "node:test";
import assert from "node:assert/strict";
import { buildTemplateContext, renderCertificateHtml } from "@/lib/certificates/templates";
import type { Certificate, CertificateTemplate } from "@/types/database";

const template: CertificateTemplate = {
  id: "tpl-1",
  name: "Custom",
  slug: "custom-template",
  type: "custom",
  htmlContent: "<h1>{{certificateTitle}}</h1><h2>{{recipientName}}</h2><p>{{reason}}</p>",
  cssContent: ".certificate{width:100px}",
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const certificate: Certificate = {
  id: "cert-1",
  certificateNumber: "PUNAB-CERT-2026-000001",
  certificateTitle: "Certificate of Participation",
  certificateType: "Participation",
  recipientName: "Md Rahim",
  recipientEmail: "rahim@example.com",
  universityName: "NSU",
  eventName: "Podium 5.1",
  role: null,
  achievement: null,
  timePeriod: null,
  reason: "For successfully participating.",
  issueDate: "2026-05-01T00:00:00.000Z",
  templateId: "tpl-1",
  pdfUrl: null,
  verificationUrl: null,
  status: "DRAFT",
  signatoryName1: null,
  signatoryDesignation1: null,
  signatoryName2: null,
  signatoryDesignation2: null,
  signatorySignature1Url: null,
  signatorySignature2Url: null,
  customFields: null,
  emailSentAt: null,
  revokedAt: null,
  revokedReason: null,
  createdById: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

test("renderCertificateHtml injects dynamic content", () => {
  const context = buildTemplateContext({
    certificate,
    verificationUrl: "https://punab.com/certificate/verify/PUNAB-CERT-2026-000001",
    qrCode: "data:image/png;base64,aaa",
    logoUrl: "https://punab.com/logo.png",
  });
  const html = renderCertificateHtml(template, context);

  assert.match(html, /Certificate of Participation/);
  assert.match(html, /Md Rahim/);
  assert.match(html, /For successfully participating\./);
});
