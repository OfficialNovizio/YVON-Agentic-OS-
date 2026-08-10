// Input Analysis pipeline — agent routing (skills/tools-first + team patterns).
// Selects the primary agent by name + the team; falls back to the orchestrator.
export interface AgentRoute {
  primary: string
  team: string[]
  reason: string
}

export function routeAgents(message: string): AgentRoute {
  const t = message.toLowerCase()
  const need = (kw: string[]) => kw.some((k) => t.includes(k))

  // ── Primary agent by skills/tools (from the message's need) ──────────────
  let primary = 'meta'
  let reason = 'orchestrator fallback — no clear agent match'
  if (need(['frontend', 'ui', 'button', 'page', 'component', 'css', 'design system'])) { primary = 'mia'; reason = 'frontend/UI work' }
  else if (need(['api', 'backend', 'endpoint', 'route', 'server'])) { primary = 'raj'; reason = 'backend/API work' }
  else if (need(['data', 'schema', 'database', 'migration', 'query'])) { primary = 'dana'; reason = 'data/DB work' }
  else if (need(['security', 'vulnerability', 'exploit', 'attack'])) { primary = 'aegis'; reason = 'security work' }
  else if (need(['brand', 'copy', 'story', 'voice', 'content'])) { primary = 'lena'; reason = 'brand/copy work' }
  else if (need(['design', 'creative', 'visual'])) { primary = 'spark'; reason = 'creative direction' }
  else if (need(['investor', 'pitch', 'fundraise'])) { primary = 'echo'; reason = 'investor relations' }
  else if (need(['roadmap', 'strategy'])) { primary = 'vista'; reason = 'roadmap/strategy' }
  else if (need(['test', 'verify', 'qa', 'gate'])) { primary = 'quinn'; reason = 'verification/QA' }
  else if (need(['deploy', 'infra', 'devops', 'server ops'])) { primary = 'ops'; reason = 'devops/infra' }

  // ── Team patterns (multi-agent — the full fleet for build work) ──────────
  const team = new Set<string>([primary])
  const isBuild = /(build|create|add|make|fix|implement|feature|change)/.test(t)
  if (isBuild) {
    if (primary !== 'mia') team.add('mia')       // frontend builder
    if (primary !== 'raj') team.add('raj')       // backend builder
    team.add('quinn')                            // tester + verifier (gate)
    if (need(['security', 'attack', 'vulnerability'])) team.add('cypher') // attacker
  } else if (/info|what|who|how/.test(t)) {
    // info — keep just the primary (fast)
  } else {
    team.add('quinn') // verify anything non-trivial
  }

  return { primary, team: Array.from(team), reason }
}
