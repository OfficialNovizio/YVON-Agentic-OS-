---
version: alpha
name: "Usavionix-Com-design-analysis"
description: "Design-system analysis of https://www.usavionix.com/ produced by the YVON reference-build pipeline. Design-system values measured from the YVON capture relay's artifacts (hydrated DOM + stylesheets) on 2026-09-10T05:17:14.727Z. Every value traces to a captured source; unmeasurable areas are declared in Known Gaps."

typography:
  display:
    fontFamily: "Geist"
    fontSize: 5rem
    fontWeight: 500
  h1:
    fontFamily: "Geist"
    fontSize: 4.75rem
    fontWeight: 500
  h2:
    fontFamily: "Geist"
    fontSize: 3.125rem
    fontWeight: 500
  h3:
    fontFamily: "Geist"
    fontSize: 1.8125rem
    fontWeight: 500
  body:
    fontFamily: "Geist"
    fontSize: 1.1875rem
    fontWeight: 500

rounded:
  pill: "9999px (rounded-full — 60 uses, buttons/pills)"
  card: "1rem–1.5rem (rounded-2xl/3xl — 3 uses)"
  var(--radius-lg): 2
  var(--radius-xl): 2
  .25rem: 1
  var(--radius-2xl): 1

spacing:
  0: 10
  calc(var(--spacing)*8): 15
  calc(var(--spacing)*4): 12
  calc(var(--spacing)*6): 11
  calc(var(--spacing)*12): 11
  calc(var(--spacing)*0): 10
  calc(var(--spacing)*5): 8
  calc(var(--spacing)*2): 7
  calc(var(--spacing)*3): 7
  calc(var(--spacing)*1.5): 6
  calc(var(--spacing)*16): 6
  calc(var(--spacing)*1): 4

elevation:
  var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow): 3
  none: 1
---

## Overview
Usavionix-Com (https://www.usavionix.com/) — reference analysis for a YVON reference-build targeting the "yvon-os" venture. Probe taxonomy: **motion-marketing**.

**Key Characteristics:**
- 4 @keyframes animations measured: enter, exit, pulse, ripple
- Transition properties measured: opacity!important (1), width (1), all (1), opacity (1)

## Colors

### Surface & Background
- **000000** (`#000000`): base surface — var(--color-black); page and section backgrounds
  - Source: captured stylesheets (--color-black token + reference.png)
- **ffffff1a-ffffff26-ffffff40** (`#ffffff1a / #ffffff26 / #ffffff40`): translucent pill buttons and overlay panels (rounded-full)
  - Source: captured stylesheets
- **e2e2e2** (`#E2E2E2`): light grey surfaces/borders (4 refs in markup)
  - Source: reference.html

### Text & Rules
- **ffffff** (`#ffffff`): primary text and logo on dark base
  - Source: reference.png + white text classes
- **d9d9d9** (`#d9d9d9`): muted grey — secondary text/dividers
  - Source: captured stylesheets
- **737373** (`#737373`): neutral-500 muted labels
  - Source: captured stylesheets
- **d9d9d9** (`#d9d9d9`): 4 declaration(s); top contexts: _0\)_100\%\)\]
  - Source: captured stylesheets

### Other measured values
- **ffffff** (`#ffffff`): 3 declaration(s); top contexts: :before, :root, --tw-ring-offset-color
  - Source: captured stylesheets
- **000000** (`#000000`): 3 declaration(s); top contexts: transparent_100\%\)\], :root
  - Source: captured stylesheets
- **00000080** (`#00000080`): 3 declaration(s); top contexts: transparent_100\%\)\], .bg-black\/50
  - Source: captured stylesheets
- **ffffffb3** (`#ffffffb3`): 3 declaration(s); top contexts: .text-white\/70, *), .hover\:text-white\/70:hover
  - Source: captured stylesheets
- **ffffffcc** (`#ffffffcc`): 3 declaration(s); top contexts: .text-white\/80, *), .hover\:text-white\/80:hover
  - Source: captured stylesheets

## Typography

### Font Family
- Primary families: Geist (UI + display), Geist Mono (HUD/labels)
  - Source: capture inventory fonts[]

### Hierarchy
| Role | Family | Size | Weight | Line height | Tracking |
|---|---|---:|---:|---:|---:|
| `display` | Geist | 5rem | 500 | — | — |
| `h1` | Geist | 4.75rem | 500 | — | — |
| `h2` | Geist | 3.125rem | 500 | — | — |
| `h3` | Geist | 1.8125rem | 500 | — | — |
| `body` | Geist | 1.1875rem | 500 | — | — |

### Principles (measured)
- Mobile scale measured in the same tokens: h0 2.6875rem, h1 2.125rem, h2 1.875rem, h3 1.1875rem, body-l 0.875rem
  - Source: captured stylesheets (assets/*.css, --text-* tokens)
- Weights in use: 100 (thin labels), 500 (body/headings), 600 (emphasis)
  - Source: captured stylesheets (assets/*.css, --text-* tokens)

## Layout

### Spacing Scale

| Token | Value |
|---|---:|
| `0` | 10 |
| `calc(var(--spacing)*8)` | 15 |
| `calc(var(--spacing)*4)` | 12 |
| `calc(var(--spacing)*6)` | 11 |
| `calc(var(--spacing)*12)` | 11 |
| `calc(var(--spacing)*0)` | 10 |
| `calc(var(--spacing)*5)` | 8 |
| `calc(var(--spacing)*2)` | 7 |
| `calc(var(--spacing)*3)` | 7 |
| `calc(var(--spacing)*1.5)` | 6 |
| `calc(var(--spacing)*16)` | 6 |
| `calc(var(--spacing)*1)` | 4 |

### Layout Grammar (measured)
- Full-bleed canvas/video hero with overlaid content; content constrained by max-w-204 (-max-width token) on the headline
  - Source: captured stylesheets (assets/*.css, --text-* tokens)
- Section rhythm: alternating full-viewport media sections and centered text sections (reference.png, 64,653px page)
  - Source: captured stylesheets (assets/*.css, --text-* tokens)

## Elevation

| Token | Shadow |
|---|---|
| `var(--tw-inset-shadow),var(--tw-inset-ring-shadow),var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow)` | 3 |
| `none` | 1 |

## Motion & Interaction

_Measured from the hydrated DOM and stylesheets. Static-probe labels are overridden by observed behavior._
- 4 @keyframes animations measured: enter, exit, pulse, ripple
  - Source: captured stylesheets (@keyframes declarations)
- Transition properties measured: opacity!important (1), width (1), all (1), opacity (1)
  - Source: captured stylesheets (transition declarations)

## Shapes

### Radius Scale

| Token | Value |
|---|---:|
| `pill` | 9999px (rounded-full — 60 uses, buttons/pills) |
| `card` | 1rem–1.5rem (rounded-2xl/3xl — 3 uses) |
| `var(--radius-lg)` | 2 |
| `var(--radius-xl)` | 2 |
| `.25rem` | 1 |
| `var(--radius-2xl)` | 1 |

## Do's and Don'ts

### Do
- Dark cinematic base (#000) with photographic/canvas media full-bleed; white Geist type on top.
- Pill-shaped controls (rounded-full, translucent white overlays) for CTAs and nav.
- Use the measured radius scale — radii are measured on real containers, not assumed.

### Don't
- No strong accent color exists in the reference — monochrome white-on-black with photography carrying the color.
- Reserve shadows for measured elevated elements only; the reference is otherwise flat.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| md | 768px (48rem) | mobile → desktop type scale switch (m-h0 2.6875rem → d-h0 5rem) |

<sub>Source: captured stylesheets (md: variants)</sub>
| bp1 | 480px | media-query boundary (declarations not analyzed per-boundary) |

<sub>Source: captured stylesheets</sub>

## Known Gaps
- Computed (rendered) styles were not sampled — values come from static stylesheets; the rendered cascade may differ.
- Typography role names are inferred from selector names and size ordering, not from rendered headings.
- Component inventory was not derived — no named component token maps in this pass.
- Frontmatter component token maps were not derived — components are documented from CSS evidence only.
- Computed (rendered) styles were not sampled — values come from static HTML + stylesheets.

### Measurement sources
- captured stylesheets (assets/*.css) + reference.html of the capture bundle

---

## Session Appendix — YVON reference-build record
- Session: 114e022c-8ff4-4796-998d-0389824cb808 · Room: 0ed96f9c-f9a1-4fdf-a7c0-b1d6892eccb9 · Venture: yvon-os
- Created: 2026-09-10T05:09:21.622Z · Status: briefed

### Capture (stealth-browser relay — measured facts)
- No stealth-browser capture arrived for this reference.

### User intent (clone or adapt — the user decided)
- Mode: **identical**
- Decided: 2026-09-10T05:15:16.194Z

### Motion decision (video vs code — the user decided)
- Decision: **code**
- Decided: 2026-09-10T05:15:19.931Z

### Brand suggestions (agent proposed, user decided)
- None offered for this reference.

### Build recipe
```json
{
  "home": "workspaces/yvon-os/",
  "stack": [
    "Next.js App Router + Tailwind (fleet standard)"
  ],
  "motionLibs": [
    "CSS @keyframes / transitions",
    "gsap + ScrollTrigger (installed, MIT)",
    "@gsap/react (installed, MIT)",
    "motion (installed, MIT)"
  ],
  "skills": [
    {
      "path": "Teams/Shared OS/skills/impeccable/SKILL.md",
      "role": "frontend design skill — the build runs under it"
    },
    {
      "path": "Teams/Shared OS/skills/impeccable/reference/animate.md",
      "role": "motion design rules (reveals, scroll choreography, micro-interactions)"
    }
  ],
  "assetPlan": [
    {
      "kind": "copy",
      "what": "all copy — written fresh for our venture",
      "origin": "owned",
      "swapRequired": false
    },
    {
      "kind": "image",
      "what": "imagery — licensed/stock/AI-generated, no reference media",
      "origin": "generated",
      "swapRequired": false,
      "note": "nothing borrowed, nothing to swap"
    }
  ],
  "assetsNeedSwapping": 0,
  "verifyStep": "quinn real-browser gate: load the build and confirm the @keyframes/ScrollTrigger motion actually renders; console clean; prefers-reduced-motion respected; then the design-flow e2e. Runs under Teams/Shared OS/skills/verification-before-completion/.",
  "cost": "$0 — every cited library is MIT/OSS and already installed",
  "costConfidence": "verified",
  "obligations": [],
  "intentNote": "IDENTICAL CLONE — replicate the reference's structure, layout, sections and motion exactly; all text and imagery replaced with our venture's own content and brand."
}
```

### History
- 2026-09-10T05:09:21.622Z · session_captured · https://www.usavionix.com/
- 2026-09-10T05:10:53.575Z · intent_gate_emitted · motion-marketing
- 2026-09-10T05:12:04.487Z · session_reused · a follow-up turn re-mentioned https://www.usavionix.com/ — continued the live gate chain instead of opening a second session
- 2026-09-10T05:13:35.606Z · intent_gate_emitted · motion-marketing
- 2026-09-10T05:15:16.195Z · intent_recorded · identical
- 2026-09-10T05:15:19.932Z · motion_recorded · code
- 2026-09-10T05:15:19.934Z · recipe_routed · $0 — every cited library is MIT/OSS and already installed · 2 skill(s) · 0 asset(s) to swap
- 2026-09-10T05:15:19.937Z · design_md_written · C:\Users\Novy\Desktop\YVON-Agentic-OS-\store\design-sessions\114e022c-8ff4-4796-998d-0389824cb808-design.md
- 2026-09-10T05:17:14.732Z · design_system_deep_extracted · deep + token-measured: Geist scale (d-h0 5rem), #000/#ffffff, pill radii, 768/480