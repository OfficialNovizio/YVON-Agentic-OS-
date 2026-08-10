// lib/context-resolver.ts — resolve real per-turn context (TS-028).
// Shared by the stream route (inlined — no self-fetch) and /api/chat/context.
//   · agentContextFor(agentId)  — agent identity + skill roster from the repo
//     (Teams/<dept>/<agent>/<custom|marketplace>/<skill>/SKILL.md)
//   · ventureContextFor(slug)   — venture memory from the DB (ventures table)
// Zero-hallucination: only what exists on disk / in the DB is returned.
// Owner: raj + mia · TS-025/TS-028
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { FLEET } from '@/lib/fleet'

const TEAMS_ROOT = join(process.cwd(), '..', 'Teams')

function agentSkills(dept: string, agentId: string): { name: string; summary: string }[] {
  const base = join(TEAMS_ROOT, dept, agentId)
  if (!existsSync(base)) return []
  const out: { name: string; summary: string }[] = []
  for (const location of ['custom', 'marketplace']) {
    const loc = join(base, location)
    if (!existsSync(loc)) continue
    try {
      for (const skill of readdirSync(loc, { withFileTypes: true })) {
        const skillDir = join(loc, skill.name)
        const mdPath = join(skillDir, 'SKILL.md')
        if (!skill.isDirectory() || !existsSync(mdPath)) continue
        const content = readFileSync(mdPath, 'utf-8')
        const desc = content.match(/^description:\s*(.+)$/m)?.[1]?.trim()
        const summary =
          desc ??
          content
            .split('\n')
            .map((l) => l.trim())
            .find((l) => l && !l.startsWith('#') && !l.startsWith('---'))?.slice(0, 120) ??
          ''
        out.push({ name: skill.name, summary })
      }
    } catch {
      // skip unreadable dirs — degrade, never crash
    }
  }
  return out
}

/** The agent's identity + real skills as a prompt block, or null. */
export async function agentContextFor(agentId: string): Promise<string | null> {
  const agent = FLEET.find((a) => a.id === agentId)
  if (!agent) return null
  const skills = agentSkills(agent.department, agent.id)
  const lines = [`AGENT: ${agent.name} — ${agent.role} (${agent.department})`]
  lines.push(
    skills.length > 0
      ? `SKILLS:\n${skills.map((s) => `- ${s.name}: ${s.summary}`).join('\n')}`
      : 'SKILLS: (none defined)',
  )
  return lines.join('\n')
}

/** The venture's memory from the DB as a prompt block, or null (yvon-os = none). */
export async function ventureContextFor(slug: string): Promise<string | null> {
  if (!slug || slug === 'yvon-os') return null
  try {
    const { getVentureBySlug } = await import('@/lib/db/ventures')
    const v = await getVentureBySlug(slug)
    if (v) return `VENTURE MEMORY: ${v.name ?? slug} — ${v.description ?? ''}`
  } catch {
    // DB unavailable — no venture memory
  }
  return null
}
