---
version: alpha
name: "Detroit-Paris-design-analysis"
description: "Design-system analysis of https://www.detroit.paris/ produced by the YVON reference-build pipeline. Design-system values measured from the YVON capture relay's artifacts (hydrated DOM + stylesheets) on 2026-09-09T03:56:30.239Z. Every value traces to a captured source; unmeasurable areas are declared in Known Gaps."

typography:
  h1:
    fontFamily: "Mangogrotesque,Arial,sans-serif"
    fontSize: 6.75rem
    fontWeight: 700
  h2:
    fontFamily: "Mangogrotesque,Arial,sans-serif"
    fontSize: 4.5rem
    fontWeight: 700
  h3:
    fontFamily: "Mangogrotesque,Arial,sans-serif"
    fontSize: 3rem
    fontWeight: 500
  h4:
    fontFamily: "Mangogrotesque,Arial,sans-serif"
    fontSize: 2.5rem
    fontWeight: 700
  h5:
    fontFamily: "Mangogrotesque,Arial,sans-serif"
    fontSize: 14px
    fontWeight: null
  body:
    fontFamily: "Mangogrotesque"
    fontSize: 1.5rem
    fontWeight: null
  display:
    fontFamily: "Mangogrotesque,Arial,sans-serif"
    fontSize: 14.375rem
    fontWeight: 700

rounded:
  50%: 3
  .2rem: 1
  unset: 1
  3px!important: 1
  3px: 1
  100%: 1

spacing:
  0: 44
  10px: 23
  .5rem: 17
  1.5rem: 14
  3vw: 8
  20px: 7
  1rem: 6
  15vw: 6
  4.5rem: 4
  2rem: 4
  5px: 4
  40px: 3

elevation:
  unset: 1
  0 0 0 1px #0000001a,0 1px 3px #0000001a: 1
  0 0 3px #3336: 1
  0 0 0 2px #fff: 1
  none: 1
---

## Overview
Detroit-Paris (https://www.detroit.paris/) — reference analysis for a YVON reference-build targeting the "novizio" venture. Probe taxonomy: **static-editorial**.

**Key Characteristics:**
- 1 @keyframes animations measured: spin
- Transition properties measured: unset (1), background-color .1s,color .1s (1), all .3s (1)

## Colors

### Brand & Accent
- **ffffff** (`#ffffff`): 15 declaration(s); top contexts: body, .w-button, .w-webflow-badge, .w-select
  - Source: captured stylesheets

### Text & Rules
- **dddddd** (`#dddddd`): 6 declaration(s); top contexts: .w-form-done, .w-slider, .w-dropdown-list, .w-nav
  - Source: captured stylesheets
- **222222** (`#222222`): 6 declaration(s); top contexts: .w-dropdown-link, .w-slider-nav-invert>div.w-active, .w-lightbox-thumbnail, .w-nav-link
  - Source: captured stylesheets
- **333333** (`#333333`): 4 declaration(s); top contexts: body, .w-select, .w-file-upload-success, .w-nav-brand
  - Source: captured stylesheets
- **cccccc** (`#cccccc`): 4 declaration(s); top contexts: .w-select, .w-file-upload-uploading-btn, .w-file-upload-file, .w-file-upload-label
  - Source: captured stylesheets

### Other measured values
- **000000** (`#000000`): 3 declaration(s); top contexts: .nav-boiler, .transition-overlay, mark
  - Source: captured stylesheets
- **00000066** (`#00000066`): 3 declaration(s); top contexts: .livre-blanc:hover, .w-lightbox-caption, .w-lightbox-spinner
  - Source: captured stylesheets
- **fafafa** (`#fafafa`): 3 declaration(s); top contexts: .w-file-upload-uploading-btn, .w-file-upload-file, .w-file-upload-label
  - Source: captured stylesheets
- **c8c8c8** (`#c8c8c8`): 3 declaration(s); top contexts: [data-nav-menu-open], .w-nav-button.w--open, .w-tab-link.w--current
  - Source: captured stylesheets
- **e2e2e2** (`#e2e2e2`): 2 declaration(s); top contexts: blockquote
  - Source: captured stylesheets
- **3898ec** (`#3898ec`): 2 declaration(s); top contexts: .w-button, .w-select:focus
  - Source: captured stylesheets
- **0000001a** (`#0000001a`): 2 declaration(s); top contexts: .w-webflow-badge
  - Source: captured stylesheets
- **999999** (`#999999`): 2 declaration(s); top contexts: .w-select::placeholder, .w-widget-twitter-count-inner
  - Source: captured stylesheets
- **5d6c7b** (`#5d6c7b`): 2 declaration(s); top contexts: .w-widget-twitter-count-shim:not(.w--ver, .w-widget-twitter-count-shim.w--vertical
  - Source: captured stylesheets
- **0082f3** (`#0082f3`): 2 declaration(s); top contexts: .w-dropdown-link.w--current, .w-nav-link.w--current
  - Source: captured stylesheets
- **e3e1de** (`#e3e1de`): 1 declaration(s); top contexts: :root
  - Source: captured stylesheets

## Typography

### Font Family
- Primary families: Mangogrotesque, Barlow, sans-serif
  - Source: captured stylesheets

### Hierarchy
| Role | Family | Size | Weight | Line height | Tracking |
|---|---|---:|---:|---:|---:|
| `h1` | Mangogrotesque,Arial,sans-serif | 6.75rem | 700 | — | — |
| `h2` | Mangogrotesque,Arial,sans-serif | 4.5rem | 700 | — | — |
| `h3` | Mangogrotesque,Arial,sans-serif | 3rem | 500 | — | — |
| `h4` | Mangogrotesque,Arial,sans-serif | 2.5rem | 700 | — | — |
| `h5` | Mangogrotesque,Arial,sans-serif | 14px | — | — | — |
| `body` | Mangogrotesque | 1.5rem | — | — | — |
| `display` | Mangogrotesque,Arial,sans-serif | 14.375rem | 700 | — | — |

## Layout

### Spacing Scale

| Token | Value |
|---|---:|
| `0` | 44 |
| `10px` | 23 |
| `.5rem` | 17 |
| `1.5rem` | 14 |
| `3vw` | 8 |
| `20px` | 7 |
| `1rem` | 6 |
| `15vw` | 6 |
| `4.5rem` | 4 |
| `2rem` | 4 |
| `5px` | 4 |
| `40px` | 3 |

### Layout Grammar (measured)
- Measured container widths: 991px, 940px, 768px, 767px, 728px, 479px
  - Source: captured stylesheets (assets/*.css)

## Elevation

| Token | Shadow |
|---|---|
| `unset` | 1 |
| `0 0 0 1px #0000001a,0 1px 3px #0000001a` | 1 |
| `0 0 3px #3336` | 1 |
| `0 0 0 2px #fff` | 1 |
| `none` | 1 |

## Motion & Interaction

_Measured from the hydrated DOM and stylesheets. Static-probe labels are overridden by observed behavior._
- 1 @keyframes animations measured: spin
  - Source: captured stylesheets (@keyframes declarations)
- Transition properties measured: unset (1), background-color .1s,color .1s (1), all .3s (1)
  - Source: captured stylesheets (transition declarations)

## Shapes

### Radius Scale

| Token | Value |
|---|---:|
| `50%` | 3 |
| `.2rem` | 1 |
| `unset` | 1 |
| `3px!important` | 1 |
| `3px` | 1 |
| `100%` | 1 |

## Do's and Don'ts

### Do
- Use the measured radius scale — radii are measured on real containers, not assumed.

### Don't
- Reserve shadows for measured elevated elements only; the reference is otherwise flat.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| bp1 | 991px | media-query boundary (declarations not analyzed per-boundary) |

<sub>Source: captured stylesheets</sub>
| bp2 | 768px | media-query boundary (declarations not analyzed per-boundary) |

<sub>Source: captured stylesheets</sub>
| bp3 | 767px | media-query boundary (declarations not analyzed per-boundary) |

<sub>Source: captured stylesheets</sub>
| bp4 | 479px | media-query boundary (declarations not analyzed per-boundary) |

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
- Session: b6e19cad-4ef1-48ab-b892-d795cfcecf12 · Room: 383eb774-b644-49b2-b07b-23648728e740 · Venture: novizio
- Created: 2026-09-08T07:54:06.911Z · Status: briefed

### Capture (stealth-browser relay — measured facts)
- URL: https://www.detroit.paris/
- Preview: https://hermes.yvon.in/artifacts/novizio/873172e8-74ba-4e71-9950-1338cb538abc/_reference-capture/reference.html
- Report: https://hermes.yvon.in/artifacts/novizio/873172e8-74ba-4e71-9950-1338cb538abc/scrape-report.md
- Round trip: 0.6s
- title: Detroit | AI Production House in Paris for Luxury Brands
- pageHeight: 900
- videos: 32
- images: 34
- stylesheets: 3
- keyframes: 2
- animatedRules: 3
- assetsHarvested: 99
- seconds: 56.6

### User intent (clone or adapt — the user decided)
- Mode: **identical**
- Decided: 2026-09-08T07:56:14.052Z

### Motion decision (video vs code — the user decided)
- Decision: **code**
- Decided: 2026-09-08T07:57:40.695Z

### Brand suggestions (agent proposed, user decided)
- None offered for this reference.

### Build recipe
```json
{
  "home": "workspaces/novizio/",
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
- 2026-09-08T07:54:06.911Z · session_captured · https://www.detroit.paris/
- 2026-09-08T07:54:26.873Z · intent_gate_emitted · static-editorial
- 2026-09-08T07:56:14.053Z · intent_recorded · identical
- 2026-09-08T07:56:20.871Z · session_reused · a follow-up turn re-mentioned https://www.detroit.paris/ — continued the live gate chain instead of opening a second session
- 2026-09-08T07:56:23.992Z · motion_profile_published · https://hermes.yvon.in/artifacts/novizio/873172e8-74ba-4e71-9950-1338cb538abc/motion-profile.md
- 2026-09-08T07:56:23.994Z · capture_completed · www-detroit-paris-20260908 - round trip 0.6s
- 2026-09-08T07:56:24.737Z · design_system_thin_extracted · https://hermes.yvon.in/artifacts/novizio/873172e8-74ba-4e71-9950-1338cb538abc/_reference-capture/inventory.json
- 2026-09-08T07:56:40.687Z · motion_gate_emitted · 3 observed motion need(s)
- 2026-09-08T07:57:40.696Z · motion_recorded · code
- 2026-09-08T07:57:40.697Z · recipe_routed · $0 — every cited library is MIT/OSS and already installed · 2 skill(s) · 0 asset(s) to swap
- 2026-09-08T07:57:40.700Z · design_md_written · C:\Users\Novy\Desktop\YVON-Agentic-OS-\store\design-sessions\b6e19cad-4ef1-48ab-b892-d795cfcecf12-design.md
- 2026-09-09T03:52:23.402Z · design_system_deep_extracted · deep extractor: 16 palette values, 7 typography roles, 6 radii, 4 breakpoints
- 2026-09-09T03:53:30.794Z · design_system_deep_extracted · deep extractor: 16 palette values, 7 typography roles, 6 radii, 4 breakpoints
- 2026-09-09T03:56:30.244Z · design_system_deep_extracted · deep extractor: 16 palette values, 7 typography roles, 6 radii, 4 breakpoints