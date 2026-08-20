// Atelier.tsx — the Adora visual layer for /chat.
//
// Three pieces, all dependency-free (no three.js, no image files, no bundle
// cost) and all driven by REAL data — never decoration for its own sake:
//
//   AtelierBackdrop — impressionist oil-paint washes bleeding behind the
//     thread. Idle: a slow 26s drift. Live: the same washes speed up and
//     saturate, so "the workforce is thinking" is legible from across a room.
//   Squiggle       — the hand-drawn SVG underline the system puts beneath
//     1–2 words of a display heading. Draws itself on mount.
//   WorkforceOrb   — a real 3D point-sphere of the fleet, one point per agent,
//     coloured by its department tint, rotated and perspective-projected on a
//     canvas. Agents that are actually live (from /api/agent-status) burn
//     brighter and pulse. Rendered in the empty state.
//
// Owner: design system · redesign 2026-08-17
'use client'

import { useEffect, useMemo, useRef } from 'react'
import { FLEET } from '@/lib/fleet'

const REDUCED = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// ── Painterly backdrop ────────────────────────────────────────────────────
// Pastels only, per the system: sky tint, cotton candy, lime spritz. Blurred
// to 72px so they read as oil paint, never as gradients.
const WASHES = [
  { c: 'var(--chat-sky)', top: '-14%', left: '-8%', w: '46vw', h: '46vw', delay: '0s' },
  { c: 'var(--chat-candy)', top: '32%', left: '58%', w: '38vw', h: '38vw', delay: '-9s' },
  { c: 'var(--chat-lime)', top: '64%', left: '4%', w: '34vw', h: '34vw', delay: '-17s' },
  { c: 'rgba(89,46,255,0.16)', top: '6%', left: '66%', w: '28vw', h: '28vw', delay: '-4s' },
]

export function AtelierBackdrop() {
  return (
    <div className="chat-canvas" aria-hidden>
      {WASHES.map((w, i) => (
        <i
          key={i}
          style={{
            background: w.c,
            top: w.top,
            left: w.left,
            width: w.w,
            height: w.h,
            animationDelay: w.delay,
          }}
        />
      ))}
    </div>
  )
}

// ── Hand-drawn squiggle ───────────────────────────────────────────────────
export function Squiggle({
  children,
  color = 'var(--adora-lime)', // pastel wash per Adora spec — squiggles use decoration pastels, not badge chromatics
}: {
  children: React.ReactNode
  color?: string
}) {
  // The `--dash` custom property is what @keyframes adora-draw reads, so it
  // has to ride along in the inline style; CSSProperties has no index
  // signature, hence the cast.
  const strokeStyle = {
    strokeDasharray: 200,
    '--dash': '200',
    animation: 'adora-draw 900ms cubic-bezier(0.22,1,0.36,1) 200ms both',
  } as React.CSSProperties

  return (
    <span className="adora-squiggle">
      {children}
      <svg viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden>
        <path
          d="M1 8.4C13 2.6 21 2.2 32 7.4c11 5.2 19 5.4 30 .4 11-5 19-5.2 30 .2 7.6 3.8 16 3.4 27-1.6"
          fill="none"
          stroke={color}
          strokeWidth="3.4"
          strokeLinecap="round"
          style={strokeStyle}
        />
      </svg>
    </span>
  )
}

// ── Workforce orb (3D) ────────────────────────────────────────────────────
interface OrbPoint {
  x: number
  y: number
  z: number
  color: string
  id: string
}

/** Fibonacci sphere — even point distribution, no clustering at the poles. */
function sphere(n: number): { x: number; y: number; z: number }[] {
  const pts: { x: number; y: number; z: number }[] = []
  const golden = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(1, n - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const theta = golden * i
    pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r })
  }
  return pts
}

export function WorkforceOrb({
  size = 190,
  live = {},
  active = false,
  className,
}: {
  size?: number
  /** real per-agent status from /api/agent-status — never invented */
  live?: Record<string, string>
  /** true while a turn is in flight — the orb spins up */
  active?: boolean
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const liveRef = useRef(live)
  const activeRef = useRef(active)
  liveRef.current = live
  activeRef.current = active

  const points = useMemo<OrbPoint[]>(() => {
    const coords = sphere(FLEET.length)
    return FLEET.map((a, i) => ({ ...coords[i], color: a.color, id: a.id }))
  }, [])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const radius = size * 0.38
    const reduced = REDUCED()

    let angle = 0
    let raf = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      const speed = activeRef.current ? 0.00042 : 0.00013
      if (!reduced) angle += dt * speed

      ctx.clearRect(0, 0, size, size)

      const sin = Math.sin(angle)
      const cos = Math.cos(angle)
      // Fixed tilt so the sphere reads as a globe, not a flat ring.
      const tilt = -0.42
      const st = Math.sin(tilt)
      const ct = Math.cos(tilt)

      const projected = points.map((p) => {
        // Y-axis spin, then X-axis tilt.
        const x1 = p.x * cos - p.z * sin
        const z1 = p.x * sin + p.z * cos
        const y2 = p.y * ct - z1 * st
        const z2 = p.y * st + z1 * ct
        const depth = (z2 + 1) / 2 // 0 = far, 1 = near
        const persp = 0.68 + depth * 0.42
        return {
          sx: cx + x1 * radius * persp,
          sy: cy + y2 * radius * persp,
          depth,
          color: p.color,
          isLive: liveRef.current[p.id] === 'active',
        }
      })

      projected.sort((a, b) => a.depth - b.depth)

      for (const p of projected) {
        const base = 1.35 + p.depth * 2.15
        const r = p.isLive ? base * 1.55 : base
        const alpha = 0.14 + p.depth * 0.74

        if (p.isLive) {
          const halo = 0.28 + 0.18 * Math.sin(now / 340)
          ctx.globalAlpha = alpha * halo
          ctx.fillStyle = p.color
          ctx.beginPath()
          ctx.arc(p.sx, p.sy, r * 3.1, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [points, size])

  return (
    <canvas
      ref={ref}
      style={{ width: size, height: size }}
      className={className}
      role="img"
      aria-label={`${FLEET.length} agents`}
    />
  )
}
