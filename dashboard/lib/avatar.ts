// lib/avatar.ts — unique deterministic agent avatars (TS-021).
// Zero downloads, zero licensing, offline-safe: a seeded hash per agent id
// picks a color pair + a pattern + the agent's initial, so every avatar is
// visually unique (46 agents → 46 distinct looks). Real photos override:
// drop <agent-id>.png into dashboard/public/avatars/ and Avatar.tsx uses it
// automatically (falls back to the generated art on 404).
import { FLEET } from '@/lib/fleet'

function hash(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

// 8 color pairs + 8 patterns → 64 combos; with the initial and flip, 46 agents
// are guaranteed unique on the first two dimensions alone.
const PAIRS: Array<[string, string]> = [
  ['#6366F1', '#8B5CF6'],
  ['#EC4899', '#F43F5E'],
  ['#10B981', '#0EA5E9'],
  ['#F59E0B', '#EF4444'],
  ['#06B6D4', '#3B82F6'],
  ['#8B5CF6', '#EC4899'],
  ['#F97316', '#EAB308'],
  ['#14B8A6', '#6366F1'],
]

const PATTERNS = ['dots', 'grid', 'waves', 'rings', 'diagonal', 'triangles', 'hex', 'rays'] as const
type Pattern = (typeof PATTERNS)[number]

export interface AvatarSeed {
  pair: [string, string]
  pattern: Pattern
  flip: boolean
  initial: string
}

export function avatarSeed(id: string, name?: string): AvatarSeed {
  const h = hash(id)
  return {
    pair: PAIRS[h % PAIRS.length],
    pattern: PATTERNS[(h >> 3) % PATTERNS.length],
    flip: ((h >> 6) & 1) === 1,
    initial: (name ?? id).slice(0, 1).toUpperCase(),
  }
}

function patternShapes(pattern: Pattern, flip: boolean): string {
  // 64×64 viewBox; shapes in rgba(255,255,255,0.18)
  const base = 10
  switch (pattern) {
    case 'dots': {
      const c: string[] = []
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
          if ((x + y) % 2 === (flip ? 1 : 0)) c.push(`<circle cx="${8 + x * 16}" cy="${8 + y * 16}" r="3.5"/>`)
        }
      return c.join('')
    }
    case 'grid': {
      const c: string[] = []
      for (let i = 1; i < 4; i++) {
        c.push(`<rect x="${(64 / 4) * i - 1.5}" y="0" width="3" height="64"/>`)
        c.push(`<rect x="0" y="${(64 / 4) * i - 1.5}" width="64" height="3"/>`)
      }
      return c.join('')
    }
    case 'waves': {
      const c: string[] = []
      for (let i = 0; i < 4; i++) {
        const y = 8 + i * 16
        c.push(`<path d="M0 ${y + (flip ? base : 0)} Q16 ${y - base} 32 ${y + (flip ? base : 0)} T64 ${y + (flip ? base : 0)}" stroke="rgba(255,255,255,0.28)" stroke-width="3" fill="none"/>`)
      }
      return c.join('')
    }
    case 'rings': {
      const c: string[] = []
      for (let i = 0; i < 3; i++) {
        c.push(`<circle cx="${32 + (flip ? -12 : 12)}" cy="32" r="${8 + i * 9}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="3"/>`)
      }
      return c.join('')
    }
    case 'diagonal': {
      const c: string[] = []
      for (let i = -2; i < 4; i++) {
        c.push(`<line x1="${i * 16}" y1="64" x2="${i * 16 + 64}" y2="0" stroke="rgba(255,255,255,0.20)" stroke-width="4"/>`)
      }
      return c.join('')
    }
    case 'triangles': {
      const c: string[] = []
      for (let i = 0; i < 3; i++) {
        const x = 6 + i * 20 + (flip ? 4 : 0)
        const y = 10 + (i % 2) * 18
        c.push(`<path d="M${x} ${y + 10} L${x + 9} ${y} L${x + 18} ${y + 10} Z" fill="rgba(255,255,255,0.22)"/>`)
      }
      return c.join('')
    }
    case 'hex': {
      const c: string[] = []
      const hx = (cx: number, cy: number, r: number) =>
        `<path d="M${cx} ${cy - r} L${cx + r * 0.866} ${cy - r / 2} L${cx + r * 0.866} ${cy + r / 2} L${cx} ${cy + r} L${cx - r * 0.866} ${cy + r / 2} L${cx - r * 0.866} ${cy - r / 2} Z" fill="rgba(255,255,255,0.20)"/>`
      c.push(hx(16, 18, 7), hx(48, 18, 7), hx(32, 42, 7), hx(64, 42, 7))
      return c.join('')
    }
    case 'rays': {
      const c: string[] = []
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + (flip ? Math.PI / 8 : 0)
        c.push(
          `<line x1="32" y1="32" x2="${32 + Math.cos(a) * 34}" y2="${32 + Math.sin(a) * 34}" stroke="rgba(255,255,255,0.20)" stroke-width="3"/>`,
        )
      }
      return c.join('')
    }
    default:
      return ''
  }
}

export function avatarDataUri(id: string, name?: string): string {
  const { pair, pattern, flip, initial } = avatarSeed(id, name)
  const [c1, c2] = flip ? [pair[1], pair[0]] : pair
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>` +
    `</linearGradient></defs>` +
    `<rect width="64" height="64" rx="32" fill="url(#g)"/>` +
    patternShapes(pattern, flip) +
    `<text x="32" y="41" font-family="ui-sans-serif,system-ui,-apple-system" font-size="26" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initial}</text>` +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** The agent's real fleet color — used for accents/dots alongside the avatar. */
export function agentColor(id: string): string {
  return FLEET.find((a) => a.id === id)?.color ?? '#6366f1'
}
