## 1. Problem

Novizio needs a production landing page that translates the finalized adapted brand direction into a usable, responsive web experience. The page must preserve the reference’s luxury editorial spirit without copying its content or media, and must express Novizio through its own logo, colors, fonts, content, and assets.

## 2. Evidence

- Operator directive in this discussion: build the two-section Novizio adapted landing page from the finalized brief.
- Operator decision via design gate: **adapt**, not clone; retain the luxury editorial spirit while making the experience Novizio-specific.
- Operator decision via design gate: use a single hero plus one supporting content section, a shorter navigation, Novizio branding, and subtle scroll behavior.
- Operator decision via design gate: use **code motion**, not video.
- Design session facts: reference motion was not verified because the automated probe returned HTTP 403; capture and DOM inspection would be required before relying on reference motion details.
- Build recipe: Next.js App Router with Tailwind in `workspaces/novizio/`; cited motion libraries are already installed and MIT/OSS.
- Evidence level: operator directive and design-gate decisions only; no user research, analytics, or performance baseline was provided.

## 3. Proposed Scope

Build the Novizio landing page in `workspaces/novizio/` with:

- A primary hero section containing venture-owned Novizio branding, fresh copy, imagery, and the approved editorial composition.
- One supporting follow-up content section beneath the hero.
- A shorter, Novizio-specific navigation rather than the reference navigation.
- Novizio-owned visual treatment, including its logo, colors, fonts, content, and generated or licensed imagery.
- Responsive layouts for supported viewport sizes, with readable content, usable navigation, and preserved visual hierarchy.
- Subtle code-based motion using CSS transitions/keyframes and/or the already-installed motion tooling where appropriate.
- Respect for `prefers-reduced-motion`.
- Real-browser verification of rendered motion, clean console behavior, and the design-flow end-to-end check through the stated verification process.

## 4. Out of Scope

- Cloning the Brunello Cucinelli reference page or reproducing its copy, logo, navigation, design assets, or media.
- Adding more than the approved two sections.
- Adding video-based motion or new motion assets.
- Purchasing or integrating new motion libraries or paid assets.
- Producing additional pages, routes, checkout flows, CMS functionality, or backend/API work.
- Reconstructing unverified reference motion from the HTTP 403-blocked probe.
- Replacing venture-owned content or assets with reference media.
- Defining new brand strategy, copy direction, or visual identity beyond implementing the finalized brief.

## 5. Success Metric

**Acceptance-pass rate:** the landing page passes 100% of the acceptance criteria in the stranger-verifiable review; no separate versioned product metric or numeric usage target has been provided.

## 6. Acceptance Criteria

1. **Two-section structure:** A stranger can load the landing page and identify exactly one primary hero section followed by exactly one supporting content section.  
   **Falsifying case:** the page contains an additional content section, omits either approved section, or the section order is reversed.

2. **Novizio adaptation:** The page visibly uses Novizio-owned branding, fresh venture copy, and venture-owned or generated imagery rather than reference content or media.  
   **Falsifying case:** any reference logo, copied reference copy, or reference image appears in the rendered experience.

3. **Navigation:** The page presents a shorter navigation consistent with the adapted brief and remains usable at supported responsive widths.  
   **Falsifying case:** the navigation reproduces the reference’s full navigation or becomes unusable, clipped, or inaccessible at a supported width.

4. **Responsive behavior:** Hero, navigation, imagery, typography, and supporting content remain readable and structurally coherent on desktop and mobile viewport sizes.  
   **Falsifying case:** text overlaps, content is clipped, horizontal scrolling is introduced, or the primary call to action/content becomes inaccessible at a supported viewport size.

5. **Motion technique:** The page uses code-based motion only, with subtle reveal, transition, or scroll behavior that renders in a real browser.  
   **Falsifying case:** motion is absent where specified, is implemented as video, or fails to render during the real-browser verification.

6. **Reduced motion:** When `prefers-reduced-motion: reduce` is enabled, nonessential animation and scroll effects are removed or substantially reduced while all content remains available.  
   **Falsifying case:** prominent animation continues unchanged or content becomes hidden/inaccessible under reduced-motion settings.

7. **Runtime quality:** The landing page loads successfully, the browser console is clean during the verification flow, and the design-flow end-to-end check completes.  
   **Falsifying case:** the page fails to load, emits console errors during the flow, or the end-to-end check fails.

8. **Asset integrity:** No asset swap is required for the implemented page, consistent with the finalized recipe’s zero-swap asset plan.  
   **Falsifying case:** a reference asset is used or an unapproved placeholder remains in the rendered page.

## 7. Risks + Rollback Stance

- **Reference motion uncertainty:** The reference motion was not verified because of an HTTP 403 response. Mitigation: implement only the recorded subtle, code-based motion decision and validate behavior in the Novizio build rather than inferring unverified reference details.
- **Brand adaptation drift:** A visually polished result could still feel like a clone. Mitigation: review every visible logo, copy block, image, color, font, and navigation item against the Novizio adaptation decision.
- **Responsive or accessibility regressions:** Editorial layouts and motion can fail at smaller widths or under reduced motion. Mitigation: include responsive and `prefers-reduced-motion` checks in the real-browser gate.
- **Implementation regression:** Changes may affect the existing Novizio app. Roll back the landing-page implementation to the last known-good revision if the page fails to load, introduces console errors, breaks existing routes, or fails the acceptance gate. Do not broaden scope to compensate for a failed build.

## Working Agents

- **Lead: mia** — frontend/Next.js implementation in `workspaces/novizio/`.
- **Support: quinn** — real-browser, motion, console, reduced-motion, and design-flow verification.

## Context Refs

- `store/design-sessions/59e94569-e25b-42fc-8893-e918a0406ebd-design.md` — finalized design-session decisions and build recipe.
- `workspaces/novizio/` — designated Next.js App Router and Tailwind build home.
- `Teams/Shared OS/skills/impeccable/SKILL.md` — frontend design skill required by the recipe.
- `Teams/Shared OS/skills/impeccable/reference/animate.md` — motion design rules.
- `Teams/Shared OS/skills/impeccable/reference/brand.md` — venture-brand adaptation rules.
- `Teams/Shared OS/skills/verification-before-completion/` — verification process named by the recipe.
- Reference URL recorded in the session: `https://shop.brunellocucinelli.com/en-gb/`

## 8. RICE

`[reasoning-based, not formula-verified]` — per backlog-rules rule 0.6, computed by the real `scripts/rice.py`, not hand-typed.

- reach: 1
- impact: 1
- confidence: 0.2
- effort: 1
- evidence_level: 1
- **score: 0.2**
