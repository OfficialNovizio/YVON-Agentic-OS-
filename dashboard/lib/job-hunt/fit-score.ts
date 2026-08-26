// fit-score.ts — per-posting fit scoring (2026-08-25).
//
// Adopts the scoring framework of santifer/career-ops (10-dimension 1-5) and
// MadsLorentzen/ai-job-search (5-dimension /rank) onto this project's own
// profile schema — whose weights are already seeded verbatim from
// ai-job-search (migration 121: Technical 30 / Experience 25 / Behavioral 15
// / Career Alignment 30, location pass/fail, not weighted). Deal-breakers
// veto outright, matching career-ops' "don't apply below threshold" rule.
//
// Pure function — no I/O, testable, used by /api/job-hunt/postings.

export interface FitProfile {
  skills?: { programming?: string[]; domain?: string[]; tools?: string[] }
  target_roles?: { primary?: string[]; archetypes?: { name?: string }[] }
  behavioral?: { fit_keywords?: string[]; friction_keywords?: string[] }
  evaluation_prefs?: {
    deal_breakers?: string[]
    career_goals?: string[]
    energizing_tasks?: string[]
    draining_tasks?: string[]
    culture_screen_require?: string[]
  }
  weights?: { technical_skills: number; experience_match: number; behavioral_fit: number; career_alignment: number }
  compensation?: { target_range?: string; location_flexibility?: string }
  location?: { country?: string; city?: string; authorized_in?: string[] }
}

export interface PostingForFit {
  title?: string | null
  company?: string | null
  description?: string | null
  location?: string | null
  remote?: boolean | null
  salary_min?: number | null
  salary_max?: number | null
}

export interface FitScore {
  /** 0–100. 0 = vetoed. */
  score: number
  vetoed: boolean
  vetoReason: string | null
  breakdown: { technical_skills: number; experience_match: number; behavioral_fit: number; career_alignment: number }
  /** Location is pass/fail, not weighted (per the profile's own note). */
  location_ok: boolean | null
}

const DEFAULT_WEIGHTS = { technical_skills: 30, experience_match: 25, behavioral_fit: 15, career_alignment: 30 }

function terms(...parts: (string | null | undefined)[]): string[] {
  const set = new Set<string>()
  for (const p of parts) {
    if (!p) continue
    for (const m of p.toLowerCase().matchAll(/[a-z][a-z0-9+#.]{2,}/g)) set.add(m[0])
  }
  return [...set]
}

/** Fraction (0..1) of `needle` terms that appear in `haystack`. Empty needle → neutral. */
function coverage(needle: string[], haystack: string[]): number {
  if (needle.length === 0) return 0.5
  const hit = needle.filter((t) => haystack.includes(t)).length
  return hit / needle.length
}

function containsAny(termsToCheck: string[], haystack: string[]): string | null {
  for (const t of termsToCheck) if (haystack.includes(t)) return t
  return null
}

export function scorePosting(profile: FitProfile, posting: PostingForFit): FitScore {
  const jd = terms(posting.title, posting.description, posting.company)
  const weights = { ...DEFAULT_WEIGHTS, ...(profile.weights ?? {}) }
  const zero = { technical_skills: 0, experience_match: 0, behavioral_fit: 0, career_alignment: 0 }

  // ── Veto: deal-breakers (hard reject, career-ops Block-G style) ──────────
  const dealBreakers = profile.evaluation_prefs?.deal_breakers ?? []
  if (dealBreakers.length > 0) {
    const hit = containsAny(terms(...dealBreakers), jd)
    if (hit) {
      return { score: 0, vetoed: true, vetoReason: `Deal-breaker: "${hit}"`, breakdown: zero, location_ok: null }
    }
  }

  // ── Dimension 1: Technical skills (30%) ──────────────────────────────────
  const skillTerms = terms(
    ...(profile.skills?.programming ?? []),
    ...(profile.skills?.domain ?? []),
    ...(profile.skills?.tools ?? []),
  )
  const tech = Math.round(coverage(skillTerms, jd) * 100)

  // ── Dimension 2: Experience match (25%) ──────────────────────────────────
  const roleTerms = terms(
    ...(profile.target_roles?.primary ?? []),
    ...(profile.target_roles?.archetypes ?? []).map((a) => a.name ?? ''),
  )
  const exp = Math.round(coverage(roleTerms, jd) * 100)

  // ── Dimension 3: Behavioral fit (15%) — fit keywords raise, friction caps ─
  const fitHits = (profile.behavioral?.fit_keywords ?? []).filter((k) => jd.includes(k)).length
  const frictionHits = (profile.behavioral?.friction_keywords ?? []).filter((k) => jd.includes(k)).length
  let beh = 50 + fitHits * 12 - frictionHits * 20
  if ((profile.behavioral?.culture_screen_require?.length ?? 0) > 0 && fitHits === 0) beh = Math.min(beh, 45)
  beh = Math.max(0, Math.min(100, beh))

  // ── Dimension 4: Career alignment (30%) — goals/energizers raise, drains cap
  const goalTerms = terms(...(profile.evaluation_prefs?.career_goals ?? []), ...(profile.evaluation_prefs?.energizing_tasks ?? []))
  const goalCoverage = coverage(goalTerms, jd)
  const drainHits = (profile.evaluation_prefs?.draining_tasks ?? []).filter((k) => jd.includes(k)).length
  let car = Math.round(goalCoverage * 100)
  if (drainHits > 0) car = Math.min(car, 40)
  car = Math.max(0, Math.min(100, car))

  // ── Location: pass/fail flag, not weighted ───────────────────────────────
  let locationOk: boolean | null = null
  if (posting.remote) {
    locationOk = true
  } else if (posting.location) {
    const hay = posting.location.toLowerCase()
    const authorized = (profile.location?.authorized_in ?? []).map((c) => c.toLowerCase())
    if (authorized.length > 0) locationOk = authorized.some((c) => hay.includes(c) || c.includes(hay.split(',')[0]?.trim() ?? ''))
  }

  const score = Math.round(
    (tech * weights.technical_skills + exp * weights.experience_match + beh * weights.behavioral_fit + car * weights.career_alignment) / 100,
  )

  return {
    score,
    vetoed: false,
    vetoReason: null,
    breakdown: { technical_skills: tech, experience_match: exp, behavioral_fit: beh, career_alignment: car },
    location_ok: locationOk,
  }
}
