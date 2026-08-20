// AgentAvatar — unique photo per agent (TS-022).
// Photo sources, in priority order (all free, browser-fetched — no sandbox
// downloads needed):
//   1. /avatars/<agent-id>.png  — your own photos (drop into public/avatars/)
//   2. pravatar.cc              — real photos of people, free (Unsplash CC),
//                                  unique per agent via ?u=<id> (deterministic)
//   3. generated art            — unique deterministic fallback (offline-safe)
// The browser tries the best available source and degrades gracefully.
//
// 2026-08-17 (Adora): the placeholder behind a loading photo is now paper,
// not obsidian — on the light gallery canvas a black disc read as a hole.
'use client'

import { useState } from 'react'
import { avatarDataUri } from '@/lib/avatar'

export function AgentAvatar({
  id,
  name,
  size = 32,
  className,
}: {
  id: string
  name?: string
  size?: number
  className?: string
}) {
  // 0 = local photo, 1 = remote photo (pravatar), 2 = generated art
  const [tier, setTier] = useState(0)
  const generated = avatarDataUri(id, name)
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: 9999,
    background: '#f2f2ee',
    objectFit: 'cover',
    flexShrink: 0,
  }

  if (tier === 0) {
    return (
      <img
        src={`/avatars/${id}.png`}
        alt={name ?? id}
        style={style}
        className={className}
        onError={() => setTier(1)}
        loading="lazy"
      />
    )
  }
  if (tier === 1) {
    // Real photo from a free resource — deterministic + unique per agent.
    return (
      <img
        src={`https://i.pravatar.cc/200?u=${encodeURIComponent(id)}`}
        alt={name ?? id}
        style={style}
        className={className}
        onError={() => setTier(2)}
        loading="lazy"
      />
    )
  }
  return <img src={generated} alt={name ?? id} style={style} className={className} loading="lazy" />
}
