// /brain — Graph Memory. The YVON graph viewer: core orb + department ring
// (level 1) → department + its agents (level 2). Structure is REAL, generated
// from the Teams/ tree by scripts/build-structure.mjs (prebuild) → /structure.json.
// Activity glow arrives when the run-event pipeline lands; the demo pulse toggle
// is clearly marked as simulated. Owner: mia · dashboard brief §3.1/§3.4.
//
// 2026-08-26: renders EMBEDDED inside the app shell (was full-viewport fixed,
// which covered the sidebar and blocked nav — "can't change tabs to software
// pipeline"). The embedded variant keeps the canvas inside this box; the
// Expand button on /brain-wiki opens this tab.
'use client'

import YvonGraph from '@/components/YvonGraph'

export default function BrainPage() {
  return (
    <div className="relative h-[calc(100vh-140px)] overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0c]">
      <YvonGraph embedded />
    </div>
  )
}
