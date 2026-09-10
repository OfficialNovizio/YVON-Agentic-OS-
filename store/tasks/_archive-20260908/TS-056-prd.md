# PRD — Novizio: IDENTICAL CLONE of https://www.detroit.paris/

> Operator-ordered revision. Supersedes TS-055's ADAPT direction — the operator
> revoked it on 2026-09-08: "create exact clone … Exact same reference website."
> The design session's intent is re-recorded as `identical`.

## 1. Problem

The operator's verbatim request was "create a website for me and this is
reference https://www.detroit.paris/". The reference capture and measured
design analysis completed correctly (design.md holds detroit.paris's real
measured values), but the build executed an ADAPT reinterpretation (violet
accent, utility typography) that the operator never ordered. The product must
be the IDENTICAL CLONE the pipeline's intent gate defines: replicate the
reference's structure, layout, sections and motion exactly; replace all text
and imagery with Novizio's own content and brand.

## 2. Evidence

- Room transcript (2026-09-08T03:46): verbatim ask = "create a website for me
  and this is reference https://www.detroit.paris/" — no adaptation
  instructions were ever typed by the operator.
- `store/design-sessions/945dff05-…-design.md`: measured detroit.paris design
  system — colors #000000 / #ffffff / #ff4c24 / #e3e1de / #e2e2e2,
  display face Mangogrotesque (display 14.375rem/0.8, h1 6.75rem/0.85, h2
  4.5rem/1.0), body Barlow 1rem/1.5. Ground truth for tokens.
- `workspaces/_reference-captures/www-detroit-paris-20260908/`: hydrated DOM +
  stylesheets + screenshots of the reference (build-time reference, not shipped
  media).
- TS-055 built the ADAPT direction; verify passed against the task's own
  criteria, not against the operator's verbatim clone ask — the divergence this
  revision closes.

## 3. Proposed Scope

- Rebuild the novizio product workspace (WI-1, owner mia) as an identical
  structural clone of detroit.paris: same section order and anatomy (utility
  header/nav, oversized display hero, editorial image-led content modules,
  pricing-comparison table/grid, footer), same layout grammar (tight spacing,
  hard edges, minimal radii, hairline rules, full-bleed blocks).
- Implement the measured design tokens (colors, type scale, leading) from
  design.md; substitute fonts with the closest freely-licensed equivalents
  where the measured faces are not licensed (declare the substitution in the
  build report).
- Reproduce the reference's motion with code only (CSS + GSAP + Motion — the
  already-approved PURE CODE decision, $0, MIT): typography-led reveals,
  directional vertical/horizontal movement, restrained and finite.
- Replace ALL copy and imagery with Novizio product-grid content and brand:
  Novizio wordmark, Novizio product names, Novizio pricing in the comparison
  table. Zero reference copy or media ships.
- Real-browser verification (desktop 1440 + mobile 390, clean console,
  reduced-motion honored).

## 4. Out of Scope

- Shipping any detroit.paris copy, imagery, or photorealistic assets.
- AI-video scrub motion (the motion gate decision was PURE CODE).
- Backend/API work; CMS; auth. This is the marketing/product surface only.
- Re-running the capture pipeline — the 20260908 capture bundle and measured
  design.md are the inputs.

## 5. Success Metric

The rendered homepage at 1440px is section-for-section and token-for-token
indistinguishable in structure from detroit.paris while carrying 100% Novizio
content; quinn-style real-browser verification passes with a clean console and
side-by-side screenshots prove structural fidelity.

## 6. Acceptance Criteria

1. **Structural fidelity:** The homepage replicates detroit.paris's measured anatomy — same top-level sections in the same order (utility header/nav, oversized display hero, editorial image-led modules, pricing-comparison table, footer) per design.md.  
   **Falsifier:** Any top-level section from the reference anatomy is missing, an unlisted section is added, or the order differs from the reference.

2. **Typography fidelity:** Headings/display use the measured grotesque system at measured scale and leading (display ≈14.4rem/0.8, h1 ≈6.75rem/0.85, h2 ≈4.5rem/1.0, h3 ≈3rem/0.85) and body text uses the measured grotesk body face at 1rem/1.5 — substituted only with the closest freely-licensed equivalent if the measured faces are unavailable, with the substitution declared.  
   **Falsifier:** Heading scale or leading visibly departs from the measured values (e.g. a default framework type scale) or the body face is neither the measured face nor a declared licensed substitute.

3. **Color fidelity:** The palette matches the measured values — #000000 base, #ffffff surfaces, #ff4c24 primary accent, #e3e1de neutral, #e2e2e2 rules — with no other hue acting as a dominant or accent color.  
   **Falsifier:** Any color outside the measured palette (e.g. the revoked violet) appears as a dominant surface or accent.

4. **Layout grammar fidelity:** Tight spacing, hard edges with minimal radii, hairline rules, and full-bleed editorial blocks per the measured system.  
   **Falsifier:** Soft rounded cards, wide-gutter SaaS layout, or prominent drop-shadow card aesthetics appear anywhere on the page.

5. **Motion fidelity (PURE CODE):** Entrance and scroll motion reproduces the reference's feel with code only — typography-led line reveals, directional vertical/horizontal movement, no elastic/bounce easing, all motion finite.  
   **Falsifier:** Decorative bounce/elastic motion appears, or primary content has no entrance/scroll motion at all.

6. **Content substitution:** Every string and image is Novizio product-grid content and brand; the comparison table carries Novizio products and prices.  
   **Falsifier:** Any detroit.paris copy, media, or placeholder Latin ships in the built product.

7. **Comparison table:** The pricing-comparison layout is preserved as a visual table/grid in the reference's editorial style, populated with Novizio content.  
   **Falsifier:** The comparison is rendered as stacked feature cards, is missing, or obscures its own comparison data.

8. **Responsive + reduced motion:** At desktop, tablet, and mobile widths the clone remains usable with no horizontal overflow or clipped controls, and with `prefers-reduced-motion: reduce` the motion reduces to immediate/brief states while all content stays available.  
   **Falsifier:** Any supported width produces overflow or clipping, or full motion plays under the reduced-motion preference.

9. **Verification gate:** Real-browser verification passes — both routes return 200, the console is clean of implementation errors, and full-page screenshots at 1440px and 390px are captured as evidence.  
   **Falsifier:** A route errors, console errors appear during the flow, or the evidence screenshots are missing.

## 7. Risks + Rollback Stance

- Font licensing: Mangogrotesque/Barlow may not be freely licensable — fallback
  is a declared closest-equivalent (documented in the build report), never
  hotlinking the reference's font files.
- Motion parity by hand is approximate: the standard is the measured design.md
  plus the reference capture screenshots, judged at the acceptance criteria
  above, not pixel-diff equality.
- Rollback: TS-055's workspace state remains in git history of the product
  checkout; this revision replaces the working tree going forward.

## Working Agents

- **mia** (Engineering) — build WI-1 in the repo checkout.
- **quinn** (Engineering) — real-browser verification per criterion.
- Sequenced by **dev** per `Teams/Engineering/DEPARTMENT-WORKFLOW.md`.

## Context Refs

- store/design-sessions/945dff05-bb4b-4910-90d8-e283f0c6f2c7-design.md (measured tokens)
- workspaces/_reference-captures/www-detroit-paris-20260908/
- store/design-sessions/945dff05-bb4b-4910-90d8-e283f0c6f2c7.json (intent: identical, re-recorded 2026-09-08)

## 8. RICE

| Input | Value | Basis |
|---|---|---|
| Reach | 4 | Every visitor to the novizio product surface |
| Impact | 3 | Operator-ordered correction of a shipped product |
| Confidence | 0.9 | Measured design.md + capture bundle already exist |
| Effort | 4 | One full rebuild of the workspace |
| Evidence level | 3 | Transcript + measured artifacts |
