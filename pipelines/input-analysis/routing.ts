// Input Analysis pipeline — agent routing (skills/tools-first + team patterns).
// Selects the primary agent by name + the team; falls back to the orchestrator.
//
// FIX (2026-08-21, concern #3): this used to be a flat if/else-if chain —
// first keyword bucket to match won, full stop. "give me url to view local
// repo with new design" matched nothing in the engineering buckets (none of
// them even listed url/repo/localhost/dev-server as keywords) but DID match
// the bare word "design" in the Brand Studio bucket, so it routed to spark
// (creative direction) for what was actually an infra/preview request. Two
// changes fix this:
//   1. Score every bucket instead of stopping at the first hit — the bucket
//      with the highest total weight wins, so a message with several strong
//      engineering signals isn't derailed by one generic word matching a
//      different bucket first.
//   2. Added the missing infra/preview keywords (url, repo, localhost, dev
//      server, preview, deploy, clone, git...) to ops, and split the
//      dangerously-ambiguous bare "design"/"creative"/"visual" words to a
//      lower weight so they no longer single-handedly outrank a real
//      multi-signal match from another bucket.
export interface AgentRoute {
  primary: string
  team: string[]
  reason: string
  /** Per-bucket scoring for THIS message, highest first (2026-08-22).
   *  Already computed below to pick the winner — it used to be discarded, so
   *  a misroute could only ever be inferred from the outcome. The CAOS panel's
   *  Route step renders this, which is what makes a wrong answer legible:
   *  "ops 7 / dana 2 / spark 0" shows why, where "→ spark" alone never could.
   *  Only buckets that matched at least one keyword appear. */
  scores: RouteScore[]
}

export interface RouteScore {
  agent: string
  score: number
  /** the exact keyword phrases that matched, in bucket order */
  hits: string[]
}

interface Keyword {
  phrase: string
  /** Higher = more specific/unambiguous signal for this bucket. Bare, highly
   *  overloaded words (e.g. "design" — could mean UI, brand, or "redesign of
   *  anything") get 1; multi-word or domain-specific phrases get 2-3. */
  weight: number
}

interface AgentBucket {
  agent: string
  reason: string
  keywords: Keyword[]
}

const kw = (phrase: string, weight = 1): Keyword => ({ phrase, weight })

const BUCKETS: AgentBucket[] = [
  {
    agent: 'mia',
    reason: 'frontend/UI work',
    keywords: [
      kw('frontend', 2), kw('ui', 1), kw('button', 2), kw('page', 1),
      kw('component', 2), kw('css', 2), kw('design system', 3), kw('react', 2),
      kw('layout', 2), kw('styling', 2), kw('ux', 1),
    ],
  },
  {
    agent: 'ops',
    reason: 'devops/infra/preview',
    keywords: [
      kw('deploy', 2), kw('infra', 2), kw('devops', 3), kw('server ops', 3),
      // Added 2026-08-21 — previously missing entirely, which is why a
      // "give me the url to view my local repo" request had nothing here
      // to match against.
      kw('url', 1), kw('localhost', 3), kw('local repo', 3), kw('dev server', 3),
      kw('preview', 2), kw('repo', 1), kw('repository', 1), kw('clone', 2),
      kw('git', 1), kw('github', 2), kw('port ', 2), kw('environment variable', 2),
      kw('ci/cd', 3), kw('pipeline', 1),
    ],
  },
  {
    agent: 'raj',
    reason: 'backend/API work',
    keywords: [
      kw('api', 2), kw('backend', 2), kw('endpoint', 2), kw('route', 1),
      kw('server', 1),
    ],
  },
  {
    agent: 'dana',
    reason: 'data/DB work',
    keywords: [
      kw('data', 1), kw('schema', 2), kw('database', 2), kw('migration', 2),
      kw('query', 1),
    ],
  },
  {
    agent: 'aegis',
    reason: 'security work',
    keywords: [
      kw('security', 2), kw('vulnerability', 3), kw('exploit', 3), kw('attack', 2),
    ],
  },
  {
    agent: 'lena',
    reason: 'brand/copy work',
    keywords: [
      kw('brand', 2), kw('copy', 1), kw('story', 1), kw('voice', 1), kw('content', 1),
    ],
  },
  {
    agent: 'spark',
    reason: 'creative direction',
    keywords: [
      // Deliberately low weight (2026-08-21 fix) — these are the words that
      // used to hijack routing for any message that happened to mention
      // "design" in passing (e.g. wanting to VIEW a design, not create one).
      kw('design', 1), kw('creative', 1), kw('visual', 1),
    ],
  },
  {
    agent: 'echo',
    reason: 'investor relations',
    keywords: [kw('investor', 2), kw('pitch', 2), kw('fundraise', 2)],
  },
  {
    agent: 'vista',
    reason: 'roadmap/strategy',
    keywords: [kw('roadmap', 2), kw('strategy', 2)],
  },
  {
    agent: 'quinn',
    reason: 'verification/QA',
    keywords: [kw('test', 1), kw('verify', 1), kw('qa', 2), kw('gate', 2)],
  },
]

export function routeAgents(message: string): AgentRoute {
  const t = message.toLowerCase()

  // ── Primary agent: score every bucket, highest total weight wins ─────────
  // (replaces the old first-match-wins if/else-if chain — see header comment)
  let primary = 'meta'
  let reason = 'no specific agent skill matched, so meta handles it as the general fallback'
  let bestScore = 0
  const matchedByBucket: { agent: string; score: number; hits: string[] }[] = []

  for (const bucket of BUCKETS) {
    const hits = bucket.keywords.filter((k) => t.includes(k.phrase))
    if (hits.length === 0) continue
    const score = hits.reduce((sum, k) => sum + k.weight, 0)
    matchedByBucket.push({ agent: bucket.agent, score, hits: hits.map((h) => h.phrase) })
    if (score > bestScore) {
      bestScore = score
      primary = bucket.agent
      reason = hits.length > 1
        ? `${bucket.reason} (matched: ${hits.map((h) => h.phrase).join(', ')})`
        : bucket.reason
    }
  }

  // ── Team patterns (multi-agent — the full fleet for build work) ──────────
  const team = new Set<string>([primary])
  const isBuild = /(build|create|add|make|fix|implement|feature|change)/.test(t)
  if (isBuild) {
    if (primary !== 'mia') team.add('mia')       // frontend builder
    if (primary !== 'raj') team.add('raj')       // backend builder
    team.add('quinn')                            // tester + verifier (gate)
    if (t.includes('security') || t.includes('attack') || t.includes('vulnerability')) team.add('cypher') // attacker
  } else if (/info|what|who|how/.test(t)) {
    // info — keep just the primary (fast)
  } else {
    team.add('quinn') // verify anything non-trivial
  }

  // highest first, then alphabetically so equal scores render deterministically
  const scores = matchedByBucket
    .slice()
    .sort((a, b) => (b.score - a.score) || a.agent.localeCompare(b.agent))

  return { primary, team: Array.from(team), reason, scores }
}
