// /brain — Graph Memory. The YVON graph viewer: core orb + department ring
// (level 1) → department + its agents (level 2). Structure is REAL, generated
// from the Teams/ tree by scripts/build-structure.mjs (prebuild) → /structure.json.
// Activity glow arrives when the run-event pipeline lands; the demo pulse toggle
// is clearly marked as simulated. Owner: mia · dashboard brief §3.1/§3.4.
'use client'

import YvonGraph from '@/components/YvonGraph'

export default function BrainPage() {
  return <YvonGraph />
}
