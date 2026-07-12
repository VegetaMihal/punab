import Handlebars from "handlebars";
import type { Certificate, CertificateTemplate } from "@/types/database";

export type CertificateTemplateContext = {
  logoUrl: string;
  certificateTitle: string;
  recipientName: string;
  certificateSubtitle: string;
  reason: string;
  eventName: string;
  role: string;
  achievement: string;
  universityName: string;
  timePeriod: string;
  issueDate: string;
  /** e.g. April 26, 2026 — used on Template 1 · Official footer */
  issueDateLong: string;
  certificateNumber: string;
  verificationUrl: string;
  qrCode: string;
  signatoryName1: string;
  signatoryDesignation1: string;
  signatoryName2: string;
  signatoryDesignation2: string;
  /** Data URLs or absolute URLs for PDF <img> src (resolved server-side). */
  signatorySignature1Src: string;
  signatorySignature2Src: string;
};

function esc(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sigStampHtml(src: string): string {
  const s = src?.trim();
  if (!s) {
    return "";
  }
  return `<div class="sig-stamp-wrap"><img class="sig-stamp" src="${s}" alt="" /></div>`;
}

function renderBuiltInTemplate(slug: string, context: CertificateTemplateContext): string | null {
  const c = {
    logoUrl: esc(context.logoUrl),
    certificateTitle: esc(context.certificateTitle),
    recipientName: esc(context.recipientName),
    reason: esc(context.reason),
    eventName: esc(context.eventName),
    role: esc(context.role),
    achievement: esc(context.achievement),
    universityName: esc(context.universityName),
    timePeriod: esc(context.timePeriod),
    issueDate: esc(context.issueDate),
    issueDateLong: esc(context.issueDateLong),
    certificateNumber: esc(context.certificateNumber),
    verificationUrl: esc(context.verificationUrl),
    qrCode: esc(context.qrCode),
    signatoryName1: esc(context.signatoryName1),
    signatoryDesignation1: esc(context.signatoryDesignation1),
    signatoryName2: esc(context.signatoryName2),
    signatoryDesignation2: esc(context.signatoryDesignation2),
  };

  const sig1 = sigStampHtml(context.signatorySignature1Src ?? "");

  if (slug === "official") {
    const uniBlock =
      c.universityName.length > 0
        ? `
      <div class="recipient-meta">
        <div class="bar"></div>
        <div class="univ">${c.universityName}</div>
        <div class="bar"></div>
      </div>`
        : "";

    const periodBlock =
      c.timePeriod.length > 0
        ? `
    <div class="period-tag">
      <span>${c.timePeriod}</span>
    </div>`
        : "";

    return `
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400;700;900&display=swap');
.certificate{width:1122px;height:794px;overflow:hidden;box-sizing:border-box;position:relative;display:flex;background:#fff;font-family:'Lato',sans-serif}
.spine{width:72px;background:#0e3318;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:22px 0;position:relative;z-index:2}
.spine-diamond{width:11px;height:11px;background:#d4ae4a;transform:rotate(45deg);flex-shrink:0}
.spine-line{width:1px;flex:1;background:rgba(255,255,255,.15);margin:12px 0}
.spine-text{writing-mode:vertical-rl;transform:rotate(180deg);font-family:'Lato',sans-serif;font-size:7.5px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:rgba(255,255,255,.3);user-select:none}
.spine-seal{width:36px;height:36px;border-radius:50%;border:1.5px solid rgba(212,174,74,.4);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.spine-seal-inner{width:24px;height:24px;border-radius:50%;background:rgba(212,174,74,.15);border:1px solid rgba(212,174,74,.3)}
.main{flex:1;display:flex;flex-direction:column;padding:26px 40px 20px 32px;position:relative;overflow:hidden}
.watermark{position:absolute;top:50%;left:52%;transform:translate(-50%,-50%) rotate(-15deg);font-family:'Playfair Display',serif;font-size:140px;font-weight:700;color:rgba(27,94,46,.035);white-space:nowrap;pointer-events:none;user-select:none;letter-spacing:14px;z-index:0}
.frame-outer{position:absolute;top:12px;left:0;right:12px;bottom:12px;border:1.5px solid #1b5e2e;pointer-events:none;z-index:1}
.frame-inner{position:absolute;inset:6px;border:.5px solid rgba(184,147,42,.5)}
.corner{position:absolute;width:20px;height:20px}.corner.tl{top:-1px;left:-1px;border-top:2.5px solid #b8932a;border-left:2.5px solid #b8932a}.corner.tr{top:-1px;right:-1px;border-top:2.5px solid #b8932a;border-right:2.5px solid #b8932a}.corner.bl{bottom:-1px;left:-1px;border-bottom:2.5px solid #b8932a;border-left:2.5px solid #b8932a}.corner.br{bottom:-1px;right:-1px;border-bottom:2.5px solid #b8932a;border-right:2.5px solid #b8932a}
.header-row{display:flex;align-items:center;gap:14px;margin-bottom:6px;position:relative;z-index:2}
.logo-wrap img{height:58px;width:auto;object-fit:contain;display:block}
.header-divider{width:1.5px;height:48px;background:rgba(27,94,46,.25);flex-shrink:0}
.header-text .doc-type{font-size:8px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#1b5e2e;margin-bottom:3px}
.header-text .org-name{font-size:10.5px;font-weight:300;color:#6b6b6b;letter-spacing:.3px}
.rule{height:1px;background:linear-gradient(to right,rgba(27,94,46,.6),transparent);margin-bottom:12px;position:relative;z-index:2}
.title-block{text-align:center;margin-bottom:2px;position:relative;z-index:2}
.cert-of{font-family:'Playfair Display',serif;font-size:10.5px;font-weight:400;font-style:italic;color:#b8932a;letter-spacing:5px;text-transform:uppercase;margin-bottom:3px}
.certifies-label{font-size:9px;font-weight:400;letter-spacing:4px;text-transform:uppercase;color:#6b6b6b;margin-bottom:5px}
.cert-title{font-family:'Playfair Display',serif;font-size:36px;font-weight:700;color:#1b5e2e;letter-spacing:2.8px;text-transform:uppercase;line-height:1.05}
.content-main{flex:1;display:flex;flex-direction:column;justify-content:center}
.diamond-divider{display:flex;align-items:center;justify-content:center;gap:6px;margin:8px 0;position:relative;z-index:2}
.diamond-divider .line{height:1px;background:rgba(184,147,42,.5)}.diamond-divider .diamond{width:5px;height:5px;background:#b8932a;transform:rotate(45deg);flex-shrink:0}.diamond-divider .dot{width:3px;height:3px;background:rgba(184,147,42,.5);transform:rotate(45deg);flex-shrink:0}
.recipient-block{text-align:center;margin-bottom:4px;position:relative;z-index:2}
.recipient-name{font-family:'Playfair Display',serif;font-size:68px;font-weight:700;color:#1a1a1a;letter-spacing:.5px;line-height:1.05;max-width:920px;margin:0 auto;overflow-wrap:anywhere;word-break:break-word;white-space:normal}
.recipient-meta{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:4px}
.recipient-meta .bar{width:36px;height:1.5px;background:#c12526}
.recipient-meta .univ{font-size:20px;color:#6b6b6b;letter-spacing:.8px;max-width:880px;overflow-wrap:anywhere;word-break:break-word;white-space:normal}
.reason-block{text-align:center;max-width:860px;width:100%;margin:0 auto 8px;padding:0 18px;position:relative;z-index:2}
.reason-text{font-family:'EB Garamond',serif;font-size:24px;font-style:italic;color:#3a3a3a;line-height:1.75;overflow-wrap:anywhere;word-break:break-word;white-space:normal;text-transform:uppercase}
.period-tag{text-align:center;margin-bottom:8px;position:relative;z-index:2}
.period-tag span{display:inline-block;font-size:12px;font-weight:700;letter-spacing:2.2px;color:#1b5e2e;border:1px solid rgba(27,94,46,.35);padding:4px 20px;text-transform:uppercase}
.cert-footer{display:grid;grid-template-columns:1fr auto 1fr;align-items:flex-end;border-top:1px solid rgba(27,94,46,.2);padding-top:8px;margin-top:auto;position:relative;z-index:2}
.sig-group{display:flex;gap:36px;flex-wrap:wrap;align-items:flex-end}.sig-col{text-align:center;min-width:130px}.sig-line{height:1px;background:rgba(27,94,46,.35);margin-bottom:4px}
.sig-stamp-wrap{display:flex;justify-content:center;align-items:flex-end;margin-bottom:4px;min-height:28px}
.sig-stamp{max-height:56px;max-width:200px;object-fit:contain;display:block;margin:0 auto}
.sig-name{font-size:10.5px;font-weight:700;color:#1b5e2e;letter-spacing:.3px}.sig-desig{font-size:8.5px;color:#6b6b6b;letter-spacing:.3px;margin-top:1px}
.sig-group{justify-self:start}
.qr-block{text-align:center;justify-self:center}.qr-block img{width:62px;height:62px;display:block;margin:0 auto 3px}
.qr-label{font-size:6.5px;color:#6b6b6b;letter-spacing:.5px;margin-bottom:1px}.qr-url{font-size:6px;color:#b0b0b0}
.meta-block{text-align:right;justify-self:end}.meta-date-label{font-size:7.5px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6b6b;margin-bottom:2px}
.meta-date{font-size:11px;font-weight:700;color:#1b5e2e;letter-spacing:.3px}.meta-certno{font-size:7.5px;color:#b0b0b0;margin-top:3px;letter-spacing:.5px}
.tagline{text-align:center;margin-top:6px;position:relative;z-index:2}
.tagline span{font-size:7.5px;letter-spacing:4px;color:rgba(27,94,46,.45);text-transform:uppercase}
</style>
<div class="certificate">
  <div class="spine">
    <div class="spine-diamond"></div>
    <div class="spine-line"></div>
    <div class="spine-text">Unity · Mobilizing · Progress</div>
    <div class="spine-line"></div>
    <div class="spine-seal"><div class="spine-seal-inner"></div></div>
  </div>
  <div class="main">
    <div class="watermark">PUNAB</div>
    <div class="frame-outer">
      <div class="frame-inner"></div>
      <div class="corner tl"></div>
      <div class="corner tr"></div>
      <div class="corner bl"></div>
      <div class="corner br"></div>
    </div>
    <div class="header-row">
      <div class="logo-wrap"><img src="${c.logoUrl}" alt="PUNAB Logo" /></div>
      <div class="header-divider"></div>
      <div class="header-text">
        <div class="doc-type">Official Document</div>
        <div class="org-name">Private University National Association of Bangladesh</div>
      </div>
    </div>
    <div class="rule"></div>
    <div class="title-block">
      <div class="certifies-label">This is to certify that</div>
      <div class="cert-of">Certificate of</div>
      <div class="cert-title">${c.certificateTitle}</div>
    </div>
    <div class="content-main">
      <div class="diamond-divider">
        <div class="line" style="width:100px;"></div>
        <div class="dot"></div>
        <div class="diamond"></div>
        <div class="dot"></div>
        <div class="line" style="width:100px;"></div>
      </div>
      <div class="recipient-block">
        <div class="recipient-name">${c.recipientName}</div>${uniBlock}
      </div>
      <div class="reason-block"><div class="reason-text">${c.reason}</div></div>${periodBlock}
    </div>
    <div class="cert-footer">
      <div class="sig-group">
        <div class="sig-col">
          ${sig1}
          <div class="sig-line"></div>
          <div class="sig-name">${c.signatoryName1}</div>
          <div class="sig-desig">${c.signatoryDesignation1}</div>
        </div>
      </div>
      <div class="qr-block">
        <img src="${c.qrCode}" alt="Verify certificate QR code" />
        <div class="qr-label">Verify this certificate by scanning the QR code</div>
        <div class="qr-url">${c.verificationUrl}</div>
      </div>
      <div class="meta-block">
        <div class="meta-date-label">Issue Date</div>
        <div class="meta-date">${c.issueDate}</div>
        <div class="meta-certno">${c.certificateNumber}</div>
      </div>
    </div>
    <div class="tagline"><span>Unity · Mobilizing · Progress</span></div>
  </div>
</div>`;
  }

  if (slug === "event") {
    const eventBlock =
      c.eventName.length > 0
        ? `
      <div class="event-bar"></div>
      <div class="event-info">
        <div class="event-label">Event / Program</div>
        <div class="event-name">${c.eventName}</div>
      </div>`
        : "";

    const roleBadge =
      c.role.length > 0
        ? `
      <div class="badge badge-green">
        <div class="badge-label">Role</div>
        <div class="badge-value-green">${c.role}</div>
      </div>`
        : "";

    const universityBadge =
      c.universityName.length > 0
        ? `
      <div class="badge badge-red" style="margin-left:8px;">
        <div class="badge-label">University</div>
        <div class="badge-value-red">${c.universityName}</div>
      </div>`
        : "";

    const periodLine =
      c.timePeriod.length > 0
        ? `<div class="period-line">${c.timePeriod}</div>`
        : "";

    return `
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=EB+Garamond:ital,wght@0,400;1,400&family=Lato:wght@300;400;700;900&display=swap');
.certificate{width:1122px;height:794px;overflow:hidden;box-sizing:border-box;position:relative;background:#fff;font-family:'Lato',sans-serif;display:flex;flex-direction:column}
.bg-texture{position:absolute;inset:0;background-image:radial-gradient(circle,rgba(27,94,46,.055) 1px,transparent 1px);background-size:22px 22px;pointer-events:none;z-index:0}
.header-band{background:#0e3318;height:104px;flex-shrink:0;display:flex;align-items:center;padding:0 44px;gap:18px;position:relative;z-index:2}
.logo-pill{background:rgba(255,255,255,.92);border-radius:4px;padding:5px 10px;flex-shrink:0}
.logo-pill img{height:52px;width:auto;object-fit:contain;display:block}
.header-spacer{flex:1}.header-right{text-align:right}
.header-title{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:#fff;letter-spacing:2.5px;line-height:1;text-transform:uppercase}
.header-subtitle{font-size:8.5px;color:rgba(255,255,255,.5);letter-spacing:3px;margin-top:5px;text-transform:uppercase}
.header-certno{position:absolute;top:10px;right:44px;font-size:8.5px;color:#d4ae4a;letter-spacing:1px}
.red-stripe{height:4px;background:#c12526;flex-shrink:0;z-index:2;position:relative}
.body{flex:1;display:flex;flex-direction:column;padding:18px 48px 16px;position:relative;z-index:1;overflow:hidden;text-align:center;align-items:center}
.event-watermark{position:absolute;top:50%;left:52%;transform:translate(-50%,-50%) rotate(-15deg);font-family:'Playfair Display',serif;font-size:140px;font-weight:700;color:rgba(27,94,46,.035);white-space:nowrap;pointer-events:none;user-select:none;letter-spacing:14px;z-index:0}
.event-row{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:18px;width:100%}
.event-bar{width:3px;height:28px;background:#c12526;flex-shrink:0}
.event-label{font-size:7.5px;letter-spacing:3px;text-transform:uppercase;color:#6b6b6b;margin-bottom:2px}
.event-name{font-size:12.5px;font-weight:700;color:#c12526;letter-spacing:.3px}
.event-row-spacer{display:none}
.badge{border-radius:2px;padding:7px 18px}
.badge-green{background:rgba(27,94,46,.08);border:1px solid rgba(27,94,46,.22)}
.badge-red{background:rgba(193,37,38,.06);border:1px solid rgba(193,37,38,.2)}
.badge-label{font-size:7.5px;color:#6b6b6b;letter-spacing:1px;text-transform:uppercase;margin-bottom:1px}
.badge-value-green{font-size:16px;font-weight:700;color:#1b5e2e}
.badge-value-red{font-size:16px;font-weight:700;color:#c12526}
.certify-label{font-size:13px;letter-spacing:4.8px;color:#6b6b6b;text-transform:uppercase;margin-bottom:10px}
.content-main{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;width:100%}
.recipient-name{font-family:'Playfair Display',serif;font-size:78px;font-weight:700;color:#1a1a1a;letter-spacing:.5px;line-height:1;margin-bottom:10px;max-width:960px;overflow-wrap:anywhere;word-break:break-word;white-space:normal}
.triple-bar{display:flex;gap:4px;margin-bottom:8px}
.triple-bar .b1{width:56px;height:3px;background:#1b5e2e}.triple-bar .b2{width:12px;height:3px;background:#b8932a}.triple-bar .b3{width:22px;height:3px;background:#c12526}
.reason-text{max-width:860px;width:100%;padding:0 18px;font-family:'EB Garamond',serif;font-size:26px;font-style:italic;color:#3a3a3a;line-height:1.7;margin-bottom:12px;overflow-wrap:anywhere;word-break:break-word;white-space:normal;text-transform:uppercase}
.period-line{font-size:14px;font-weight:700;color:#1b5e2e;letter-spacing:2px;margin-bottom:10px;text-transform:uppercase}
.cert-footer{display:grid;grid-template-columns:1fr auto 1fr;align-items:flex-end;border-top:1px solid #e5e5e5;padding-top:8px;margin-top:auto;width:100%}
.sig-group{display:flex;gap:36px;flex-wrap:wrap;align-items:flex-end}.sig-col{text-align:center;min-width:130px}.sig-line{height:1px;background:rgba(27,94,46,.3);margin-bottom:4px}
.sig-stamp-wrap{display:flex;justify-content:center;align-items:flex-end;margin-bottom:4px;min-height:28px}
.sig-stamp{max-height:56px;max-width:200px;object-fit:contain;display:block;margin:0 auto}
.sig-name{font-size:10.5px;font-weight:700;color:#1b5e2e}.sig-desig{font-size:8.5px;color:#6b6b6b;margin-top:1px}
.sig-group{justify-self:start}
.qr-block{text-align:center;justify-self:center}.qr-block img{width:62px;height:62px;display:block;margin:0 auto 3px}
.qr-label{font-size:6.5px;color:#6b6b6b;letter-spacing:.5px;margin-bottom:1px}.qr-url{font-size:6px;color:#b0b0b0}
.meta-block{text-align:right;justify-self:end}.meta-date-label{font-size:7.5px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6b6b;margin-bottom:2px}
.meta-date{font-size:11px;font-weight:700;color:#1b5e2e}.meta-certno{font-size:7.5px;color:#b0b0b0;margin-top:3px}
.tagline{text-align:center;margin-top:6px}.tagline span{font-size:7.5px;letter-spacing:4px;color:rgba(27,94,46,.4);text-transform:uppercase}
.right-accent{position:absolute;top:108px;right:0;bottom:0;width:5px;background:linear-gradient(to bottom,#1b5e2e,#c12526);z-index:3}
</style>
<div class="certificate">
  <div class="bg-texture"></div>
  <div class="right-accent"></div>
  <div class="header-band">
    <div class="logo-pill"><img src="${c.logoUrl}" alt="PUNAB Logo" /></div>
    <div class="header-spacer"></div>
    <div class="header-right">
      <div class="header-title">Event Certificate</div>
      <div class="header-subtitle">Private University National Association of Bangladesh</div>
    </div>
    <div class="header-certno">${c.certificateNumber}</div>
  </div>
  <div class="red-stripe"></div>
  <div class="body">
    <div class="event-watermark">PUNAB</div>
    <div class="content-main">
      <div class="event-row">
        ${eventBlock}
        <div class="event-row-spacer"></div>
        ${roleBadge}
        ${universityBadge}
      </div>
      <div class="certify-label">This is to certify that</div>
      <div class="recipient-name">${c.recipientName}</div>
      <div class="triple-bar">
        <div class="b1"></div>
        <div class="b2"></div>
        <div class="b3"></div>
      </div>
      <div class="reason-text">${c.reason}</div>
      ${periodLine}
    </div>
    <div class="cert-footer">
      <div class="sig-group">
        <div class="sig-col">
          ${sig1}
          <div class="sig-line"></div>
          <div class="sig-name">${c.signatoryName1}</div>
          <div class="sig-desig">${c.signatoryDesignation1}</div>
        </div>
      </div>
      <div class="qr-block">
        <img src="${c.qrCode}" alt="Verify certificate QR code" />
        <div class="qr-label">Verify this certificate by scanning the QR code</div>
        <div class="qr-url">${c.verificationUrl}</div>
      </div>
      <div class="meta-block">
        <div class="meta-date-label">Issue Date</div>
        <div class="meta-date">${c.issueDate}</div>
        <div class="meta-certno">${c.certificateNumber}</div>
      </div>
    </div>
    <div class="tagline"><span>Unity · Mobilizing · Progress</span></div>
  </div>
</div>`;
  }

  if (slug === "achievement") {
    // Inline SVG: Unicode ★ / text stars often show as "?" in headless Chromium PDFs.
    const achievementHeaderStarSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" fill="#e8cc78" aria-hidden="true"><path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01L12 1z"/></svg>`;
    const achievementText = c.achievement.length > 0 ? c.achievement : "Achievement";
    const universityBlock =
      c.universityName.length > 0
        ? `
      <div class="recipient-meta">
        <div class="bar"></div>
        <div class="univ">${c.universityName}</div>
        <div class="bar"></div>
      </div>`
        : "";

    return `
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;1,400&family=Lato:wght@300;400;700;900&display=swap');
.certificate{width:1122px;height:794px;overflow:hidden;box-sizing:border-box;position:relative;background:#faf7f0;font-family:'Lato',sans-serif}
.bg-top{position:absolute;top:0;left:0;right:0;height:230px;background:linear-gradient(155deg,#0e3318 0%,#1b5e2e 100%);z-index:0}
.bg-bottom{position:absolute;top:205px;left:0;right:0;bottom:0;background:#faf7f0;z-index:0}
.bg-glow{position:absolute;top:0;left:0;right:0;height:230px;background:radial-gradient(ellipse 60% 80% at 70% 40%,rgba(212,174,74,.12) 0%,transparent 70%);z-index:1;pointer-events:none}
.achievement-watermark{position:absolute;top:50%;left:52%;transform:translate(-50%,-50%) rotate(-15deg);font-family:'Playfair Display',serif;font-size:140px;font-weight:700;color:rgba(27,94,46,.035);white-space:nowrap;pointer-events:none;user-select:none;letter-spacing:14px;z-index:1}
.frame-outer{position:absolute;top:12px;left:12px;right:12px;bottom:12px;border:1.5px solid #b8932a;pointer-events:none;z-index:5}
.frame-inner{position:absolute;inset:5px;border:.5px solid rgba(184,147,42,.4)}
.corner{position:absolute;width:22px;height:22px}.corner.tl{top:-1px;left:-1px;border-top:2.5px solid #d4ae4a;border-left:2.5px solid #d4ae4a}.corner.tr{top:-1px;right:-1px;border-top:2.5px solid #d4ae4a;border-right:2.5px solid #d4ae4a}.corner.bl{bottom:-1px;left:-1px;border-bottom:2.5px solid #d4ae4a;border-left:2.5px solid #d4ae4a}.corner.br{bottom:-1px;right:-1px;border-bottom:2.5px solid #d4ae4a;border-right:2.5px solid #d4ae4a}
.content{position:absolute;inset:0;display:flex;flex-direction:column;padding:22px 50px 18px;z-index:4}
.header-row{display:flex;align-items:flex-start;gap:18px;margin-bottom:5px}
.logo-pill{background:rgba(255,255,255,.9);border-radius:4px;padding:5px 8px;flex-shrink:0}
.logo-pill img{height:54px;width:auto;object-fit:contain;display:block}
.header-center{flex:1;text-align:center;padding-top:18px}
.org-name{font-size:8.5px;letter-spacing:3.5px;color:rgba(255,255,255,.45);text-transform:uppercase;margin-bottom:6px}
.stars{display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:6px}.stars svg{flex-shrink:0;display:block}
.cert-of-label{font-family:'Playfair Display',serif;font-size:12px;font-weight:400;font-style:italic;color:#d4ae4a;letter-spacing:6px;text-transform:uppercase;margin-bottom:6px}
.cert-title{font-family:'Playfair Display',serif;font-size:46px;font-weight:700;color:#fff;letter-spacing:4.6px;text-transform:uppercase;line-height:1}
.header-right{text-align:right;padding-top:2px;min-width:90px}
.certno-label{font-size:7.5px;color:rgba(255,255,255,.35);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:2px}
.certno-val{font-size:9.5px;color:#d4ae4a;font-weight:700;letter-spacing:.3px}
.content-main{flex:1;display:flex;flex-direction:column;justify-content:center}
.achievement-row{display:flex;justify-content:center;margin-bottom:10px}
.achievement-badge{background:linear-gradient(135deg,#b8932a 0%,#e8cc78 50%,#b8932a 100%);padding:9px 52px;display:inline-flex;align-items:center;gap:10px}
.badge-diamond{width:7px;height:7px;background:#fff;transform:rotate(45deg);flex-shrink:0}
.badge-text{font-family:'Lato',sans-serif;font-size:18px;font-weight:900;color:#fff;letter-spacing:4px;text-transform:uppercase}
.diamond-divider{display:flex;align-items:center;justify-content:center;gap:6px;margin:6px 0 12px}
.diamond-divider .line{height:1px;background:rgba(184,147,42,.45)}.diamond-divider .diamond{width:5px;height:5px;background:#b8932a;transform:rotate(45deg);flex-shrink:0}.diamond-divider .dot{width:3px;height:3px;background:rgba(184,147,42,.4);transform:rotate(45deg);flex-shrink:0}
.recipient-block{text-align:center;margin-bottom:8px}
.presented-to{font-size:13px;letter-spacing:4.8px;text-transform:uppercase;color:#6b6b6b;margin-bottom:10px}
.recipient-name{font-family:'Playfair Display',serif;font-size:78px;font-weight:700;color:#0e3318;letter-spacing:.5px;line-height:1}
.recipient-meta{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:6px}
.recipient-meta .bar{width:34px;height:1.5px;background:#b8932a}
.recipient-meta .univ{font-size:20px;color:#6b6b6b;letter-spacing:.9px}
.reason-block{text-align:center;max-width:860px;width:100%;margin:0 auto 10px;padding:0 18px}
.reason-text{
  font-family:'EB Garamond',serif;
  font-size:26px;
  font-style:italic;
  color:#3a3a3a;
  line-height:1.7;
  overflow-wrap:anywhere;
  word-break:break-word;
  white-space:normal;
  text-transform:uppercase;
}
.cert-footer{display:grid;grid-template-columns:1fr auto 1fr;align-items:flex-end;border-top:1px solid rgba(184,147,42,.35);padding-top:8px;margin-top:auto}
.sig-group{display:flex;gap:36px;flex-wrap:wrap;align-items:flex-end}.sig-col{text-align:center;min-width:130px}.sig-line{height:1px;background:rgba(27,94,46,.3);margin-bottom:4px}
.sig-stamp-wrap{display:flex;justify-content:center;align-items:flex-end;margin-bottom:4px;min-height:28px}
.sig-stamp{max-height:56px;max-width:200px;object-fit:contain;display:block;margin:0 auto}
.sig-name{font-size:10.5px;font-weight:700;color:#1b5e2e}.sig-desig{font-size:8.5px;color:#6b6b6b;margin-top:1px}
.sig-group{justify-self:start}
.qr-block{text-align:center;justify-self:center}.qr-block img{width:62px;height:62px;display:block;margin:0 auto 3px}
.qr-label{font-size:6.5px;color:#6b6b6b;letter-spacing:.5px;margin-bottom:1px}.qr-url{font-size:6px;color:#b0b0b0}
.meta-block{text-align:right;justify-self:end}.meta-date-label{font-size:7.5px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6b6b;margin-bottom:2px}
.meta-date{font-size:11px;font-weight:700;color:#1b5e2e}.meta-certno{font-size:7.5px;color:#b0b0b0;margin-top:3px}
.tagline{text-align:center;margin-top:6px}.tagline span{font-size:7.5px;letter-spacing:4.5px;color:rgba(184,147,42,.6);text-transform:uppercase}
</style>
<div class="certificate">
  <div class="bg-top"></div>
  <div class="bg-bottom"></div>
  <div class="bg-glow"></div>
  <div class="achievement-watermark">PUNAB</div>
  <div class="frame-outer">
    <div class="frame-inner"></div>
    <div class="corner tl"></div>
    <div class="corner tr"></div>
    <div class="corner bl"></div>
    <div class="corner br"></div>
  </div>
  <div class="content">
    <div class="header-row">
      <div class="logo-pill">
        <img src="${c.logoUrl}" alt="PUNAB Logo" />
      </div>
      <div class="header-center">
        <div class="org-name">Private University National Association of Bangladesh</div>
        <div class="stars">${achievementHeaderStarSvg.repeat(5)}</div>
        <div class="cert-of-label">Certificate of</div>
        <div class="cert-title">Achievement</div>
      </div>
      <div class="header-right">
        <div class="certno-label">Cert No.</div>
        <div class="certno-val">${c.certificateNumber}</div>
      </div>
    </div>
    <div class="content-main">
      <div class="achievement-row">
        <div class="achievement-badge">
          <div class="badge-diamond"></div>
          <div class="badge-text">${achievementText}</div>
          <div class="badge-diamond"></div>
        </div>
      </div>
      <div class="diamond-divider">
        <div class="line" style="width:120px;"></div>
        <div class="dot"></div>
        <div class="diamond"></div>
        <div class="dot"></div>
        <div class="line" style="width:120px;"></div>
      </div>
      <div class="recipient-block">
        <div class="presented-to">Proudly presented to</div>
        <div class="recipient-name">${c.recipientName}</div>
        ${universityBlock}
      </div>
      <div class="reason-block">
        <div class="reason-text">${c.reason}</div>
      </div>
    </div>
    <div class="cert-footer">
      <div class="sig-group">
        <div class="sig-col">
          ${sig1}
          <div class="sig-line"></div>
          <div class="sig-name">${c.signatoryName1}</div>
          <div class="sig-desig">${c.signatoryDesignation1}</div>
        </div>
      </div>
      <div class="qr-block">
        <img src="${c.qrCode}" alt="Verify certificate QR code" />
        <div class="qr-label">Verify this certificate by scanning the QR code</div>
        <div class="qr-url">${c.verificationUrl}</div>
      </div>
      <div class="meta-block">
        <div class="meta-date-label">Issue Date</div>
        <div class="meta-date">${c.issueDate}</div>
        <div class="meta-certno">${c.certificateNumber}</div>
      </div>
    </div>
    <div class="tagline"><span>Unity · Mobilizing · Progress</span></div>
  </div>
</div>`;
  }

  if (slug === "appreciation") {
    const recipientMetaParts: string[] = [];
    if (c.role.length > 0) {
      recipientMetaParts.push(c.role);
    }
    if (c.universityName.length > 0) {
      recipientMetaParts.push(c.universityName);
    }
    const recipientMeta =
      recipientMetaParts.length > 0
        ? `<div class="recipient-meta">${recipientMetaParts.join(" &nbsp;·&nbsp; ")}</div>`
        : "";

    const periodBlock =
      c.timePeriod.length > 0
        ? `
    <div class="period-block">
      <span class="period-tag">${c.timePeriod}</span>
    </div>`
        : "";

    return `
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Lato:wght@300;400;700&display=swap');
.certificate{width:1122px;height:794px;overflow:hidden;box-sizing:border-box;position:relative;background:#faf7f0;font-family:'Lato',sans-serif}
.bg-glow{position:absolute;inset:0;background:radial-gradient(ellipse 72% 55% at 50% 0%,#f0ead8 0%,#faf7f0 100%);pointer-events:none;z-index:0}
.appreciation-watermark{position:absolute;top:50%;left:52%;transform:translate(-50%,-50%) rotate(-15deg);font-family:'Playfair Display',serif;font-size:140px;font-weight:700;color:rgba(27,94,46,.035);white-space:nowrap;pointer-events:none;user-select:none;letter-spacing:14px;z-index:1}
.frame1{position:absolute;top:14px;left:14px;right:14px;bottom:14px;border:1.5px solid #b8932a;pointer-events:none;z-index:5}
.frame2{position:absolute;inset:5px;border:.75px solid rgba(184,147,42,.55)}
.frame3{position:absolute;inset:10px;border:.5px solid rgba(184,147,42,.28)}
.cdot{position:absolute;width:11px;height:11px;background:#b8932a;transform:rotate(45deg)}.cdot.tl{top:-6px;left:-6px}.cdot.tr{top:-6px;right:-6px}.cdot.bl{bottom:-6px;left:-6px}.cdot.br{bottom:-6px;right:-6px}
.top-flourish{position:absolute;top:26px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:5px;z-index:6;white-space:nowrap}
.fl-line-l{width:110px;height:1px;background:linear-gradient(to left,rgba(184,147,42,.7),transparent)}
.fl-line-r{width:110px;height:1px;background:linear-gradient(to right,rgba(184,147,42,.7),transparent)}
.fl-dot{width:4.5px;height:4.5px;background:#b8932a;transform:rotate(45deg);flex-shrink:0}
.bottom-flourish{position:absolute;bottom:26px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:5px;z-index:6;white-space:nowrap}
.content{position:absolute;inset:0;display:flex;flex-direction:column;padding:42px 58px 22px;z-index:4}
.header-row{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;margin-bottom:10px}
.est-label{font-size:8px;font-weight:700;letter-spacing:4px;color:#b8932a;text-transform:uppercase;margin-bottom:3px}
.org-name{font-size:9.5px;color:#6b6b6b;letter-spacing:.3px}
.logo-center{justify-self:center}.logo-center img{height:66px;width:auto;object-fit:contain;display:block}
.header-right{text-align:right;justify-self:end}.certno-label{font-size:7.5px;letter-spacing:1.5px;text-transform:uppercase;color:#b0b0b0;margin-bottom:2px}
.certno-val{font-size:10.5px;font-weight:700;color:#1b5e2e;letter-spacing:.3px}
.diamond-divider{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:12px}
.diamond-divider .line{height:1px;background:rgba(184,147,42,.4)}.diamond-divider .diamond{width:5px;height:5px;background:#b8932a;transform:rotate(45deg);flex-shrink:0}.diamond-divider .dot{width:3px;height:3px;background:rgba(184,147,42,.35);transform:rotate(45deg);flex-shrink:0}
.title-block{text-align:center;margin-bottom:12px}
.cert-of{font-family:'EB Garamond',serif;font-size:11.5px;font-weight:400;color:#b8932a;letter-spacing:7px;text-transform:uppercase;margin-bottom:4px}
.cert-title{font-family:'Playfair Display',serif;font-size:40px;font-weight:700;color:#0e3318;letter-spacing:3.2px;text-transform:uppercase}
.content-main{flex:1;display:flex;flex-direction:column;justify-content:center}
.body-block{text-align:center;margin-bottom:6px}
.recognition-label{font-size:13px;letter-spacing:4.8px;text-transform:uppercase;color:#6b6b6b;margin-bottom:10px}
.recipient-name{font-family:'Playfair Display',serif;font-size:78px;font-weight:700;color:#1a1a1a;letter-spacing:.5px;line-height:1;max-width:960px;margin:0 auto;overflow-wrap:anywhere;word-break:break-word;white-space:normal}
.recipient-underline{height:1.5px;background:linear-gradient(to right,transparent,#b8932a,transparent);width:380px;margin:6px auto}
.recipient-meta{font-size:20px;color:#6b6b6b;letter-spacing:.9px;max-width:940px;margin:0 auto;overflow-wrap:anywhere;word-break:break-word;white-space:normal}
.reason-block{text-align:center;max-width:860px;width:100%;margin:0 auto 8px;padding:0 18px}
.reason-text{font-family:'EB Garamond',serif;font-size:26px;font-style:italic;color:#3e3e3e;line-height:1.7;overflow-wrap:anywhere;word-break:break-word;white-space:normal;text-transform:uppercase}
.period-block{text-align:center;margin-bottom:8px}
.period-tag{display:inline-block;font-family:'EB Garamond',serif;font-size:14px;color:#b8932a;letter-spacing:2.2px;border-top:1px solid rgba(184,147,42,.45);border-bottom:1px solid rgba(184,147,42,.45);padding:3px 22px}
.cert-footer{display:grid;grid-template-columns:1fr auto 1fr;align-items:flex-end;border-top:1px solid rgba(184,147,42,.3);padding-top:8px;margin-top:auto}
.sig-group{display:flex;gap:36px;flex-wrap:wrap;align-items:flex-end}.sig-col{text-align:center;min-width:130px}.sig-line{height:1px;background:rgba(14,51,24,.3);margin-bottom:4px}
.sig-stamp-wrap{display:flex;justify-content:center;align-items:flex-end;margin-bottom:4px;min-height:28px}
.sig-stamp{max-height:56px;max-width:200px;object-fit:contain;display:block;margin:0 auto}
.sig-name{font-size:10.5px;font-weight:700;color:#0e3318}.sig-desig{font-size:8.5px;color:#6b6b6b;margin-top:1px}
.sig-group{justify-self:start}
.qr-block{text-align:center;justify-self:center}.qr-block img{width:62px;height:62px;display:block;margin:0 auto 3px}
.qr-label{font-size:6.5px;color:#6b6b6b;letter-spacing:.5px;margin-bottom:1px}.qr-url{font-size:6px;color:#b0b0b0}
.meta-block{text-align:right;justify-self:end}.meta-date-label{font-size:7.5px;letter-spacing:1.5px;text-transform:uppercase;color:#6b6b6b;margin-bottom:2px}
.meta-date{font-size:11px;font-weight:700;color:#0e3318}.meta-certno{font-size:7.5px;color:#b0b0b0;margin-top:3px}
.tagline{text-align:center;margin-top:6px}.tagline span{font-size:7.5px;letter-spacing:5px;color:rgba(184,147,42,.55);text-transform:uppercase}
</style>
<div class="certificate">
  <div class="bg-glow"></div>
  <div class="appreciation-watermark">PUNAB</div>
  <div class="frame1">
    <div class="frame2"></div>
    <div class="frame3"></div>
    <div class="cdot tl"></div>
    <div class="cdot tr"></div>
    <div class="cdot bl"></div>
    <div class="cdot br"></div>
  </div>
  <div class="top-flourish">
    <div class="fl-line-l"></div>
    <div class="fl-dot"></div>
    <div class="fl-dot"></div>
    <div class="fl-dot"></div>
    <div class="fl-line-r"></div>
  </div>
  <div class="bottom-flourish">
    <div class="fl-line-l" style="width:80px;"></div>
    <div class="fl-dot"></div>
    <div class="fl-line-r" style="width:80px;"></div>
  </div>
  <div class="content">
    <div class="header-row">
      <div class="header-left">
        <div class="est-label">Est. 2024</div>
        <div class="org-name">Private University National Association of Bangladesh</div>
      </div>
      <div class="logo-center"><img src="${c.logoUrl}" alt="PUNAB Logo" /></div>
      <div class="header-right">
        <div class="certno-label">Certificate No.</div>
        <div class="certno-val">${c.certificateNumber}</div>
      </div>
    </div>
    <div class="diamond-divider">
      <div class="line" style="width:140px;"></div>
      <div class="dot"></div>
      <div class="diamond"></div>
      <div class="dot"></div>
      <div class="line" style="width:140px;"></div>
    </div>
    <div class="title-block">
      <div class="cert-of">Certificate of</div>
      <div class="cert-title">Appreciation</div>
    </div>
    <div class="content-main">
      <div class="body-block">
        <div class="recognition-label">In grateful recognition of</div>
        <div class="recipient-name">${c.recipientName}</div>
        <div class="recipient-underline"></div>
        ${recipientMeta}
      </div>
      <div class="reason-block">
        <div class="reason-text">${c.reason}</div>
      </div>
      ${periodBlock}
    </div>
    <div class="cert-footer">
      <div class="sig-group">
        <div class="sig-col">
          ${sig1}
          <div class="sig-line"></div>
          <div class="sig-name">${c.signatoryName1}</div>
          <div class="sig-desig">${c.signatoryDesignation1}</div>
        </div>
      </div>
      <div class="qr-block">
        <img src="${c.qrCode}" alt="Verify certificate QR code" />
        <div class="qr-label">Verify this certificate by scanning the QR code</div>
        <div class="qr-url">${c.verificationUrl}</div>
      </div>
      <div class="meta-block">
        <div class="meta-date-label">Issue Date</div>
        <div class="meta-date">${c.issueDate}</div>
        <div class="meta-certno">${c.certificateNumber}</div>
      </div>
    </div>
    <div class="tagline"><span>Unity · Mobilizing · Progress</span></div>
  </div>
</div>`;
  }

  return null;
}

function renderPageHtml(template: CertificateTemplate, htmlContent: string): string {
  const css = template.cssContent ?? "";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @page { size: A4 landscape; margin: 0; }
      html, body {
        margin: 0;
        padding: 0;
        width: 1122px;
        height: 794px;
        overflow: hidden;
      }
      body > * {
        width: 1122px;
        height: 794px;
        overflow: hidden;
      }
      ${css}
    </style>
  </head>
  <body>${htmlContent}</body>
</html>`;
}

export function buildTemplateContext(input: {
  certificate: Certificate;
  verificationUrl: string;
  qrCode: string;
  logoUrl: string;
  signatorySignature1Src?: string;
  signatorySignature2Src?: string;
}): CertificateTemplateContext {
  const c = input.certificate;
  return {
    logoUrl: input.logoUrl,
    certificateTitle: c.certificateTitle,
    certificateSubtitle: c.certificateType,
    recipientName: c.recipientName,
    reason: c.reason,
    eventName: c.eventName ?? "",
    role: c.role ?? "",
    achievement: c.achievement ?? "",
    universityName: c.universityName ?? "",
    timePeriod: c.timePeriod ?? "",
    issueDate: new Date(c.issueDate).toLocaleDateString("en-GB"),
    issueDateLong: new Date(c.issueDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    certificateNumber: c.certificateNumber,
    verificationUrl: input.verificationUrl,
    qrCode: input.qrCode,
    signatoryName1: c.signatoryName1 ?? "",
    signatoryDesignation1: c.signatoryDesignation1 ?? "",
    signatoryName2: c.signatoryName2 ?? "",
    signatoryDesignation2: c.signatoryDesignation2 ?? "",
    signatorySignature1Src: input.signatorySignature1Src ?? "",
    signatorySignature2Src: input.signatorySignature2Src ?? "",
  };
}

export function renderCertificateHtml(template: CertificateTemplate, context: CertificateTemplateContext): string {
  const builtIn = renderBuiltInTemplate(template.slug, context);
  if (builtIn) {
    return renderPageHtml(template, builtIn);
  }
  const compiled = Handlebars.compile(template.htmlContent);
  const html = compiled(context);
  return renderPageHtml(template, html);
}

const PREVIEW_QR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

function mockCertificateForPreview(): Certificate {
  const issueDate = new Date().toISOString();
  return {
    id: "00000000-0000-0000-0000-000000000000",
    certificateNumber: "PUNAB-PREVIEW-0001",
    certificateTitle: "Certificate of Appreciation",
    certificateType: "Appreciation",
    recipientName: "Kazi Rohanuzzaman Mehal",
    recipientEmail: "recipient@example.com",
    universityName: "Daffodil International University",
    eventName: "Annual Leadership Summit",
    role: "Volunteer",
    achievement: "Outstanding contribution",
    timePeriod: "Jan – Dec 2026",
    reason: "In recognition of dedicated service and leadership within the community.",
    issueDate,
    templateId: null,
    pdfUrl: null,
    verificationUrl: "https://example.org/verify/preview",
    status: "DRAFT",
    signatoryName1: "Jordan Smith",
    signatoryDesignation1: "President",
    signatoryName2: null,
    signatoryDesignation2: null,
    signatorySignature1Url: null,
    signatorySignature2Url: null,
    customFields: null,
    emailSentAt: null,
    revokedAt: null,
    revokedReason: null,
    createdById: null,
    createdAt: issueDate,
    updatedAt: issueDate,
  };
}

/** Admin template picker: same render path as issued PDFs, with sample data. */
export function renderCertificateTemplatePreviewHtml(template: CertificateTemplate, logoSrc: string): string {
  const certificate = mockCertificateForPreview();
  return renderCertificateHtml(
    template,
    buildTemplateContext({
      certificate,
      verificationUrl: certificate.verificationUrl ?? "",
      qrCode: PREVIEW_QR_PLACEHOLDER,
      logoUrl: logoSrc,
      signatorySignature1Src: "",
      signatorySignature2Src: "",
    }),
  );
}
