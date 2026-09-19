---
name: PUNAB
description: Dark green painted wall, chalk brush lettering, crimson paint, taped paper sheets.
colors:
  wall-green: "#0f3b2e"
  chalk: "#efeae0"
  chalk-dim: "#b9b3a6"
  paint-red: "#e02a48"
  crimson: "#c41e3a"
  nav-crimson: "#b01c34"
  nav-crimson-deep: "#8f1629"
  ink-red: "#a5182f"
  paper: "#e9e6dc"
  paper-plate: "#d8d2c3"
  ink: "#1b1a17"
  ink-soft: "#3a382f"
  select-green: "#1f8a5b"
  line-green: "#2fb26f"
typography:
  display:
    fontFamily: "Atma, cursive"
    fontSize: "clamp(3rem, 10vw, 4.75rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  headline:
    fontFamily: "Atma, cursive"
    fontSize: "clamp(1.875rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Anek Bangla, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Anek Bangla, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
    letterSpacing: "0.04em"
rounded:
  none: "0px"
spacing:
  section: "64px"
  section-lg: "96px"
  gutter: "20px"
components:
  wall-btn:
    backgroundColor: "{colors.crimson}"
    textColor: "{colors.chalk}"
    rounded: "{rounded.none}"
  wall-btn-chalk:
    backgroundColor: "{colors.chalk}"
    textColor: "{colors.ink-red}"
    rounded: "{rounded.none}"
  wall-sheet:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "32px 24px 24px"
---

# Design System: PUNAB

## Overview

**Creative North Star: "July Wall Writing"**

A student wall in July 2024: painted green, lettered by hand in chalk and crimson, real photos taped up as paper sheets. The site reads as that wall, not a corporate template. Mood: urgent, communal, proud, hand-made. Bangla and English sit side by side and both get brush treatment.

Photos lead. Real event photography is the main evidence; the UI is the wall around it. Everything is flat and sharp: no gradients, no glass, no rounded cards. Depth comes only from paper sheets tilted and taped to the wall.

**Key Characteristics:**
- One flat green ground everywhere; sections never change green.
- Chalk-white brush headlines (Atma), dim-chalk body (Anek Bangla).
- Crimson is paint: nav, CTA band, wave lines, underlines, numerals.
- Content on tilted paper sheets with tape, never on cards.
- Red wave dividers whose crimson line draws itself left to right.

## Colors

Two-colour wall (green + crimson, from the PUNAB logo) with chalk and paper neutrals.

### Primary
- **Wall Green** (#0f3b2e): the single page ground. Sections, footer, wave fills. Never varied per section.
- **Crimson Paint** (#c41e3a): CTA band, wave line stroke, buttons, sheet underlines.

### Secondary
- **Nav Crimson** (#b01c34) with **Deep Crimson** (#8f1629): header bar, dropdown and mobile sheet.
- **Paint Red** (#e02a48): stripes and highlights on the wall.

### Tertiary
- **Selection Green** (#1f8a5b): text selection on the wall and nav (white text). Footer selection is crimson (#c41e3a) instead.
- **Line Green** (#2fb26f): the underline drawn under the join headline on the crimson band.

### Neutral
- **Chalk** (#efeae0): headlines and primary text on green.
- **Chalk Dim** (#b9b3a6): body copy on green.
- **Paper** (#e9e6dc), **Paper Plate** (#d8d2c3): sheet surface and inset plates.
- **Ink** (#1b1a17), **Ink Soft** (#3a382f), **Ink Red** (#a5182f): text on paper; role links in ink red.

### Named Rules
**The One Green Rule.** All section grounds are exactly #0f3b2e. No texture, no gradient, no lighter band. Seams at waves must vanish.
**The Red Moves Rule.** In wave animations only the crimson line moves; the green fill stays static.

## Typography

**Display Font:** Atma 700 (cursive fallback), var `--font-wall-brush`
**Body Font:** Anek Bangla (sans-serif fallback), var `--font-wall-text`

**Character:** Handpainted brush headlines against a clean Bangla-first sans. h1/h2 in the public zone are forced to the brush font with an SVG roughen filter (`#wall-rough`).

### Hierarchy
- **Display** (700, clamp 3rem to 4.75rem, 1.25): hero Bangla line, one per page.
- **Headline** (700, 1.875 to 3rem, 1.25): section h2s, chalk.
- **Body** (400, 1.125rem, 1.625, max 52 to 62ch): dim chalk on green, ink soft on paper.
- **Label** (800, 0.875rem, +0.04em, uppercase): forum links, kicker text.

### Named Rules
**The No Drips Rule.** Brush lettering is clean. No blood-drip or splatter effects on headlines.

## Layout

Marketing container, two-column asymmetric grids (1.1fr / 0.9fr, 1.3fr / 1fr) that collapse to one column on mobile. Section rhythm 64px mobile, 96px desktop. Wave dividers (h-14 mobile, h-20 desktop) between sections. Hero: single photo slider on top (34svh mobile, 46svh desktop), Bangla line left, English title and CTAs right.

## Elevation & Depth

Flat. No shadows on the wall. Depth is only paper sheets: tilted (-2 to 2 degrees), taped with pseudo-element tape, lifting straight on hover (translateY -3px, rotate 0). Photo sheets carry no captions.

### Named Rules
**The Tape Rule.** Anything lifted off the wall is a taped paper sheet. No floating cards.

## Shapes

Sharp. Radius tokens are zero across the public zone (`.wall-site`). Waves are the only curve: a 1440x200 cubic S-curve fill plus a 24-unit crimson stroke.

## Components

### Buttons
- **Primary (wall-btn):** crimson fill, chalk text, square corners.
- **Chalk (wall-btn--chalk):** chalk fill, ink-red text; used on crimson band and in nav.
- **Link (wall-link):** chalk text, crimson underline.

### Cards / Containers (Sheets)
Paper background, ink text, 4:5 photo, ink name, crimson underlined role, tape, tilt cycle by index. Forum cards add an enter link with a 3px crimson underline.

### Navigation
Crimson bar (#b01c34), chalk labels, chalk underline on active, chalk Join button with red text. Dropdown and mobile sheet #8f1629.

### Footer
Green ground, chalk links, logo on a light plate. Top edge: crimson wave (join page) or drawn red line elsewhere. Text selection crimson.

### Wave Ribbon (signature)
Static green fill, crimson stroke drawn left to right on scroll (`.wave-line`, pathLength 1, dash offset). Reduced motion: fully static.

## Do's and Don'ts

### Do:
- **Do** keep every section ground #0f3b2e.
- **Do** put photos on paper sheets, no captions.
- **Do** animate only the red line in waves; reduced-motion shows all static.
- **Do** use literal on-brand text colour (#fffaf2) on brand-filled buttons, since tokens remap dark.

### Don't:
- **Don't** add gradients, textures, glass or rounded cards.
- **Don't** add drips to headlines.
- **Don't** animate the green in waves.
- **Don't** make the whole footer crimson; only its selection.
- **Don't** restyle admin, dashboard or BloodHero zones with this world (out of scope).
