// GET /api/fleet/skills — real skill chips per agent, scanned from the Teams
// tree (each agent's custom/ + marketplace/ skill directories, by SKILL.md).
//
// Zero-hallucination contract: when the Teams tree isn't reachable (e.g.
// Vercel serverless without the repo mounted), returns {} — the UI hides the
// chip row. Never invents skills.
// Owner: mia · TS-020
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'
import { FLEET, type FleetAgent } from '@/lib/fleet'

const TEAMS_ROOT = join(process.cwd(), '..', 'Teams')

function skillsFor(agent: FleetAgent): string[] {
  const base = join(TEAMS_ROOT, agent.department, agent.id)
  if (!existsSync(base)) return []
  const dirs = ['custom', 'marketplace']
  const skills: string[] = []
  for (const d of dirs) {
    const full = join(base, d)
    if (!existsSync(full)) continue
    try {
      for (const entry of readdirSync(full, { withFileTypes: true })) {
        if (entry.isDirectory() && existsSync(join(full, entry.name, 'SKILL.md'))) {
          skills.push(entry.name)
        }
      }
    } catch {
      // skip unreadable dirs — degrade, never crash
    }
  }
  return skills
}

export async function GET(): Promise<Response> {
  const hasTeams = existsSync(TEAMS_ROOT)
  if (!hasTeams) {
    return Response.json({ skills: {}, hasTeams: false })
  }
  const skills: Record<string, string[]> = {}
  for (const agent of FLEET) {
    const list = skillsFor(agent)
    if (list.length > 0) skills[agent.id] = list
  }
  return Response.json({ skills, hasTeams: true })
}
