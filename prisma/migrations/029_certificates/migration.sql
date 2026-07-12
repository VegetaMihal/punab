-- Create certificate generator tables and seed default templates.

CREATE TABLE IF NOT EXISTS "CertificateTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "type" TEXT,
  "htmlContent" TEXT NOT NULL,
  "cssContent" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CertificateTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Certificate" (
  "id" TEXT NOT NULL,
  "certificateNumber" TEXT NOT NULL,
  "certificateTitle" TEXT NOT NULL,
  "certificateType" TEXT NOT NULL,
  "recipientName" TEXT NOT NULL,
  "recipientEmail" TEXT,
  "universityName" TEXT,
  "eventName" TEXT,
  "role" TEXT,
  "achievement" TEXT,
  "timePeriod" TEXT,
  "reason" TEXT NOT NULL,
  "issueDate" TIMESTAMPTZ(6) NOT NULL,
  "templateId" TEXT,
  "pdfUrl" TEXT,
  "verificationUrl" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "signatoryName1" TEXT,
  "signatoryDesignation1" TEXT,
  "signatoryName2" TEXT,
  "signatoryDesignation2" TEXT,
  "customFields" JSONB,
  "emailSentAt" TIMESTAMPTZ(6),
  "revokedAt" TIMESTAMPTZ(6),
  "revokedReason" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CertificateEmailLog" (
  "id" TEXT NOT NULL,
  "certificateId" TEXT NOT NULL,
  "recipientEmail" TEXT NOT NULL,
  "subject" TEXT,
  "status" TEXT NOT NULL,
  "sentAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CertificateEmailLog_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Certificate_certificateNumber_key') THEN
    CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'CertificateTemplate_slug_key') THEN
    CREATE UNIQUE INDEX "CertificateTemplate_slug_key" ON "CertificateTemplate"("slug");
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'Certificate_templateId_fkey'
      AND table_name = 'Certificate'
  ) THEN
    ALTER TABLE "Certificate"
      ADD CONSTRAINT "Certificate_templateId_fkey"
      FOREIGN KEY ("templateId") REFERENCES "CertificateTemplate"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'CertificateEmailLog_certificateId_fkey'
      AND table_name = 'CertificateEmailLog'
  ) THEN
    ALTER TABLE "CertificateEmailLog"
      ADD CONSTRAINT "CertificateEmailLog_certificateId_fkey"
      FOREIGN KEY ("certificateId") REFERENCES "Certificate"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

INSERT INTO "CertificateTemplate" ("id", "name", "slug", "type", "htmlContent", "cssContent", "isActive")
VALUES
  (
    'cert_tpl_official',
    'PUNAB Official',
    'official',
    'official',
    '<div class="certificate cert-official"><div class="leftRail"><div class="diamond"></div><div class="railText">Unity • Mobilizing • Progress</div><div class="diamond"></div></div><div class="content"><img class="logo" src="{{logoUrl}}" alt="PUNAB"><h1>{{certificateTitle}}</h1><p class="recipient">Presented to <span>{{recipientName}}</span></p><p class="reason">{{reason}}</p><p class="meta">{{eventName}} {{role}} {{achievement}} {{universityName}} {{timePeriod}}</p><div class="bottom"><div><strong>No:</strong> {{certificateNumber}}</div><div><strong>Date:</strong> {{issueDate}}</div><div><img src="{{qrCode}}" width="62" height="62" alt="QR"></div></div><div class="signs"><div><p>{{signatoryName1}}</p><small>{{signatoryDesignation1}}</small></div><div><p>{{signatoryName2}}</p><small>{{signatoryDesignation2}}</small></div></div><p class="verify">{{verificationUrl}}</p></div></div>',
    '@import url(''https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Lato:wght@400;700&display=swap'');@page { size: A4 landscape; margin: 0; }.certificate { width: 1122px; height: 794px; overflow: hidden; box-sizing: border-box; position: relative; color: #1a1a1a; }.certificate h1 { font-family: ''Playfair Display'', serif; letter-spacing: 1px; margin: 0; }.certificate .recipient,.certificate .reason,.certificate .meta { font-family: ''Cormorant Garamond'', serif; }.certificate .verify,.certificate small,.certificate .bottom { font-family: ''Lato'', sans-serif; }.cert-official { display: flex; background: #fff; }.cert-official .leftRail { width: 80px; background: #0e3318; color: rgba(255,255,255,0.35); display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 28px 0; }.cert-official .diamond { width: 12px; height: 12px; transform: rotate(45deg); background: #d4ae4a; }.cert-official .railText { writing-mode: vertical-rl; transform: rotate(180deg); letter-spacing: 3px; font-size: 10px; text-transform: uppercase; }.cert-official .content { flex: 1; padding: 56px 72px 48px; }.cert-official .logo { width: 150px; height: auto; }.cert-official .recipient { font-size: 34px; margin: 26px 0 8px; }.cert-official .recipient span { border-bottom: 1px solid #b8932a; }.cert-official .reason { font-size: 27px; margin: 0; }.cert-official .meta { margin-top: 20px; font-size: 20px; color: #444; }.cert-official .bottom { margin-top: 34px; display: flex; justify-content: space-between; align-items: center; }.cert-official .signs { margin-top: 34px; display: grid; grid-template-columns: 1fr 1fr; gap: 36px; text-align: center; }',
    true
  ),
  (
    'cert_tpl_event',
    'PUNAB Event',
    'event',
    'event',
    '<div class="certificate cert-event"><div class="header"><div class="logoPill"><img class="logo" src="{{logoUrl}}" alt="PUNAB"></div><div class="headerTitle">{{certificateTitle}}</div></div><div class="redStripe"></div><div class="body"><p class="recipient">{{recipientName}}</p><p class="reason">{{reason}}</p><p class="meta">{{eventName}} • {{role}} • {{achievement}}</p><p class="meta">{{universityName}} • {{timePeriod}}</p><div class="footer"><div>{{certificateNumber}}</div><div>{{issueDate}}</div><img src="{{qrCode}}" width="62" height="62" alt="QR"></div><div class="signs"><div>{{signatoryName1}}<br><small>{{signatoryDesignation1}}</small></div><div>{{signatoryName2}}<br><small>{{signatoryDesignation2}}</small></div></div><p class="verify">{{verificationUrl}}</p></div></div>',
    '@import url(''https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Lato:wght@400;700&display=swap'');@page { size: A4 landscape; margin: 0; }.certificate { width: 1122px; height: 794px; overflow: hidden; box-sizing: border-box; position: relative; color: #1a1a1a; }.certificate h1 { font-family: ''Playfair Display'', serif; letter-spacing: 1px; margin: 0; }.certificate .recipient,.certificate .reason,.certificate .meta { font-family: ''Cormorant Garamond'', serif; }.certificate .verify,.certificate small,.certificate .bottom { font-family: ''Lato'', sans-serif; }.cert-event { background: #fff; }.cert-event .header { height: 108px; background: #0e3318; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 0 44px; }.cert-event .logoPill { background: rgba(255,255,255,0.92); border-radius: 6px; padding: 7px 10px; }.cert-event .logo { height: 52px; width: auto; }.cert-event .headerTitle { font-family: ''Playfair Display'', serif; letter-spacing: 3px; text-transform: uppercase; font-size: 28px; }.cert-event .redStripe { height: 8px; background: #c0392b; }.cert-event .body { padding: 54px 72px 42px; text-align: center; }.cert-event .recipient { margin: 0; font-size: 60px; font-weight: 600; color: #1b5e2e; }.cert-event .reason { margin: 22px auto 0; font-size: 28px; max-width: 900px; }.cert-event .meta { margin: 10px 0 0; font-size: 20px; color: #444; }.cert-event .footer { margin-top: 30px; display: flex; justify-content: space-between; align-items: center; }.cert-event .signs { margin-top: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 36px; }',
    true
  ),
  (
    'cert_tpl_achievement',
    'PUNAB Achievement',
    'achievement',
    'achievement',
    '<div class="certificate cert-achievement"><div class="topPanel"></div><div class="frame"></div><div class="content"><img class="logo" src="{{logoUrl}}" alt="PUNAB"><div class="badge">Achievement</div><h1>{{certificateTitle}}</h1><p class="recipient">{{recipientName}}</p><p class="reason">{{reason}}</p><p class="meta">{{achievement}} • {{eventName}} • {{timePeriod}}</p><p class="meta">{{universityName}} • {{role}}</p><div class="footer"><span>{{certificateNumber}}</span><span>{{issueDate}}</span><img src="{{qrCode}}" width="62" height="62" alt="QR"></div><div class="signs"><div>{{signatoryName1}}<br><small>{{signatoryDesignation1}}</small></div><div>{{signatoryName2}}<br><small>{{signatoryDesignation2}}</small></div></div><p class="verify">{{verificationUrl}}</p></div></div>',
    '@import url(''https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Lato:wght@400;700&display=swap'');@page { size: A4 landscape; margin: 0; }.certificate { width: 1122px; height: 794px; overflow: hidden; box-sizing: border-box; position: relative; color: #1a1a1a; }.certificate h1 { font-family: ''Playfair Display'', serif; letter-spacing: 1px; margin: 0; }.certificate .recipient,.certificate .reason,.certificate .meta { font-family: ''Cormorant Garamond'', serif; }.certificate .verify,.certificate small,.certificate .bottom { font-family: ''Lato'', sans-serif; }.cert-achievement { background: #faf7f0; }.cert-achievement .topPanel { position: absolute; inset: 0 0 auto 0; height: 300px; background: linear-gradient(160deg, #0e3318 0%, #1b5e2e 100%); }.cert-achievement .frame { position: absolute; inset: 12px; border: 1.5px solid #b8932a; }.cert-achievement .content { position: relative; z-index: 2; padding: 58px 74px 46px; text-align: center; color: #1a1a1a; }.cert-achievement .logo { height: 58px; width: auto; }.cert-achievement .badge { display: inline-block; margin-top: 20px; padding: 8px 20px; border-radius: 9999px; background: #f0cc6e; color: #0e3318; font-family: ''Lato'', sans-serif; font-weight: 700; letter-spacing: .7px; text-transform: uppercase; }.cert-achievement h1 { margin-top: 24px; color: #fff; font-size: 52px; }.cert-achievement .recipient { margin: 44px 0 0; font-size: 50px; color: #1b5e2e; }.cert-achievement .reason { font-size: 28px; margin: 18px auto 0; max-width: 900px; }.cert-achievement .meta { margin: 8px 0 0; font-size: 20px; color: #3d3d3d; }.cert-achievement .footer { margin-top: 26px; display: flex; justify-content: space-between; align-items: center; }',
    true
  ),
  (
    'cert_tpl_appreciation',
    'PUNAB Appreciation',
    'appreciation',
    'appreciation',
    '<div class="certificate cert-appreciation"><div class="triple"></div><div class="content"><img class="logo" src="{{logoUrl}}" alt="PUNAB"><h1>{{certificateTitle}}</h1><p class="recipient">{{recipientName}}</p><p class="reason">{{reason}}</p><p class="meta">{{eventName}} • {{role}} • {{universityName}}</p><p class="meta">{{achievement}} • {{timePeriod}}</p><div class="footer"><span>{{certificateNumber}}</span><span>{{issueDate}}</span><img src="{{qrCode}}" width="62" height="62" alt="QR"></div><div class="signs"><div>{{signatoryName1}}<br><small>{{signatoryDesignation1}}</small></div><div>{{signatoryName2}}<br><small>{{signatoryDesignation2}}</small></div></div><p class="verify">{{verificationUrl}}</p></div></div>',
    '@import url(''https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Lato:wght@400;700&display=swap'');@page { size: A4 landscape; margin: 0; }.certificate { width: 1122px; height: 794px; overflow: hidden; box-sizing: border-box; position: relative; color: #1a1a1a; }.certificate h1 { font-family: ''Playfair Display'', serif; letter-spacing: 1px; margin: 0; }.certificate .recipient,.certificate .reason,.certificate .meta { font-family: ''Cormorant Garamond'', serif; }.certificate .verify,.certificate small,.certificate .bottom { font-family: ''Lato'', sans-serif; }.cert-appreciation { background: #faf7f0; }.cert-appreciation::before { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 50% at 50% 0%, #f5f0e8 0%, #faf7f0 100%); }.cert-appreciation .triple { position: absolute; inset: 14px; border: 1.5px solid #b8932a; box-shadow: inset 0 0 0 5px rgba(184,147,42,0.44), inset 0 0 0 10px rgba(184,147,42,0.2); }.cert-appreciation .content { position: relative; z-index: 2; padding: 58px 74px 42px; text-align: center; }.cert-appreciation .logo { height: 58px; width: auto; }.cert-appreciation h1 { margin-top: 24px; font-size: 56px; color: #1b5e2e; }.cert-appreciation .recipient { margin: 32px 0 0; font-size: 54px; color: #0e3318; }.cert-appreciation .reason { margin: 20px auto 0; font-size: 30px; max-width: 900px; }.cert-appreciation .meta { margin: 8px 0 0; font-size: 21px; color: #4f4f4f; }.cert-appreciation .footer { margin-top: 22px; display: flex; justify-content: space-between; align-items: center; } .cert-appreciation .signs { margin-top: 22px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }',
    true
  )
ON CONFLICT ("slug") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "type" = EXCLUDED."type",
  "htmlContent" = EXCLUDED."htmlContent",
  "cssContent" = EXCLUDED."cssContent",
  "isActive" = EXCLUDED."isActive",
  "updatedAt" = CURRENT_TIMESTAMP;
