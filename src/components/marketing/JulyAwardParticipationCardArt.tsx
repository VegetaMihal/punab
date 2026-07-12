"use client";

import { PUNAB_LOGO_SRC } from "@/components/layout/logo";
import { julyAward2026ParticipationCardLedger } from "@/lib/july-award-2026-event";
import type { JulyAwardParticipationTheme } from "@/lib/marketing/july-award-participation-card-themes";

export type JulyAwardParticipationCardArtProps = {
  theme: JulyAwardParticipationTheme;
  clubName: string;
  universityName: string;
  partnerNo: string;
  logoUrl: string | null;
  showLogoPlaceholder: boolean;
  displayClass: string;
  bodyClass: string;
  serifClass: string;
  monoClass: string;
};

function ClubLogoRing({
  theme,
  logoUrl,
  showPlaceholder,
}: {
  theme: JulyAwardParticipationTheme;
  logoUrl: string | null;
  showPlaceholder: boolean;
}) {
  const size = 300;
  return (
    <LogoRingInner theme={theme} size={size} logoUrl={logoUrl} showPlaceholder={showPlaceholder} />
  );
}

function LogoRingInner({
  theme,
  size,
  logoUrl,
  showPlaceholder,
}: {
  theme: JulyAwardParticipationTheme;
  size: number;
  logoUrl: string | null;
  showPlaceholder: boolean;
}) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `1.5px solid ${theme.green}` }} />
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%", border: `2.5px solid ${theme.red}`, background: theme.paper,
        boxShadow: `0 30px 60px -20px rgba(14,18,15,0.25), 0 0 0 1px ${theme.paperDeep} inset`,
      }}>
        <div style={{
          position: "absolute", inset: 14, borderRadius: "50%", background: theme.paper, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {logoUrl ? (
            <img src={logoUrl} alt="" style={{ width: "80%", height: "80%", objectFit: "contain", display: "block" }} />
          ) : showPlaceholder ? (
            <div style={{ textAlign: "center", color: theme.inkSoft, fontSize: 15, fontWeight: 700, letterSpacing: ".18em", textTransform: "uppercase" }}>Club logo</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function VerifiedSeal({ theme, size = 96 }: { theme: JulyAwardParticipationTheme; size?: number }) {
  const R = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block" }}>
      <defs>
        <path id="punab-vs-top" d={`M ${R*0.22} ${R} A ${R*0.78} ${R*0.78} 0 0 1 ${size-R*0.22} ${R}`} />
        <path id="punab-vs-bot" d={`M ${R*0.3} ${R} A ${R*0.7} ${R*0.7} 0 0 0 ${size-R*0.3} ${R}`} />
      </defs>
      <circle cx={R} cy={R} r={R-2} fill="none" stroke={theme.red} strokeWidth="2"/>
      <circle cx={R} cy={R} r={R-9} fill="none" stroke={theme.red} strokeWidth="0.6" opacity="0.7"/>
      <text fill={theme.red} fontFamily="'Manrope', sans-serif"
        fontSize={size*0.085} fontWeight="700" letterSpacing="0.34em">
        <textPath href="#punab-vs-top" startOffset="50%" textAnchor="middle">
          PUNAB · OFFICIAL
        </textPath>
      </text>
      <text fill={theme.red} fontFamily="'Manrope', sans-serif"
        fontSize={size*0.07} fontWeight="600" letterSpacing="0.42em" opacity="0.85">
        <textPath href="#punab-vs-bot" startOffset="50%" textAnchor="middle">
          ★  2026  ★
        </textPath>
      </text>
      {/* center checkmark */}
      <circle cx={R} cy={R} r={R*0.42} fill="none" stroke={theme.red} strokeWidth="1"/>
      <path d={`M ${R-R*0.22} ${R} L ${R-R*0.04} ${R+R*0.18} L ${R+R*0.26} ${R-R*0.18}`}
        fill="none" stroke={theme.red} strokeWidth={size*0.05} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Main Card ───────────────────────────────────────────────────────────────
export function JulyAwardParticipationCardArt({
  theme,
  clubName,
  universityName,
  partnerNo,
  logoUrl,
  showLogoPlaceholder,
  displayClass,
  bodyClass,
  serifClass,
  monoClass,
}: JulyAwardParticipationCardArtProps) {
  const ledger = julyAward2026ParticipationCardLedger();
  return (
    <div id="july-participation-card-root" style={{
      position: "relative",
      width: 1080, height: 1350, overflow: "hidden",
      color: theme.ink,
      fontFamily: "'Manrope', system-ui, sans-serif",
      background: theme.paper,
    }}>
      {/* Subtle paper texture */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`,
        mixBlendMode: "multiply", opacity: 0.6, pointerEvents: "none",
      }} />

      {/* Outer green frame */}
      <div style={{
        position: "absolute", inset: 28,
        border: `2px solid ${theme.green}`,
        pointerEvents: "none",
      }} />
      {/* Inner red hairline */}
      <div style={{
        position: "absolute", inset: 38,
        border: `0.75px solid ${theme.red}`,
        opacity: 0.55,
        pointerEvents: "none",
      }} />
      {/* Corner crosses (flag-color accents) */}
      {[[38,38,0],[1042,38,1],[38,1312,2],[1042,1312,3]].map(([x,y,i]) => (
        <svg key={i} width="20" height="20" viewBox="0 0 20 20"
          style={{ position: "absolute", left: x-10, top: y-10 }}>
          <line x1="10" y1="2" x2="10" y2="18" stroke={theme.red} strokeWidth="1.5" />
          <line x1="2" y1="10" x2="18" y2="10" stroke={theme.green} strokeWidth="1.5" />
        </svg>
      ))}

      {/* === TOP : PUNAB lockup (hero brand position) === */}
      <div style={{
        position: "absolute", top: 76, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 18,
      }}>
        {/* Tiny eyebrow */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14,
          fontFamily: "'Manrope', sans-serif",
          fontSize: 11, fontWeight: 700, letterSpacing: ".42em",
          color: theme.green, textTransform: "uppercase",
        }}>
          <span style={{ width: 28, height: 1, background: theme.green }} />
          <span>Presented&nbsp;By</span>
          <span style={{ width: 28, height: 1, background: theme.green }} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={typeof window !== "undefined" ? `${window.location.origin}${PUNAB_LOGO_SRC}` : PUNAB_LOGO_SRC}
          alt=""
          style={{ height: 110, width: "auto", display: "block" }}
        />
        {/* Org tagline */}
        <div style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 10.5, fontWeight: 600, letterSpacing: ".34em",
          color: theme.inkSoft, textTransform: "uppercase",
        }}>
          Private University National Association of Bangladesh
        </div>
      </div>

      {/* Decorative red/green divider */}
      <div style={{
        position: "absolute", top: 282, left: 120, right: 120,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ flex: 1, height: 1, background: theme.green, opacity: 0.4 }} />
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.red }} />
        <div style={{ flex: 1, height: 1, background: theme.green, opacity: 0.4 }} />
      </div>

      {/* === HERO MESSAGE === */}
      <div style={{
        position: "absolute", top: 323, left: 0, right: 0, textAlign: "center",
      }}>
        <div style={{
          marginTop: 6,
          fontFamily: "'Bricolage Grotesque', 'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: 104, lineHeight: 0.9, letterSpacing: "-.03em",
          color: theme.green, textTransform: "uppercase",
        }}>
          Appreciation
        </div>
        <div style={{
          fontFamily: "'Bricolage Grotesque', 'Manrope', sans-serif",
          fontWeight: 800,
          fontSize: 104, lineHeight: 0.9, letterSpacing: "-.03em",
          color: theme.red, textTransform: "uppercase",
          marginTop: 2,
        }}>
          Partner
        </div>
      </div>

      {/* === Award sub-line === */}
      <div style={{
        position: "absolute", top: 564, left: 0, right: 0, textAlign: "center",
      }}>
        <div style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 13, fontWeight: 700, letterSpacing: ".42em",
          color: theme.ink, opacity: 0.7, textTransform: "uppercase",
        }}>
          July Uprising Memorial Award · 2026
        </div>
      </div>

      {/* === SUPPORTING PARAGRAPH (italic) === */}
      <div style={{
        position: "absolute", top: 612, left: 156, right: 156, textAlign: "center",
      }}>
        <div
          className={serifClass}
          style={{
            fontStyle: "italic",
            fontSize: 22,
            lineHeight: 1.45,
            color: theme.inkSoft,
            fontWeight: 500,
          }}
        >
          Our application has been submitted, and we are proud to be recognized as an
          Appreciation Partner of the&nbsp;July&nbsp;Uprising&nbsp;Memorial&nbsp;Award&nbsp;2026.
        </div>
      </div>

      {/* === CLUB ROW : logo + name === */}
      <div style={{
        position: "absolute", top: 800, left: 80, right: 80,
        display: "flex", alignItems: "center", gap: 36,
      }}>
        <ClubLogoRing theme={theme} logoUrl={logoUrl} showPlaceholder={showLogoPlaceholder} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 11, fontWeight: 700, letterSpacing: ".42em",
            color: theme.red, textTransform: "uppercase", marginBottom: 10,
          }}>— Appreciation Partner —</div>
          <div className={displayClass} style={{ fontWeight: 800, fontSize: 44, lineHeight: 0.98, letterSpacing: "-.015em", color: theme.ink, wordBreak: "break-word" }}>{clubName || "—"}</div>
          <div style={{
            height: 1, background: theme.green, opacity: 0.4,
            marginTop: 16, marginBottom: 14, width: 80,
          }} />
          <div className={bodyClass} style={{ fontSize: 16, fontWeight: 700, letterSpacing: ".24em", color: theme.green, textTransform: "uppercase" }}>{universityName}</div>
        </div>
      </div>

      {/* === Verified seal (floating, top-right of club row) === */}
      <div style={{
        position: "absolute", top: 752, right: 56, transform: "rotate(8deg)", zIndex: 4,
      }}>
        <VerifiedSeal theme={theme} size={96} />
      </div>

      {/* === Decorative red/green divider above ledger === */}
      <div style={{
        position: "absolute", bottom: 200, left: 100, right: 100,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ flex: 1, height: 1, background: theme.green, opacity: 0.4 }} />
        <div style={{ width: 8, height: 8, transform: "rotate(45deg)", background: theme.red }} />
        <div style={{ flex: 1, height: 1, background: theme.green, opacity: 0.4 }} />
      </div>

      {/* === INFO LEDGER (3 columns) === */}
      <div style={{
        position: "absolute", bottom: 112, left: 80, right: 80,
        display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
        alignItems: "center", gap: 0,
      }}>
        {/* Partner N° */}
        <div style={{ textAlign: "center", padding: "0 12px" }}>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 10, fontWeight: 700, letterSpacing: ".38em",
            color: theme.green, textTransform: "uppercase",
          }}>Partner N°</div>
          <div className={monoClass} style={{ marginTop: 8, fontSize: 16, fontWeight: 700, color: theme.ink, letterSpacing: ".06em" }}>{partnerNo}</div>
        </div>
        <div style={{ background: theme.inkSoft, opacity: 0.2, height: 36 }} />
        {/* Date */}
        <div style={{ textAlign: "center", padding: "0 12px" }}>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 10, fontWeight: 700, letterSpacing: ".38em",
            color: theme.green, textTransform: "uppercase",
          }}>Date</div>
          <div style={{
            marginTop: 8,
            fontFamily: "'Bricolage Grotesque', 'Manrope', sans-serif",
            fontSize: 18, fontWeight: 700, color: theme.ink,
          }}>{ledger.dateLabel}</div>
        </div>
        <div style={{ background: theme.inkSoft, opacity: 0.2, height: 36 }} />
        {/* Venue */}
        <div style={{ textAlign: "center", padding: "0 12px" }}>
          <div style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 10, fontWeight: 700, letterSpacing: ".38em",
            color: theme.green, textTransform: "uppercase",
          }}>Venue</div>
          <div style={{
            marginTop: 8,
            fontFamily: "'Bricolage Grotesque', 'Manrope', sans-serif",
            fontSize: 16, fontWeight: 700, color: theme.ink,
            whiteSpace: "nowrap",
          }}>{ledger.venueLabel}</div>
        </div>
      </div>

      {/* === Bottom flag stripe === */}
      <div style={{
        position: "absolute", bottom: 56, left: 80, right: 80,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ flex: 1, height: 3, background: theme.green }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: theme.red }} />
        <div style={{ flex: 1, height: 3, background: theme.green }} />
      </div>
      <div style={{
        position: "absolute", bottom: 28, left: 0, right: 0, textAlign: "center",
        fontFamily: "'Manrope', sans-serif",
        fontSize: 9, fontWeight: 700, letterSpacing: ".48em",
        color: theme.inkSoft, opacity: 0.7, textTransform: "uppercase",
      }}>
        PUNAB · Unity · Mobilizing · Progress
      </div>
    </div>
  );
}

