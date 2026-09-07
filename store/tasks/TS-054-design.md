# Design spec — reference-build session 59e94569-e25b-42fc-8893-e918a0406ebd

- Room: 31b8fd19-f880-477e-98b7-99e39c1f40d9 · Venture: novizio
- Created: 2026-09-06T09:06:04.499Z · Status: motion

## Reference
- URL: https://shop.brunellocucinelli.com/en-gb/
- Taxonomy: static-editorial
- Motion summary: The reference's motion has not yet been verified because the automated motion probe returned HTTP 403; capture and DOM inspection are required before implementation.

## User intent (clone or adapt — the user decided)
- Mode: **adapt**
- Changes requested: Novizio is our own brand — keep the luxury editorial spirit of the reference but make it ours: single hero plus one content section, our own logo, colors and fonts, shorter nav. Keep the scroll feel subtle.
- Decided: 2026-09-06T09:09:50.119Z

## Motion decision (video vs code — the user decided)
- Decision: **code**
- Notes: Carried over from the motion brief recorded earlier in this room (pure code motion, $0) � re-recorded on the session that holds the intent decision after the split-brain repair.
- Decided: 2026-09-06T09:34:42.541Z

## Build recipe
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
    },
    {
      "path": "Teams/Shared OS/skills/impeccable/reference/brand.md",
      "role": "brand register — redesigning for our venture"
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
  "intentNote": "ADAPT — keep the reference's spirit and style, redesign for our venture's brand. Changes requested: Novizio is our own brand — keep the luxury editorial spirit of the reference but make it ours: single hero plus one content section, our own logo, colors and fonts, shorter nav. Keep the scroll feel subtle."
}
```

## History
- 2026-09-06T09:06:04.499Z · session_captured · https://shop.brunellocucinelli.com/en-gb/
- 2026-09-06T09:07:56.961Z · intent_gate_emitted · static-editorial
- 2026-09-06T09:09:50.131Z · intent_recorded · adapt: Novizio is our own brand — keep the luxury editorial spirit of the reference but make it ours: single hero plus one content section, our own logo, colors and fonts, shorter nav. Keep the scroll feel s
- 2026-09-06T09:34:42.541Z · motion_recorded · code: Carried over from the motion brief recorded earlier in this room (pure code motion, $0) � re-recorded on the session that holds the intent decision after the split-brain repair.
- 2026-09-06T09:34:42.543Z · recipe_routed · $0 — every cited library is MIT/OSS and already installed · 3 skill(s) · 0 asset(s) to swap