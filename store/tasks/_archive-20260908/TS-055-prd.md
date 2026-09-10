## 1. Problem

Novizio needs a production-ready, pure-code motion system that expresses the approved ADAPT direction without copying reference media or introducing excessive animation. The experience must preserve the reference’s editorial structure and pricing-comparison layout while applying Novizio’s monochrome palette, single violet accent, utility typography, fresh product-grid content, restrained motion, responsive behavior, and reduced-motion support.

## 2. Evidence

- Operator directive in the discussion: implement the approved ADAPT motion direction using CSS, GSAP, and Motion.
- Operator decision via design gate — intent: **adapt**, retaining editorial structure and pricing-comparison layout while redesigning for Novizio.
- Operator decision via design gate — motion: **code**, not video; the recorded recipe specifies CSS keyframes/transitions, GSAP with ScrollTrigger, and Motion.
- Reference-build capture records a primarily static editorial reference with one spin animation and a small number of CSS transitions; this supports restrained fade/slide entrances and a subtle scroll narrative rather than a high-intensity motion system.
- The discussion explicitly states that photorealistic content remains out of scope and that only abstract or neutral placeholders should be used.

## 3. Proposed Scope

Implement the Novizio motion system within the existing Next.js App Router and Tailwind build using the installed CSS, GSAP, `@gsap/react`, and Motion capabilities:

- Editorial page-load choreography for the initial content hierarchy.
- Scroll-triggered reveals and a restrained scroll narrative.
- Navigation interaction and active/inactive states.
- Comparison-table interactions, including observable hover, focus, and selection behavior where applicable.
- Route transition behavior between supported routes.
- Responsive motion and layout behavior across desktop, tablet, and mobile widths.
- `prefers-reduced-motion` behavior that removes or materially minimizes nonessential animation while preserving content and interaction state.
- Fresh Novizio product-grid copy and abstract or neutral visual placeholders only.
- Browser verification of rendered keyframe and ScrollTrigger behavior, console cleanliness, and reduced-motion compliance.

## 4. Out of Scope

- Photorealistic imagery, reference media, or borrowed assets.
- Video-based motion, video backgrounds, or a motion library beyond the approved installed code-based libraries.
- Reproducing the reference site’s branding, copy, assets, or exact implementation.
- New product strategy, pricing decisions, or product-grid content definition beyond the content required to populate the approved experience.
- Backend, API, CMS, analytics, or data-model changes.
- Unapproved page types or route creation beyond the routes needed to demonstrate the specified route transitions.
- Performance targets, adoption targets, or business-impact claims not defined by an approved metric owner.

## 5. Success Metric

No versioned success metric has been defined; metric has not been asked.

## 6. Acceptance Criteria

1. **Editorial load choreography:** On a clean page load, the primary editorial content enters in a deliberate, observable sequence using fade and/or slide motion, and the final state remains fully readable and interactive.  
   **Falsifier:** Content appears in an unstyled final state with no choreography, remains hidden, or blocks interaction after the animation completes.

2. **Scroll reveals:** Sections configured for reveal become visible as they enter the viewport, with restrained fade/slide behavior and no persistent motion after settling.  
   **Falsifier:** A configured section does not reveal, reveals before it enters the viewport, continuously animates after settling, or causes visible layout jumps.

3. **Navigation states:** Navigation exposes distinct, observable states for default, hover, focus, active/current-route, and relevant open/closed behavior.  
   **Falsifier:** Keyboard focus is not visible, the current route cannot be distinguished, or a state change does not appear or resolve correctly.

4. **Comparison-table interactions:** The comparison table presents the approved editorial/pricing-comparison structure and provides a clear response to its supported pointer and keyboard interactions without obscuring required comparison information.  
   **Falsifier:** A supported interaction produces no state change, cannot be operated by keyboard, or hides essential comparison content without a recoverable state.

5. **Route transitions:** Navigating between the supported routes produces a finite transition and leaves the destination route fully loaded, addressable, and interactive.  
   **Falsifier:** Navigation flashes indefinitely, leaves the previous route visible as the active page, traps focus, or results in an unusable destination.

6. **Responsive behavior:** At desktop, tablet, and mobile viewport widths, layout and motion remain usable; no horizontal overflow, clipped controls, or overlapping animated content is present.  
   **Falsifier:** Any supported viewport produces clipped content, inaccessible controls, horizontal overflow caused by the implementation, or overlapping sections that prevent comprehension.

7. **Reduced motion:** With `prefers-reduced-motion: reduce` enabled, nonessential entrance, scroll, and route animations are disabled or reduced to an immediate/brief state while content, navigation, and comparison interactions remain available.  
   **Falsifier:** Full motion continues under the preference, content remains hidden waiting for animation, or an interaction becomes unavailable.

8. **Content and asset boundary:** All displayed copy is Novizio-specific, and visual content uses only abstract or neutral placeholders; no reference copy, reference media, or photorealistic content appears.  
   **Falsifier:** Any reference-site copy/media or photorealistic asset is shipped in the implemented experience.

9. **Verification gate:** In a real browser, CSS keyframe and ScrollTrigger behavior render as intended, the browser console is clean of implementation errors, and the design-flow end-to-end check passes.  
   **Falsifier:** Motion does not render, console errors occur during the tested flow, or the reduced-motion and design-flow checks fail.

## 7. Risks + Rollback Stance

- **Motion overreach:** Combining CSS, GSAP, and Motion can create inconsistent timing or excessive animation. Prefer the simplest mechanism per interaction and remove nonessential choreography if it harms clarity.
- **Accessibility regression:** Motion can conceal content, disrupt focus, or conflict with reduced-motion preferences. Treat reduced-motion, keyboard operation, and settled readable states as release blockers.
- **Responsive instability:** Scroll-triggered calculations and route transitions may fail at narrow widths or during resize. Revert the affected animation layer to static states while preserving layout and content.
- **Reference imitation risk:** Reusing reference assets or reproducing its identity would violate the ADAPT boundary. Replace any questionable asset or copy with an abstract/neutral placeholder or fresh Novizio content.
- **Rollback stance:** Roll back individual motion effects to their nonanimated CSS/static states first. If the system remains unstable, disable GSAP/Motion orchestration and ship the editorial layout with accessible transitions removed; do not roll back the approved Novizio structure or content boundary.

## Working Agents

**Lead: mia** — frontend/Next.js implementation.  
**Supporting: quinn** — real-browser QA, motion rendering, console, responsive, and reduced-motion verification.

## Context Refs

- `store/design-sessions/945dff05-bb4b-4910-90d8-e283f0c6f2c7-design.md` — recorded ADAPT intent, code-motion decision, build recipe, and asset plan.
- `Teams/Shared OS/skills/impeccable/SKILL.md` — frontend design skill specified by the build recipe.
- `Teams/Shared OS/skills/impeccable/reference/animate.md` — motion design rules for reveals, scroll choreography, and micro-interactions.
- `Teams/Shared OS/skills/impeccable/reference/brand.md` — brand register for redesigning the experience for Novizio.
- `Teams/Shared OS/skills/verification-before-completion/` — verification workflow specified by the build recipe.
- `https://hermes.yvon.in/artifacts/novizio/877ef7fc-c30d-43ca-834a-72f98619afcd/motion-profile.md` — captured reference motion profile.
- `https://hermes.yvon.in/artifacts/novizio/877ef7fc-c30d-43ca-834a-72f98619afcd/scrape-report.md` — captured reference facts.
- `https://hermes.yvon.in/artifacts/novizio/877ef7fc-c30d-43ca-834a-72f98619afcd/_reference-capture/reference.html` — captured reference preview.

## 8. RICE

`[reasoning-based, not formula-verified]` — per backlog-rules rule 0.6, computed by the real `scripts/rice.py`, not hand-typed.

- reach: 1
- impact: 1
- confidence: 0.3
- effort: 1
- evidence_level: 1
- **score: 0.3**
