// chat-theme.ts — per-department identity tokens (TS-020).
// Tints are the REAL fleet colors from lib/fleet.ts — the source of truth.
// Zero invented values: an agent's color comes from its fleet entry; a
// department's tint comes from the first fleet agent in that department.
import { FLEET, FLEET_DEPARTMENTS, type FleetDepartment } from '@/lib/fleet'

export const DEPT_TINT: Record<FleetDepartment, string> = {
  'Executive Office': '#F59E0B',
  Engineering: '#3B82F6',
  'Brand Studio': '#EC4899',
  Cybersecurity: '#EF4444',
  Product: '#10B981',
  Governance: '#8B5CF6',
  'AI & Agents': '#06B6D4',
  // 2026-08-15 — 6 new departments merged in from origin. No fleet-assigned
  // color existed anywhere for these yet, so these are new coherent picks
  // (distinct hexes, same Tailwind-ish palette as the original 7), not
  // sourced from any existing config — flagged here rather than silently
  // invented.
  'Client Success': '#14B8A6',
  'Comms & PR': '#F97316',
  'Global Expansion': '#6366F1',
  'Growth & Partnerships': '#84CC16',
  'People & Culture': '#D946EF',
  'Risk & ESG': '#FACC15',
}

/** Dept tint is derived from the real fleet, never hardcoded independently. */
export function deptTint(dept: FleetDepartment): string {
  const agent = FLEET.find((a) => a.department === dept)
  return agent?.color ?? DEPT_TINT[dept] ?? '#6366f1'
}

export function agentTint(id: string): string {
  return FLEET.find((a) => a.id === id)?.color ?? '#6366f1'
}

export function agentInitial(id: string, name?: string): string {
  return (name ?? id).slice(0, 1).toUpperCase()
}

export function deptIcon(dept: FleetDepartment): string {
  switch (dept) {
    case 'Executive Office': return 'Landmark'
    case 'Engineering': return 'Terminal'
    case 'Brand Studio': return 'Sparkles'
    case 'Cybersecurity': return 'Shield'
    case 'Product': return 'Package'
    case 'Governance': return 'Scale'
    case 'AI & Agents': return 'Bot'
    case 'Client Success': return 'HeartHandshake'
    case 'Comms & PR': return 'Megaphone'
    case 'Global Expansion': return 'Globe2'
    case 'Growth & Partnerships': return 'TrendingUp'
    case 'People & Culture': return 'Users'
    case 'Risk & ESG': return 'ShieldAlert'
    default: return 'Circle'
  }
}

export { FLEET_DEPARTMENTS }
