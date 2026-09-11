## 1. Problem

Novizio needs a production-ready Next.js marketing site that adopts the measured visual system, section rhythm, and motion behavior of usavionix.com while presenting only Novizio-owned copy and licensed, stock, or AI-generated imagery. The site must honor the operator’s recorded decisions: identical reference structure and layout intent, code-based motion rather than reference video, and the approved design system.

## 2. Evidence

- Operator directive in the discussion: build a Next.js site replicating the measured usavionix.com design system and section structure with owned content.
- Operator decision via design gate — intent: **identical**; motion: **code**.
- Reference-build analysis measured from captured DOM and stylesheets on 2026-09-10, including Geist typography, monochrome black-and-white surfaces, pill controls, full-bleed media sections, centered text sections, responsive boundaries at 480px and 768px, and `enter`, `exit`, `pulse`, and `ripple` keyframes.
- Discussion build recipe specifies Next.js App Router + Tailwind, existing CSS motion/GSAP/Motion libraries, owned copy, generated or licensed imagery, and a `quinn` real-browser verification gate.
- Validation ladder: L1, operator-provided design-session evidence and directive; no additional product, market, reach, or usage research was provided.

## 3. Proposed Scope

- Build the Novizio marketing site in Next.js App Router with the reference’s measured section order and layout grammar:
  - Full-bleed cinematic media areas with overlaid content.
  - Centered text-led sections.
  - Reference-aligned spacing and viewport rhythm.
- Implement the measured visual system:
  - Black base surface with white and muted-grey text.
  - Geist for display, headings, and body text; Geist Mono for HUD or label treatment where appropriate.
  - Desktop and mobile type scales from the design analysis.
  - Pill-shaped translucent controls and the measured card radius scale.
  - Minimal elevation, using shadows only where supported by the reference evidence.
- Replace all reference copy with fresh Novizio-owned content.
- Use only licensed, stock, or AI-generated imagery; do not use reference-site media.
- Implement motion in code using CSS keyframes, transitions, and the approved installed motion tooling where needed, including reveal, scroll, and micro-interaction behavior consistent with the reference intent.
- Implement responsive behavior around the measured 480px and 768px boundaries.
- Run the required real-browser QA gate for rendered motion, console cleanliness, reduced-motion behavior, and the design-flow end-to-end check.

## 4. Out of Scope

- Copying or adapting usavionix.com text, logos, imagery, video, proprietary assets, or brand identifiers.
- Using reference-site media or requiring a reference asset swap after implementation.
- Building a CMS, backend API, database, authentication, ecommerce, checkout, or other transactional functionality.
- Adding pages, sections, or product flows not represented by the approved reference structure.
- Defining new brand colors, a new visual direction, or a non-reference layout system.
- Producing or claiming a quantified acquisition, conversion, reach, or revenue outcome.
- Replacing the recorded code-motion decision with reference video or other borrowed media.

## 5. Success Metric

**Reference parity gate pass rate** — not yet versioned or formally defined, so no numeric target is set; the initial release must pass the agreed visual, responsive, motion, ownership, and browser-verification acceptance gates.

## 6. Acceptance Criteria

- **Site availability:** A stranger can load the Novizio marketing site in a supported browser and reach the complete marketing experience without a runtime error or blank route.  
  **Falsifying case:** Any primary route fails to load, renders an error, or leaves a required section inaccessible.

- **Reference structure:** The rendered page preserves the approved reference section order and alternating full-bleed-media / centered-text layout grammar.  
  **Falsifying case:** A required section is missing, reordered, or replaced by a materially different page structure.

- **Owned content and media:** Every visible word, logo treatment, and media asset is Novizio-owned or appropriately licensed/generated, with no copied reference-site content or media.  
  **Falsifying case:** Any reference-site text, logo, image, video, or unlicensed asset appears in the build.

- **Measured visual system:** The build visibly uses the recorded black base, white and muted-grey text treatment, Geist typography, pill controls, measured radius scale, and reference-aligned spacing without introducing an unsupported strong accent color.  
  **Falsifying case:** A stranger comparing the build with the approved design analysis finds a primary color, typography family, control shape, or layout treatment that contradicts the recorded system.

- **Responsive behavior:** At viewport widths below 480px, between 480px and 767px, and at 768px or wider, content remains readable and usable while the mobile/desktop type and layout behavior follows the approved responsive design.  
  **Falsifying case:** Any tested width produces clipped text, horizontal overflow, unusable controls, broken media, or an unexplained desktop-scale layout on mobile.

- **Code-based motion:** The rendered experience visibly implements the approved motion treatment through code, including the intended reveal/transition behavior and reference-aligned interaction feedback.  
  **Falsifying case:** Motion is absent, depends on borrowed reference video, or fails to render in the browser despite being present in source code.

- **Reduced motion:** When `prefers-reduced-motion: reduce` is enabled, nonessential animation and scroll choreography are reduced or disabled while content and controls remain usable.  
  **Falsifying case:** Full animation continues unchanged, or disabling motion makes content inaccessible.

- **Browser quality gate:** `quinn` can load the build in a real browser, observe the intended motion, find no unexpected console errors, and complete the design-flow end-to-end check.  
  **Falsifying case:** The browser gate reports a console error, failed interaction, missing motion, or incomplete design flow.

## 7. Risks + Rollback Stance

- **Reference imitation and legal/brand-confusion risk:** An identical structure can be mistaken for the reference brand. Mitigation is limited to using owned Novizio copy, Novizio identity, and licensed/generated media; the work must not reuse reference marks or assets.
- **Static-analysis uncertainty:** Some measured values came from stylesheets rather than computed rendered styles, and the session lists known gaps around component inventory and rendered cascade. Validate in-browser and treat the approved design session as the source of truth unless a discrepancy is found.
- **Motion reliability risk:** Scroll and keyframe behavior may fail across browsers or interfere with reduced-motion preferences. The real-browser gate is mandatory before release.
- **Responsive mismatch risk:** The reference analysis has limited breakpoint evidence beyond 480px and 768px. Test intermediate widths and roll back any layout change that introduces overflow or inaccessible content.
- **Rollback stance:** Keep the existing marketing experience deployable until the new build passes the browser and design gates. If the build fails visual, ownership, accessibility, or runtime verification, revert the new route/deployment to the last known-good experience and disable the new motion or affected section rather than shipping a partial clone.

## Working Agents

**Lead: mia** — frontend/Next.js implementation.  
Supporting agents: **quinn** for real-browser QA and verification; **dev** for architecture and implementation review.

## Context Refs

- `store/design-sessions/114e022c-8ff4-4796-998d-0389824cb808-design.md` — approved design session and measured design-system evidence.
- Discussion build recipe — Next.js App Router + Tailwind, code-based motion, owned copy, generated/licensed imagery, and the `quinn` verification step.
- `Teams/Shared OS/skills/impeccable/SKILL.md` — frontend design skill required by the build recipe.
- `Teams/Shared OS/skills/impeccable/reference/animate.md` — motion design rules for reveals, scroll choreography, and micro-interactions.
- `Teams/Shared OS/skills/verification-before-completion/` — verification process named by the build recipe.
- Recorded design-gate decisions: identical reference intent; code-based motion; no reference assets to swap.

## 8. RICE

`[reasoning-based, not formula-verified]` — per backlog-rules rule 0.6, computed by the real `scripts/rice.py`, not hand-typed.

- reach: 1
- impact: 1
- confidence: 0.8 (capped to 0.5 by evidence_level=1)
- effort: 1
- evidence_level: 1
- **score: 0.5**
