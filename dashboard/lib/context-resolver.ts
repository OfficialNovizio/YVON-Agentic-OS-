// lib/context-resolver.ts — resolve real per-turn context (TS-028), extended
// with real progressive-disclosure skill matching (2026-08-11).
//   · agentContextFor(agentId, query) — agent identity + matched skills
//   · skillDisclosureFor(agentId, query) — same, plus the structured
//     active/inactive/savings result for the phase-02 HUD event
//   · ventureContextFor(slug)   — venture memory from the DB (ventures table)
// Zero-hallucination: only what exists on disk / in the DB is returned.
//
// Matching design (2026-08-11): rag/harness/disclosure.py's own trigger
// matcher looks for a "## Triggers" heading in SKILL.md — checked all 194
// real files in Teams/, zero have one (docs/MASTER.md §4 already corrected
// this: the verified template has no Triggers section). A literal port
// would only ever hit its own no-match fallback. What real files DO have:
// 40/194 carry a frontmatter `triggers: [...]` field (yvon-compile tooling),
// and all 194 have a "## When to Use" section with real bullet conditions.
// So matching here is three-tier against what actually exists: frontmatter
// triggers (strongest) → When-to-Use bullet keyword overlap → skill-name
// substring (weakest, last resort) — same shape as disclosure.py's intent,
// pointed at data that's really there.
//
// Owner: raj + mia · TS-025/TS-028
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { FLEET } from '@/lib/fleet'

const TEAMS_ROOT = join(process.cwd(), '..', 'Teams')

interface SkillDescriptor {
  name: string
  summary: string
  triggers: string[]
  whenToUse: string[]
  content: string
}

function parseTriggers(content: string): string[] {
  const m = content.match(/^triggers:\s*\[(.*)\]\s*$/m)
  if (!m) return []
  return m[1]
    .split(',')
    .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean)
}

function parseWhenToUse(content: string): string[] {
  const out: string[] = []
  let inSection = false
  for (const line of content.split('\n')) {
    if (/^##\s*when to use/i.test(line.trim())) {
      inSection = true
      continue
    }
    if (inSection && /^##\s/.test(line)) break
    if (inSection) {
      const t = line.trim()
      if (t.startsWith('-') || t.startsWith('*')) {
        const item = t.replace(/^[-*]\s*/, '').trim()
        if (item) out.push(item)
      }
    }
  }
  return out
}

function agentSkills(dept: string, agentId: string): SkillDescriptor[] {
  const base = join(TEAMS_ROOT, dept, agentId)
  if (!existsSync(base)) return []
  const out: SkillDescriptor[] = []
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
        out.push({
          name: skill.name,
          summary,
          triggers: parseTriggers(content),
          whenToUse: parseWhenToUse(content),
          content,
        })
      }
    } catch {
      // skip unreadable dirs — degrade, never crash
    }
  }
  return out
}

/** FIX (2026-08-22, cost teardown Cause 06): a matched skill was injected as
 * its ENTIRE SKILL.md, uncapped, up to 5 of them per turn. Mia's five total
 * 51KB (~12.7k tokens) and one marketplace skill alone is 24KB — and every
 * tool-loop iteration re-sends all of it. Live disclosure events show only
 * 0-1 skills matching per turn today, so this is a landmine rather than
 * today's main cost, but it is one line of defence for one constant.
 *
 * The cap is per skill and generous enough that a normal 6-8KB skill is
 * untouched; only outliers are trimmed, and the trim is announced in-band so
 * the agent knows the text is partial rather than silently truncated. */
const SKILL_CHAR_CAP = Number(process.env.YVON_SKILL_CHAR_CAP ?? 8000)

function capSkillBody(name: string, content: string): string {
  if (content.length <= SKILL_CHAR_CAP) return content
  return (
    content.slice(0, SKILL_CHAR_CAP) +
    `\n\n[...${name} truncated at ${SKILL_CHAR_CAP} of ${content.length} characters. ` +
    `Ask the user if you need a section that is not shown above.]`
  )
}

export interface SkillMatch {
  name: string
  summary: string
  reason: string
}

export interface SkillDisclosureResult {
  active: SkillMatch[]
  inactiveCount: number
  totalSkills: number
  savingsPct: number
}

function scoreSkill(skill: SkillDescriptor, queryLower: string): { hit: boolean; reason: string } {
  // Tier 1 — frontmatter triggers: the strongest real signal, when present.
  for (const trig of skill.triggers) {
    const t = trig.toLowerCase()
    if (t.length >= 3 && queryLower.includes(t)) {
      return { hit: true, reason: `trigger "${trig}" matched` }
    }
  }
  // Tier 2 — "When to Use" bullet keyword overlap: every real skill has
  // this section, so it's the signal most turns will actually match on.
  const queryTerms = new Set(queryLower.match(/[a-z]{4,}/g) ?? [])
  for (const bullet of skill.whenToUse) {
    const bulletTerms = new Set(bullet.toLowerCase().match(/[a-z]{4,}/g) ?? [])
    const overlap = [...bulletTerms].filter((t) => queryTerms.has(t))
    if (overlap.length >= 2) {
      return { hit: true, reason: `"when to use" match: ${overlap.slice(0, 3).join(', ')}` }
    }
  }
  // Tier 3 — skill-name substring: last resort, same as disclosure.py's own
  // fallback, kept for the rare case someone names the skill directly.
  const nameWords = skill.name.toLowerCase().replace(/-/g, ' ').split(' ').filter((w) => w.length >= 4)
  if (nameWords.some((w) => queryLower.includes(w))) {
    return { hit: true, reason: 'skill name matched' }
  }
  return { hit: false, reason: '' }
}

/** Matches a query against a skill list. Exported for the HUD/tests to
 * reproduce the same scoring the live turn used. */
export function matchSkillsToQuery(
  skills: SkillDescriptor[],
  query: string,
  maxActive = 5,
): SkillDisclosureResult & { activeFull: (SkillMatch & { content: string })[] } {
  const queryLower = query.toLowerCase()
  const scored = skills.map((s) => ({ skill: s, ...scoreSkill(s, queryLower) }))
  const active = scored.filter((s) => s.hit).slice(0, maxActive)
  const total = skills.length
  const savingsPct = total > 0 ? Math.round(((total - active.length) / total) * 100) : 0
  return {
    active: active.map((a) => ({ name: a.skill.name, summary: a.skill.summary, reason: a.reason })),
    activeFull: active.map((a) => ({ name: a.skill.name, summary: a.skill.summary, reason: a.reason, content: a.skill.content })),
    inactiveCount: total - active.length,
    totalSkills: total,
    savingsPct,
  }
}

/** Identity + progressive-disclosure skill matching for one turn: builds the
 * prompt block (active skills get full SKILL.md body, everything else stays
 * a one-line summary) and returns the structured result for the phase-02
 * HUD event, so Decision shows what this exact turn actually activated. */
export async function skillDisclosureFor(
  agentId: string,
  query: string,
): Promise<{ prompt: string | null; disclosure: SkillDisclosureResult | null }> {
  const agent = FLEET.find((a) => a.id === agentId)
  if (!agent) return { prompt: null, disclosure: null }

  const skills = agentSkills(agent.department, agent.id)
  const header = `AGENT: ${agent.name} — ${agent.role} (${agent.department})`
  if (skills.length === 0) {
    return {
      prompt: `${header}\nSKILLS: (none defined)`,
      disclosure: { active: [], inactiveCount: 0, totalSkills: 0, savingsPct: 0 },
    }
  }

  const result = matchSkillsToQuery(skills, query, 5)
  const activeNames = new Set(result.active.map((a) => a.name))
  const inactiveSkills = skills.filter((s) => !activeNames.has(s.name))

  const lines = [header]
  lines.push(
    result.activeFull.length > 0
      ? `ACTIVE SKILLS (full):\n${result.activeFull.map((a) => `### ${a.name}\n${capSkillBody(a.name, a.content)}`).join('\n\n')}`
      : 'ACTIVE SKILLS: (none matched this turn)',
  )
  lines.push(
    inactiveSkills.length > 0
      ? `OTHER SKILLS (summary only):\n${inactiveSkills.map((s) => `- ${s.name}: ${s.summary}`).join('\n')}`
      : 'OTHER SKILLS: (none)',
  )

  return {
    prompt: lines.join('\n'),
    disclosure: { active: result.active, inactiveCount: result.inactiveCount, totalSkills: result.totalSkills, savingsPct: result.savingsPct },
  }
}

/** The agent's identity + matched skills as a prompt block, or null.
 * Thin wrapper over skillDisclosureFor for callers that only need the
 * prompt text (query defaults to '' — no query context means nothing
 * scores a hit, so it degrades to summaries-only, same as before this
 * function did real matching at all). */
export async function agentContextFor(agentId: string, query = ''): Promise<string | null> {
  const { prompt } = await skillDisclosureFor(agentId, query)
  return prompt
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
