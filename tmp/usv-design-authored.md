# USAvionix — Reference Design System

## Overview

USAvionix.com is a defense-tech command deck: a full-bleed, near-black tactical
canvas where almost every surface is either deep void black or a translucent white
overlay floating above it. The home page opens on a cinematic terrain flyover — a
live canvas animation of a jet drone gliding over dark topography — wrapped in a
dense HUD of mono type: a thermal sensor scale, a live detection list with jittering
confidence percentages, and a boot-sequence terminal that types out telemetry lines.
Only after this machine atmosphere settles does the editorial layer appear: a
monumental Geist headline, three mission case cards with photographic key art,
outcome chips, a centered display statement, a demo request band, and a founders
note. The system reads as "military avionics meets modern SaaS" — restrained,
monochrome, and instrumented, with color reserved exclusively for signal states
(thermal amber, detection cyan, alert red).

**Key Characteristics:**
- Full-bleed near-black canvas (`#0f0f0f` page ground, `#000000` section fields) with no light surfaces anywhere.
- HUD chrome in Geist Mono: uppercase micro-labels, +0.06em tracking, white-alpha inks at 10%–80% opacity.
- One monumental display scale (h0 80px desktop / 43px mobile, weight 600, −0.04em tracking) used sparingly for hero and statement bands.
- Pill controls everywhere (9999px): Contact, Scroll To Explore, Request Access, Contact Us, outcome chips.
- Live instrument overlays — canvas jet-over-terrain animation, thermal scale, detection rows, typewriter boot terminal — implemented in code, not video.
- Three mission cards with photographic key art (wildfire, border, infrastructure) and pill outcome chips.
- Color carries meaning only: detection cyan `#7aebff`, thermal amber `#ffcb47`, alert red `#f66`. UI chrome stays monochrome.

## Colors

### Brand & Accent

- **Void Black** (`#000000`): section base, card fields, footer; the global brand anchor.
- **Ground Near-Black** (`#0f0f0f`): page background ground (`--color-bg`) beneath the black section fields.
- **Detection Cyan** (`--color-green` `#7aebff`): detection/HUD active signal, scan accents; used at 20%–50% alpha fills and full-strength marks.
- **Thermal Amber** (`--color-yellow` `#ffcb47`): thermal sensor accent, warnings, shadow color token.
- **Alert Red** (`--color-red` `#f66`): threat/alarm markers.

### Surface & Background

- **White** (`#ffffff`): all primary text, CTA fills, logo mark.
- **White Alpha Overlays**: `#ffffff1a` (10%), `#ffffff26` (15%), `#ffffff40` (25%), `#ffffff80` (50%), `#ffffffb3` (70%) — HUD panels, hairlines, ghost fills, chip outlines, secondary marks.
- **Black Alpha Scrims**: `#00000040`, `#00000080` — legibility scrims over animation fields.

### Text & Rules

- **Primary Ink** (`#ffffff`): headlines, body, CTA labels.
- **Muted Ink** (`#d9d9d9`): body paragraphs, secondary copy.
- **Tertiary Ink** (`#e2e2e2`): long-form body ground.
- **Dim Ink** (`#737373`): de-emphasized labels, footer metadata.
- **Neutral 50** (`#f2f2f2`): lightest text/border token.
- **Neutral 100** (`#cccccc`): quiet text.

### Semantic

- **Detection state**: cyan `#7aebff` (+ `#7aebff33`/`#7aebff80` fills).
- **Thermal state**: amber `#ffcb47`.
- **Threat state**: red `#f66`.

### Gradient System

No decorative UI gradients. Depth comes from black-alpha scrims over the terrain
animation and white-alpha glass panels. The only color fields are the terrain
canvas itself (dark monochrome topography) and the thermal/amber instrument marks.

## Typography

### Font Family

- **Display/UI**: `Geist`, falling back to `Geist Fallback`, system sans.
- **Technical/HUD labels**: `Geist Mono`, falling back to `Geist Mono Fallback`, system mono.
- Loaded as self-hosted woff2 (`--font-geist-sans`, `--font-geist-mono`).

### Hierarchy

| Role | Font | Size (desktop) | Size (mobile) | Weight | Line Height | Letter Spacing | Notes |
|---|---|---:|---:|---:|---:|---:|---|
| h0 Display | Geist | 80px | 43px | 600 | 95% | −0.04em | Hero + statement bands. |
| h1 | Geist | 76px | 34px | 600 | 5rem/95% | −0.04em | Section-scale declarations. |
| h2 | Geist | 50px | 30px | 600 | 104% | −0.03em | "One platform, many missions." |
| h3 | Geist | 29px | 19px | 500 | 2rem | −0.01em | Card titles. |
| Body L | Geist | 19px | 14px | 500 | 24px | 0 | Lead paragraphs. |
| Body S | Geist | 16px | 13px | 500 | 20px | 0 | Default copy. |
| CTA | Geist | 17px | — | 500 | 20px | 0 | Pill button labels. |
| Mono Label | Geist Mono | 12px | 11px | 500 | 16px | +0.06em | HUD labels, chips, nav micro. |

### Principles

- Two families only: Geist for everything readable, Geist Mono for anything that
  smells like an instrument (HUD, terminals, chips, footer meta).
- Headlines are 500–600 weight with negative tracking; nothing bolder exists in the system.
- Mono labels are always uppercase with +0.06em tracking.
- Type scales switch wholesale at 768px (d-scale → m-scale); below 480px the m-scale holds.

## Layout

### Spacing System

Tailwind 4 base unit `--spacing: 0.25rem`. Sections use generous vertical rhythm —
hero fills the first viewport; subsequent bands breathe with 96–160px paddings;
card interiors use 16–24px.

### Grid & Container

- Content containers max out around `--container-3xl` (48rem) to `--container-6xl` (72rem).
- Nav: three-zone — logo mark + wordmark left, mono text links right, Contact pill at the far edge.
- Hero: full-viewport animation field with HUD pinned to corners and headline lower-left.
- Missions: 3-column card grid on desktop, stacked on mobile.
- Statement/demo/founders/contact: centered single-column text bands.
- Footer: slim bar — mark + copyright left, mono links right.

### Whitespace Philosophy

Dark emptiness is the brand. Bands hold one idea each, surrounded by black;
the HUD density of the hero contrasts with near-empty statement bands.

## Elevation & Depth

Flat. Depth = animation field + alpha overlays:

| Level | Treatment | Use |
|---|---|---|
| Flat field | `#000000` / `#0f0f0f` | All sections |
| Glass panel | `#ffffff1a` fill, `#ffffff26` hairline | HUD corners, chips, pills |
| Scrim | `#00000040`–`#00000080` overlay | Text over animation |
| Signal glow | amber/cyan drop-shadow token | Thermal + detection marks |

## Shapes

### Radius Scale

| Token | Value | Role |
|---|---:|---|
| `md` | 6px | Small utility elements |
| `lg` | 8px | Small media |
| `xl` | 12px | Grouped blocks |
| `2xl` | 16px | Cards, panels |
| `3xl` | 24px | Large media cards |
| `pill` | 9999px | Every button and chip (60 uses on the home page) |

### Image Treatment

Media sits full-bleed (terrain animation) or as rounded key-art cards inside mission
cards. No framed screenshots; imagery is either environmental (full-bleed) or
rounded-card (missions).

## Components

### `nav-bar`
Fixed, transparent over hero. Logo SVG mark + "USAVIONIX" wordmark left; Geist Mono
links (Specs, Swarm, Mission, Sync, Detection) right; white pill "Contact" at the
edge. Mobile: burger panel.

### `hero-tactical-field`
Full-viewport. Canvas terrain flyover (dark monochrome topography) with a top-down
jet drone gliding across it. `desktop.webp`/`mobile.webp` as the ground plate.
Corner HUD: left "Thermal Sensor" block with a 0°C—148°C scale; right "Threat Area"
block with live detection rows (road block 80%, power line 79%, car 79%, person 79%,
antenna 79%, motorcycle 79%, road obstruction 79%, campfire 79% — percentages jitter
±3%). Bottom-left boot-sequence terminal cycling typed telemetry lines. Lower-left
headline block + sub-copy + "Scroll To Explore ↓" pill.

### `boot-terminal`
Geist Mono micro, typewriter reveal, cycling lines: BOOT SEQUENCE INITIALIZED /
THERMAL / LIDAR / RGB / IR [ONLINE] / AI: 2 AGENTS / DUAL GPU [ACTIVE] / LINK:
PHALANX SYSTEM [ESTABLISHED] / SCAN MODE: ACTIVE / COORD: [37.4419°N / 119.8772°W] /
ALT 1,240M | SPEED 74 KM/H / 32 CAR / 4 TRUCK / 1 PERSON / 2 UAV / ALERT: THERMAL
ANOMALY / TARGET ZONE LOCKED / EMERGENCY AGENCIES NOTIFIED / SIG INTENSITY: 87% /
CLASSIFICATION: POTENTIAL THREAT / SURVEY AREA / 2 DRONES ASSIGNED TO TARGET AREA /
2 WILDFIRES / 1 ROADBLOCK DETECTED / AUTHORITIES CONTACTED / AREA STATUS: SECURED /
WILDFIRE NEAR ELECTRICAL STATION / FIREFIGHTER UNITS ALERTED / RISK LEVEL: REDUCED.

### `detection-row`
Threat Area list row: mono label left, confidence percent right, cyan tick/bar,
row fill `#7aebff33` on active. Percentages update live.

### `thermal-scale`
Vertical "Thermal Sensor" readout: mono caption, 0°C → 148°C gradient-less scale with
amber current-value marker.

### `mission-card`
Rounded (16–24px) card with full-bleed key art (`wildfire-cascade.webp`,
`border-storm.webp`, `critical-infrastructure-in-crisis.webp`), mono kicker, h3
title, body copy. Hover: art brightens (white-alpha overlay lifts).

### `outcome-chip`
Pill (9999px), white-alpha outline, mono 12px label: Power Restored / Flood Area
Secured / Evacuation Supported / Missing Person Found / Road Block Cleared /
Wildfire Contained.

### `statement-band`
Centered h0/h1 declaration on pure `#000000`, nothing else in the band.

### `demo-band`
Centered: h2 "Autonomy in real operations", body line, white pill "Request Access".

### `founders-note`
Centered body-L paragraph on black.

### `contact-band`
Centered h2 "Ready to talk to us?" + white pill "Contact Us".

### `footer-bar`
Slim: logo mark + "© USAvionix Inc. 2026" left; mono links Notes / Privacy Policy /
Terms of Use right; hairline `#ffffff26` top rule.

## Do's and Don'ts

### Do
- Keep every section on `#000000`/`#0f0f0f`; the page never lightens.
- Reserve cyan/amber/red strictly for instrument + signal states.
- Use Geist Mono uppercase +0.06em for all HUD/chip/terminal text.
- Use 9999px pills for every interactive control.
- Implement the terrain + jet animation, detection jitter, and boot terminal in code.
- Keep the d-scale → m-scale wholesale switch at 768px.

### Don't
- Do not introduce light surfaces, mid-greys as page grounds, or card-based light sections.
- Do not use gradients as UI fills.
- Do not add drop shadows to cards (glass overlays only).
- Do not use weights above 600.
- Do not mix accent colors into body copy or headings.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---:|---|
| Small Mobile | <480px | m-scale holds; HUD blocks stack; cards single-column |
| Mobile | 480–767px | m-scale; missions stack; nav burger |
| Desktop | ≥768px | d-scale wholesale; 3-column missions; corner HUD |

### Collapsing Strategy
- Nav links → burger panel.
- Mission grid 3 → 1.
- HUD corners collapse into stacked compact blocks over the animation.
- Terminal truncates to the last 3 lines on mobile.

## Known Gaps
- Hero terrain VIDEO was not captured (poster webps only) — implement terrain as canvas animation (matches the reference's own canvas overlay).
- The Delta drone GLB (`loading-delta.glb`) is captured; render as 2D canvas top-down sprite or optional three.js sprite — do not block the build on 3D.
- Fonts are self-hosted woff2 in the reference; next/font Geist is an acceptable equivalent (identical family metrics).
