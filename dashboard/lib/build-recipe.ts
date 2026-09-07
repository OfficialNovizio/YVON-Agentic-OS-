// build-recipe.ts — the deterministic recipe router (re-engineer Phase 4,
// 2026-09-05). Stage 4 of the target flow: once the intent and motion gates
// are answered, route (taxonomy, motion decision, intent, product home) to a
// concrete BuildRecipe — stack, animation libraries, exact fleet skill paths,
// named machinery with licenses, asset plan + hybrid swap list, verify step,
// cost.
//
// A curated rules table, not a free-form generator: every skill path cited
// was verified on disk (build-recipe.test.ts re-verifies with fs.existsSync
// on every path), license claims match lib/motion-brief.ts's grounding, and
// costs reuse the motion-brief figures. The router is pure and
// deterministic — same input, same recipe — so the design.md recipe section
// can never drift from what the build actually loads.
//
// Product home (user decision 3): workspaces/<venture>/ — real project roots,
// matching the VPS per-venture clone convention REPO_WORKSPACES_DIR/<venture>.
//
// Owner: dev · design-to-product re-engineer, 2026-09-05

import type { DesignIntent, MotionDecision, ReferenceTaxonomy } from './design-session'

/** A fleet skill or reference file the build MUST load before writing code
 * (the token-burn fix: skills are selected at work time, not after). */
export interface RecipeSkill {
  path: string
  role: string
}

/** One planned asset: what it is, where it comes from, and whether the
 * hybrid asset-swap gate must replace it before real delivery. */
export interface RecipeAsset {
  kind: 'video' | 'image' | 'still-sequence' | 'copy' | 'data'
  what: string
  origin: 'reference' | 'generated' | 'licensed' | 'owned'
  /** True when the asset-swap gate must replace this before delivery. */
  swapRequired: boolean
  note?: string
}

// A type alias, not an interface: the design-session record stores the
// recipe as Record<string, unknown>, and only object type aliases carry the
// implicit index signature that assignment requires.
export type BuildRecipe = {
  /** Product home — workspaces/<venture>/ (real project root). */
  home: string
  /** Framework + structural libraries. */
  stack: string[]
  /** Motion layer: what actually animates the page. */
  motionLibs: string[]
  /** Exact fleet skill paths to load at build time. */
  skills: RecipeSkill[]
  /** The asset plan — including the swap list when motion === 'reference'. */
  assetPlan: RecipeAsset[]
  /** How many assetPlan entries the asset-swap gate must replace. */
  assetsNeedSwapping: number
  /** The verification gate this recipe's build must pass (quinn's). */
  verifyStep: string
  cost: string
  costConfidence: 'estimated' | 'verified'
  /** Obligations the pipeline enforces (asset-swap gate, krea probe). */
  obligations: string[]
  /** What the intent decision means for the build. */
  intentNote: string
  /** Set when the taxonomy shapes or cautions the recipe. */
  taxonomyNote?: string
}

/** Verified fleet skill paths — build-recipe.test.ts fs-checks each one, so
 * a path here going stale fails tests loudly instead of rotting silently. */
export const RECIPE_SKILL_PATHS = {
  impeccable: 'Teams/Shared OS/skills/impeccable/SKILL.md',
  impeccableAnimate: 'Teams/Shared OS/skills/impeccable/reference/animate.md',
  impeccableBrand: 'Teams/Shared OS/skills/impeccable/reference/brand.md',
  impeccableCraft: 'Teams/Shared OS/skills/impeccable/reference/craft.md',
  scrollWorld: 'Teams/Engineering/mia/marketplace/scroll-world/SKILL.md',
  scrubEngine: 'Teams/Engineering/mia/marketplace/scroll-world/references/scrub-engine.js',
  knockout: 'Teams/Engineering/mia/marketplace/scroll-world/references/knockout.py',
  scrollPipeline: 'Teams/Engineering/mia/marketplace/scroll-world/references/pipeline.md',
  scrollTemplate: 'Teams/Engineering/mia/marketplace/scroll-world/references/index-template.html',
  kreaGenerate: 'dashboard/app/api/krea/generate/route.ts',
  kreaGenerateVideo: 'dashboard/app/api/krea/generate-video/route.ts',
  kreaStatus: 'dashboard/app/api/krea/status/route.ts',
  verificationSkill: 'Teams/Shared OS/skills/verification-before-completion/SKILL.md',
} as const

export interface RecipeInput {
  taxonomy?: ReferenceTaxonomy
  motion: MotionDecision['decision']
  intent: DesignIntent['mode']
  /** Adapt mode: the user's requested changes, baked into intentNote. */
  changes?: string
  /** Venture slug — product home becomes workspaces/<venture>/. */
  venture?: string
}

export function buildRecipe(input: RecipeInput): BuildRecipe {
  const { taxonomy, motion, intent } = input
  const home = `workspaces/${input.venture || '<venture>'}/`

  const intentNote =
    intent === 'identical'
      ? 'IDENTICAL CLONE — replicate the reference\'s structure, layout, sections and motion exactly; all text and imagery replaced with our venture\'s own content and brand.'
      : `ADAPT — keep the reference's spirit and style, redesign for our venture's brand.${
          input.changes ? ` Changes requested: ${input.changes}` : ''}`

  // Motion decision drives the motion layer + cost; taxonomy adjusts.
  let motionLibs: string[]
  let skills: RecipeSkill[]
  let assetPlan: RecipeAsset[]
  let cost: string
  let costConfidence: BuildRecipe['costConfidence']
  let obligations: string[]

  switch (motion) {
    case 'code': {
      motionLibs = [
        'CSS @keyframes / transitions',
        'gsap + ScrollTrigger (installed, MIT)',
        '@gsap/react (installed, MIT)',
        'motion (installed, MIT)',
      ]
      skills = [
        { path: RECIPE_SKILL_PATHS.impeccable, role: 'frontend design skill — the build runs under it' },
        { path: RECIPE_SKILL_PATHS.impeccableAnimate, role: 'motion design rules (reveals, scroll choreography, micro-interactions)' },
        ...(intent === 'adapt' ? [{ path: RECIPE_SKILL_PATHS.impeccableBrand, role: 'brand register — redesigning for our venture' }] : []),
      ]
      assetPlan = [
        { kind: 'copy', what: 'all copy — written fresh for our venture', origin: 'owned', swapRequired: false },
        { kind: 'image', what: 'imagery — licensed/stock/AI-generated, no reference media', origin: 'generated', swapRequired: false, note: 'nothing borrowed, nothing to swap' },
      ]
      cost = '$0 — every cited library is MIT/OSS and already installed'
      costConfidence = 'verified'
      obligations = []
      break
    }
    case 'video': {
      motionLibs = [
        'scroll-scrub engine (scrub-engine.js — framework-agnostic, consumes frame sequences)',
        'CSS @keyframes for the non-photoreal remainder',
      ]
      skills = [
        { path: RECIPE_SKILL_PATHS.scrollWorld, role: 'the scroll-scrub cinematic build skill' },
        { path: RECIPE_SKILL_PATHS.scrubEngine, role: 'scrubs pre-rendered frames against scroll position' },
        { path: RECIPE_SKILL_PATHS.scrollPipeline, role: 'krea.ai scene + video generation pipeline' },
        { path: RECIPE_SKILL_PATHS.kreaGenerate, role: 'krea image generation endpoint' },
        { path: RECIPE_SKILL_PATHS.kreaGenerateVideo, role: 'krea video generation endpoint' },
        { path: RECIPE_SKILL_PATHS.kreaStatus, role: 'krea generation status polling' },
      ]
      assetPlan = [
        { kind: 'still-sequence', what: 'scene stills via krea (subject, art direction per scene enumerated in the brief)', origin: 'generated', swapRequired: false, note: 'KREA_API_KEY registered in secrets.ts — not yet set' },
        { kind: 'video', what: 'scene videos via krea → extracted to frame sequences for the scrub engine', origin: 'generated', swapRequired: false },
        { kind: 'copy', what: 'all copy — written fresh for our venture', origin: 'owned', swapRequired: false },
      ]
      cost = '~$27 for a 6-scene AI-video chain (~$4.50/scene) — estimate'
      costConfidence = 'estimated'
      obligations = [
        'krea qualification probe runs before the build starts — the AI-video client is half self-declared unverified in the fleet tool inventory',
      ]
      break
    }
    case 'mixed': {
      motionLibs = [
        'CSS @keyframes / transitions (elements, text, icons, routes)',
        'gsap + ScrollTrigger (installed, MIT) — scroll-triggered choreography',
        '@gsap/react (installed, MIT)',
        'motion (installed, MIT)',
        'scroll-scrub engine (scrub-engine.js) — the one AI-video scrub track',
      ]
      skills = [
        { path: RECIPE_SKILL_PATHS.impeccable, role: 'frontend design skill — the build runs under it' },
        { path: RECIPE_SKILL_PATHS.impeccableAnimate, role: 'code-motion rules' },
        { path: RECIPE_SKILL_PATHS.scrollWorld, role: 'the video-scrub track (hero / scroll narrative)' },
        { path: RECIPE_SKILL_PATHS.scrubEngine, role: 'scrubs the video frame sequence on scroll' },
        { path: RECIPE_SKILL_PATHS.scrollPipeline, role: 'krea generation pipeline for the video track' },
        ...(intent === 'adapt' ? [{ path: RECIPE_SKILL_PATHS.impeccableBrand, role: 'brand register — redesigning for our venture' }] : []),
      ]
      assetPlan = [
        { kind: 'video', what: 'ONE AI-video scene (hero / scroll narrative) via krea → frame sequence', origin: 'generated', swapRequired: false, note: 'KREA_API_KEY registered in secrets.ts — not yet set' },
        { kind: 'image', what: 'all other imagery — licensed/stock/AI-generated', origin: 'generated', swapRequired: false },
        { kind: 'copy', what: 'all copy — written fresh for our venture', origin: 'owned', swapRequired: false },
      ]
      cost = '~$4.50 for the single AI-video scene (estimate) + $0 code motion'
      costConfidence = 'estimated'
      obligations = [
        'krea qualification probe runs before the build starts — the AI-video client is half self-declared unverified in the fleet tool inventory',
      ]
      break
    }
    case 'reference': {
      // Hybrid (user decision 1): design and preview with the reference's own
      // media; every borrowed asset is tracked and swapped before delivery.
      motionLibs = [
        'the reference\'s own motion machinery (per motion-profile.md fingerprint — mirrored, not reimplemented)',
        'gsap + ScrollTrigger (installed, MIT) — for structure the reference ships prebuilt media for',
      ]
      skills = [
        { path: RECIPE_SKILL_PATHS.impeccable, role: 'frontend design skill — the build runs under it' },
        { path: RECIPE_SKILL_PATHS.impeccableAnimate, role: 'code-motion rules for the parts not covered by borrowed media' },
        { path: RECIPE_SKILL_PATHS.scrollWorld, role: 'loaded only if the reference\'s motion is scroll-scrubbed video' },
      ]
      assetPlan = [
        { kind: 'video', what: 'every video the reference itself ships (from the motion-profile.md media inventory)', origin: 'reference', swapRequired: true, note: 'borrowed for design + preview only' },
        { kind: 'image', what: 'every image the reference itself ships (from the motion-profile.md media inventory)', origin: 'reference', swapRequired: true, note: 'borrowed for design + preview only' },
        { kind: 'copy', what: 'all copy — written fresh for our venture (never borrowed)', origin: 'owned', swapRequired: false },
      ]
      cost = '$0 build cost — media is the reference\'s own (borrowed, swap-gated)'
      costConfidence = 'verified'
      obligations = [
        'asset-swap gate before real delivery — every borrowed reference asset replaced with a licensed/owned equivalent; delivery approval requires swap confirmation or explicit waiver',
      ]
      break
    }
  }

  // Taxonomy adjusts the plan (honest notes, never overrides the user's
  // motion decision).
  let taxonomyNote: string | undefined
  if (taxonomy === 'static-editorial' && motion !== 'code') {
    taxonomyNote = 'The reference is static-editorial (the motion probe found no motion system) yet a non-code motion path was picked — confirm the brief actually needs video before generating.'
  } else if (taxonomy === 'immersive-3d' && motion === 'code') {
    taxonomyNote = 'The reference is immersive-3D; three.js is NOT installed (OSS, MIT) — add it on demand if the brief needs true 3D rather than CSS/gsap approximation.'
  } else if (taxonomy === 'dashboard') {
    taxonomyNote = 'The reference is a dashboard — motion should stay functional (state transitions, not decoration); load impeccable\'s product register.'
  } else if (taxonomy === 'video-led' && motion === 'code') {
    taxonomyNote = 'The reference is video-led; pure code cannot reproduce its photoreal content — expect the brief to lean back toward a video track.'
  } else if (taxonomy === 'unknown') {
    taxonomyNote = 'Taxonomy unknown — the motion-profile.md in the session record is the source of truth for what the reference actually does.'
  }

  const motionMarker =
    motion === 'video' || motion === 'mixed'
      ? 'the <video>/frame-sequence scrub actually renders and scrubs on scroll'
      : motion === 'reference'
        ? 'the borrowed media loads and the reference\'s motion behaviour is reproduced'
        : 'the @keyframes/ScrollTrigger motion actually renders'

  return {
    home,
    stack: ['Next.js App Router + Tailwind (fleet standard)', ...(motion === 'video' ? ['static-first page (scrub engine is framework-agnostic)'] : [])],
    motionLibs,
    skills,
    assetPlan,
    assetsNeedSwapping: assetPlan.filter((a) => a.swapRequired).length,
    verifyStep: `quinn real-browser gate: load the build and confirm ${motionMarker}; console clean; prefers-reduced-motion respected; then the design-flow e2e. Runs under Teams/Shared OS/skills/verification-before-completion/.`,
    cost,
    costConfidence,
    obligations,
    intentNote,
    taxonomyNote,
  }
}
