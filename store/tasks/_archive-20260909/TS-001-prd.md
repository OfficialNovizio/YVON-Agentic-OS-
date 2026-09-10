## 1. Problem

Novizio needs a production-ready marketing website that reproduces the approved Detroit Paris reference’s structure, layout, responsive behavior, and motion while presenting only Novizio-owned copy and media. The reference-build decisions are already fixed: the clone mode is identical, motion is implemented in code, and the completed `design.md` is the source of truth. The remaining problem is to implement and verify that experience in the Novizio workspace without reusing reference content or assets.

## 2. Evidence

- Operator directive, validation ladder L1: “Build Novizio reference-led marketing site.”
- Operator directive, validation ladder L1: implement an “identical structural clone” of the approved Detroit Paris reference.
- Operator decision via design gate — clone mode: **identical**.
- Operator decision via design gate — motion technique: **code**, using CSS animations/transitions, GSAP/ScrollTrigger, and Motion.
- Design-session capture evidence: the reference contains 32 videos, 34 images, 3 stylesheets, measured typography, spacing, radii, breakpoints, transitions, and keyframe motion.
- Design-session evidence: the captured reference was analyzed from hydrated DOM and stylesheets on 2026-09-09; rendered computed styles and some component details remain known gaps.
- Design-session asset decision: all copy is written fresh for Novizio and all imagery is licensed, stock, or AI-generated; no reference media is to be reused.
- Verification requirement recorded in the build recipe: production, accessibility, responsive, rendered-browser, console, reduced-motion, and design-flow verification are required.

## 3. Proposed Scope

- Implement the Novizio marketing site in `workspaces/novizio/` using the fleet-standard Next.js App Router and Tailwind stack.
- Reproduce the reference’s approved page structure, section ordering, layout grammar, responsive breakpoints, spacing, typography hierarchy, colors, radii, and measured flat/elevated treatment as documented in `design.md`.
- Replace every Detroit Paris text string with Novizio-owned marketing copy.
- Replace every reference image and video with Novizio-owned or appropriately licensed/generated media.
- Implement the approved motion profile in code using CSS `@keyframes`/transitions, GSAP with ScrollTrigger, and Motion where appropriate.
- Preserve the observed interaction intent, including page transitions, scroll reveals, hover states, and measured motion behavior, while honoring `prefers-reduced-motion`.
- Run production build verification, accessibility verification, responsive viewport verification, rendered-browser verification, console checks, and the design-flow end-to-end verification.

## 4. Out of Scope

- Reusing Detroit Paris copy, imagery, video, logos, or other reference-owned media.
- Creating a different visual direction, alternate page structure, or non-reference layout.
- Re-opening the already-recorded clone-mode or motion-technique decisions.
- Implementing backend services, authentication, CMS functionality, analytics, payments, or other product application features not present in the approved marketing-site scope.
- Treating unmeasured reference behavior as an authoritative requirement beyond what is documented in `design.md` and observable during verification.
- Adding new brand strategy or a separate design system beyond the Novizio content and the recorded reference-led design constraints.

## 5. Success Metric

No versioned success-metric definition has been provided or asked for; implementation success is therefore evaluated against the acceptance criteria and verification gates below.

## 6. Acceptance Criteria

1. **Reference structure:** A stranger comparing the deployed site with the approved reference capture can identify the same page sections, ordering, primary navigation pattern, and major layout relationships.  
  **Falsifies if:** any major reference section is missing, reordered, or replaced with a materially different page structure.

2. **Reference styling:** The implementation follows the typography, color, spacing, radius, breakpoint, and elevation values recorded in `design.md` wherever those values are specified.  
  **Falsifies if:** a specified value is replaced by an unrelated style without a documented limitation or the page visibly departs from the measured design system.

3. **Owned content and media:** No visible copy, image, video, logo, or other media is sourced from Detroit Paris; all visible content is Novizio-owned or appropriately licensed/generated.  
  **Falsifies if:** a reference brand name, reference copy, hotlinked reference asset, or unapproved reference media appears in the built site.

4. **Motion implementation:** The production site visibly renders the approved code-based motion, including the applicable CSS animation/transitions and GSAP/ScrollTrigger behavior, rather than relying on reference videos as substitutes.  
  **Falsifies if:** a required motion effect does not render in a real browser, is implemented only as a static frame, or depends on borrowed reference media.

5. **Reduced motion:** With `prefers-reduced-motion: reduce` enabled, nonessential movement is suppressed or materially reduced while content and essential interactions remain usable.  
  **Falsifies if:** substantial decorative motion continues unchanged or content becomes inaccessible under reduced-motion settings.

6. **Responsive behavior:** At each recorded breakpoint boundary—991px, 768px, 767px, and 479px—the site remains usable and the layout adapts without horizontal overflow or clipped primary content.  
  **Falsifies if:** any tested viewport produces horizontal scrolling, overlapping content, unreachable controls, or clipped essential text/media.

7. **Accessibility:** A real-browser accessibility check finds no blocking keyboard-navigation, focus-visibility, semantic-labeling, contrast, or image-alternative failure in the implemented experience.  
  **Falsifies if:** a stranger cannot reach an interactive element by keyboard, cannot identify its purpose, encounters an invisible focus state, or finds an unhandled meaningful image.

8. **Production integrity:** The application completes a production build and loads the primary marketing route in a production-like environment without runtime errors.  
  **Falsifies if:** the production build fails, the route cannot load, or a runtime exception prevents primary content from rendering.

9. **Browser verification:** Quinn’s real-browser gate confirms the page renders, the console is clean, motion works, reduced motion is respected, and the design-flow end-to-end test passes.  
  **Falsifies if:** console errors, failed network/runtime behavior, missing motion, reduced-motion failure, or a design-flow test failure remains unresolved.

## 7. Risks + Rollback Stance

- **Reference ambiguity:** The capture has known gaps, including absent computed-style sampling and incomplete component inventory. Resolve by treating `design.md`, captured artifacts, and real-browser comparison as the authority; document any unavoidable variance rather than inventing reference behavior.
- **Content readiness:** Novizio-owned copy and media are not supplied in the discussion. If they are unavailable, content must be clearly marked as pending and must not be replaced with Detroit Paris material.
- **Motion regressions:** Scroll-triggered or breakpoint-specific motion may fail in production or under reduced-motion settings. Keep motion isolated and revert the affected animation implementation without rolling back unrelated layout work.
- **Responsive regressions:** An identical structural clone may not map cleanly to all viewport widths. Roll back the smallest offending responsive rule or section change while preserving the measured desktop structure.
- **Accessibility regressions:** Decorative fidelity can conflict with keyboard, contrast, or motion requirements. Accessibility takes precedence; remove or simplify the conflicting effect rather than weakening the accessibility behavior.
- **Rollback stance:** Ship only after the production and real-browser gates pass. If a gate fails, revert the smallest failing change or disable the affected motion/media treatment and retain the last verified build; do not ship reference-owned assets as a workaround.

## Working Agents

**Lead: mia**  
Supporting agents: **quinn** for QA, real-browser verification, accessibility, responsive, and production checks; **dev** for architecture and implementation review.

## Context Refs

- `workspaces/novizio/`
- `C:\Users\Novy\Desktop\YVON-Agentic-OS-\store\design-sessions\b6e19cad-4ef1-48ab-b892-d795cfcecf12-design.md`
- Design-session build recipe recorded in the discussion, including the Next.js App Router + Tailwind stack and installed CSS/GSAP/Motion libraries.
- `https://hermes.yvon.in/artifacts/novizio/873172e8-74ba-4e71-9950-1338cb538abc/_reference-capture/reference.html`
- `https://hermes.yvon.in/artifacts/novizio/873172e8-74ba-4e71-9950-1338cb538abc/motion-profile.md`
- `Teams/Shared OS/skills/impeccable/SKILL.md`
- `Teams/Shared OS/skills/impeccable/reference/animate.md`
- `Teams/Shared OS/skills/verification-before-completion/`

## 8. RICE

`[reasoning-based, not formula-verified]` — per backlog-rules rule 0.6, computed by the real `scripts/rice.py`, not hand-typed.

- reach: 1
- impact: 1
- confidence: 0.5
- effort: 1
- evidence_level: 1
- **score: 0.5**
