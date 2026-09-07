// motion-brief.ts — the fixed Motion Options Brief (re-engineer Phase 3,
// 2026-09-05). The comparison the operator asked for — always presented, not
// a budget rule: what video-based motion achieves and why, what pure CSS/JS
// + GSAP + Lottie achieves and why, and a per-motion-need interchange
// analysis (what changes if we substitute one for the other).
//
// This lib is DATA, deliberately: the wrapper's design-gate fence supplies
// only the per-reference OBSERVED motion needs (what the reference actually
// animates — from the motion profile); the what/why/cost facts below are
// curated constants so the brief can never hallucinate a price, a license,
// or a capability. The MotionBriefCard renders brief + needs; nothing here
// calls anything.
//
// Grounding (this repo's own evidence, 2026-09-05):
//   - gsap + ScrollTrigger installed in dashboard/package.json (MIT since
//     GSAP 3.13); lottie-web is the OSS Lottie player; both already part of
//     the fleet's motion skillset.
//   - Teams/Engineering/mia/marketplace/scroll-world/references/
//     scrub-engine.js — the scroll-scrub runtime that consumes video frame
//     sequences; krea (AI video) is HALF SELF-DECLARED UNVERIFIED in the
//     fleet's tool inventory — that flag is carried, not hidden.
//   - The ~$27/6-scene figure is the operator's own working estimate for an
//     AI-video chain (~$4.50/scene), recorded as an estimate, not a quote.
//
// Owner: dev · design-to-product re-engineer, 2026-09-05

export interface MotionColumn {
  id: 'video' | 'code'
  title: string
  /** What it achieves, one tight paragraph. */
  what: string
  /** Why it achieves what code (or video) cannot. */
  why: string
  /** Cost with its confidence, verbatim-rendered. */
  cost: string
  costConfidence: 'estimated' | 'verified'
  /** Extra payload/runtime risks the user should weigh. */
  risks: string[]
  /** The concrete machinery this repo would use. */
  tooling: string[]
  /** True when a dependency is not yet qualification-tested. */
  hasUnverifiedDependency: boolean
}

export const VIDEO_COLUMN: MotionColumn = {
  id: 'video',
  title: 'Video-based motion',
  what: 'AI-generated video clips — broken into frame sequences and scrubbed against scroll position. Produces photoreal, cinematic motion: fabric, smoke, liquids, camera moves, product beauty shots, character animation.',
  why: 'This is the majority case for premium marketing sites\' scroll animation, and the ONLY option for imagery that CSS cannot synthesize. A scroll-scrubbed video makes the page feel filmed rather than assembled — nothing in the code-motion toolkit fakes that.',
  cost: '~$27 for a 6-scene AI-video chain (~$4.50/scene)',
  costConfidence: 'estimated',
  risks: [
    'Per-scene generation cost scales with how many scenes you commission',
    'Frame sequences are payload-heavy — every scene is dozens of images to preload',
    'Generation is iterative: first renders rarely match the art direction',
    'The AI-video client (krea) is half self-declared unverified in our tool inventory — a qualification probe runs before any build picks this path',
  ],
  tooling: ['AI video generation (krea)', 'frame extraction', 'mia/scroll-world scrub-engine.js (installed)'],
  hasUnverifiedDependency: true,
}

export const CODE_COLUMN: MotionColumn = {
  id: 'code',
  title: 'Pure code motion — CSS/JS + GSAP + Lottie',
  what: 'Element, text, icon and route motion: scroll-triggered reveals, parallax, marquees, pinned sequences, transforms, micro-interactions, Lottie illustrations.',
  why: 'Crisp at any DPI, accessible (prefers-reduced-motion), tiny payload, and directly reproducible of the reference\'s own machinery — the motion probe fingerprints exactly these libraries (gsap/ScrollTrigger, lenis, lottie) on motion-marketing references. $0 and MIT-licensed; already installed in this repo.',
  cost: '$0 — gsap, @gsap/react and motion are MIT and installed; lottie-web is OSS, added on demand',
  costConfidence: 'verified',
  risks: [
    'Cannot produce photoreal imagery — abstract shapes, gradients and UI motion only',
    'Complex scrubbed sequences take build time to art-direct',
  ],
  tooling: ['CSS @keyframes / transitions', 'gsap + ScrollTrigger (installed)', 'motion (installed)', 'lottie-web (npm add on demand)', 'lenis smooth-scroll (fingerprinted on references — npm add on demand)'],
  hasUnverifiedDependency: false,
}

/** One motion need the agent OBSERVED in the reference (design-gate fence,
 * stage "motion") — the row input the MotionBriefCard renders above the
 * fixed interchange table. Fields optional: the stream-route sanitizer
 * drops anything invalid before this reaches the card. */
export interface MotionNeed {
  need?: string
  reference?: string
  bestPath?: 'video' | 'code' | 'either'
  why?: string
}

export interface InterchangeRow {
  /** The motion need, phrased as the reference exhibits it. */
  need: string
  /** What the video path looks like for this need. */
  videoPath: string
  /** What the code path looks like for this need. */
  codePath: string
  /** What actually changes if you swap one for the other. */
  swapEffect: string
  /** Which path usually wins and why — a default, not a rule. */
  defaultWinner: 'video' | 'code' | 'either'
}

export const INTERCHANGE_TABLE: InterchangeRow[] = [
  {
    need: 'Hero / background motion loop',
    videoPath: 'Autoplaying ambient video (the reference\'s own, or generated) — instant production value',
    codePath: 'Animated gradients, drifting shapes, canvas particles — clean but abstract',
    swapEffect: 'Video → code loses photorealism and gains page weight savings + perfect responsiveness. Code → video adds asset cost and a poster-frame fallback obligation.',
    defaultWinner: 'video',
  },
  {
    need: 'Scroll-scrubbed narrative (the scroll animation majority case)',
    videoPath: 'AI video → frames → scrub-engine.js scrubs frames against scroll — cinematic, heavy',
    codePath: 'GSAP ScrollTrigger pinned sequences + transforms — $0, crisp, limited to non-photoreal content',
    swapEffect: 'This is the big interchange: video buys film-quality storytelling at ~$27/6-scene + payload; code buys the same choreography for transforms/sequences at $0. Photoreal content cannot be substituted.',
    defaultWinner: 'either',
  },
  {
    need: 'Text and element entrances',
    videoPath: 'Technically possible; absurd — rendering text as video kills accessibility and SEO',
    codePath: 'CSS keyframes + gsap.from() — staggered reveals, split-text, the standard toolkit',
    swapEffect: 'Swapping to video loses text selectability, a11y and layout reflow. There is no real trade — code wins outright.',
    defaultWinner: 'code',
  },
  {
    need: 'Icons and micro-interactions',
    videoPath: 'Not viable — sub-second loops need frame-precision video does not give',
    codePath: 'CSS transitions + Lottie for complex illustration loops',
    swapEffect: 'No meaningful video path exists; code wins outright.',
    defaultWinner: 'code',
  },
  {
    need: 'Page and route transitions',
    videoPath: 'Impractical — transitions must react to navigation timing video cannot predict',
    codePath: 'gsap timelines + view-transition/Barba-style choreography',
    swapEffect: 'Video cannot substitute; code wins outright.',
    defaultWinner: 'code',
  },
  {
    need: 'Ambient particles / 3D',
    videoPath: 'Pre-rendered loops work as backgrounds but cannot react to input',
    codePath: 'three.js / canvas particles — interactive, but a real bundle-size and perf cost',
    swapEffect: 'Video buys cheap ambience; code buys interactivity. Choose by whether the effect must respond to the cursor.',
    defaultWinner: 'code',
  },
]

/** The four decision options the card offers — the user picks one. */
export interface MotionOption {
  id: 'reference' | 'code' | 'video' | 'mixed'
  title: string
  detail: string
  /** Set when picking this option carries an obligation the pipeline enforces later. */
  obligation?: string
}

export const MOTION_OPTIONS: MotionOption[] = [
  {
    id: 'reference',
    title: 'Reuse the reference\'s own motion assets',
    detail: 'Design and preview with the reference\'s own videos/loops. Fastest to a faithful result; every borrowed asset is tracked for replacement.',
    obligation: 'Before real delivery: asset-swap gate — every borrowed asset replaced with licensed/owned equivalents.',
  },
  {
    id: 'code',
    title: 'Pure code motion ($0)',
    detail: 'Reproduce the reference\'s motion with CSS + gsap + Lottie. Everything except photoreal content; nothing to license or swap.',
  },
  {
    id: 'video',
    title: 'AI video scrub',
    detail: 'Generate the scroll-narrative as AI video, break it into frames, scrub it on scroll (scrub-engine.js). Cinematic; costs per scene and adds payload.',
    obligation: 'krea qualification probe runs before the build starts.',
  },
  {
    id: 'mixed',
    title: 'Mixed — code motion + one video scrub',
    detail: 'Code motion for elements/text/icons/routes; one AI-video scrub for the hero/scroll narrative. The common premium-site shape.',
    obligation: 'krea qualification probe runs before the build starts.',
  },
]
