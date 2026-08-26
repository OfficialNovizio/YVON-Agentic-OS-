// crs-estimate.ts — CRS score ESTIMATE (2026-08-25, rebuilt).
//
// Follows the official IRCC Comprehensive Ranking System grid structure
// (verified against 2026 published tables):
//   Core human capital (max 500 single / 460 with spouse): age, education,
//   first + second official language, Canadian work experience.
//   Spouse/partner factors (max 40, accompanying spouse only).
//   Skill transferability (max 100 — education+language, education+Canadian
//   work, foreign work+language, foreign+Canadian work; best of each half).
//   Additional points (max 600): PNP +600, French NCLC7 +25/+50, Canadian
//   study +15/+30, sibling +15. Arranged-employment (job-offer) points were
//   REMOVED by IRCC on March 25, 2025 — they contribute 0.
// Assumptions (documented): CLB is uniform across all four abilities; foreign
// credentials count only with an ECA; trade certificate combinations are not
// modelled (adds up to 50 if applicable). Planning aid only — the real number
// comes from IRCC's official CRS tool.

export interface CrsInput {
  age: number
  education: 'phd' | 'masters' | 'two_plus' | 'bachelors' | 'diploma2' | 'diploma1' | 'secondary' | 'none'
  clb: number                 // first official language CLB (4-10)
  secondClb?: number          // second official language CLB (0 = none)
  canadianYears: number       // 0-5 (cap at 5)
  foreignYears: number        // 0-5 (cap at 5)
  spouse?: {
    education: CrsInput['education']
    clb: number
    canadianYears: number
  }
  pnpNomination?: boolean     // +600
  frenchNclc7?: boolean       // French NCLC 7+ in all abilities
  canadianStudyYears?: 0 | 1 | 2   // 0 none · 1 = 1-2 yr credential · 2 = 3+ yr credential
  siblingCanada?: boolean     // +15
  certificateOfQualification?: boolean   // Canadian trade certificate (+25/50 via language)
}

// ── Core: age (official grid; 18-35 peak, declining to 50) ────────────────
const AGE_SINGLE: Record<number, number> = { 18: 110, 19: 110, 20: 110, 21: 110, 22: 110, 23: 110, 24: 110, 25: 110, 26: 110, 27: 110, 28: 110, 29: 110, 30: 110, 31: 110, 32: 110, 33: 110, 34: 110, 35: 110, 36: 105, 37: 99, 38: 94, 39: 90, 40: 85, 41: 79, 42: 74, 43: 68, 44: 63, 45: 57, 46: 51, 47: 45, 48: 39, 49: 33, 50: 27 }
const AGE_SPOUSE: Record<number, number> = { 18: 100, 19: 100, 20: 100, 21: 100, 22: 100, 23: 100, 24: 100, 25: 100, 26: 100, 27: 100, 28: 100, 29: 100, 30: 100, 31: 100, 32: 100, 33: 100, 34: 100, 35: 100, 36: 95, 37: 90, 38: 85, 39: 80, 40: 75, 41: 70, 42: 65, 43: 60, 44: 55, 45: 50, 46: 45, 47: 40, 48: 35, 49: 30, 50: 25 }

// ── Core: education (single / with spouse) ────────────────────────────────
const EDUCATION_SINGLE: Record<CrsInput['education'], number> = { phd: 150, masters: 135, two_plus: 128, bachelors: 120, diploma2: 98, diploma1: 90, secondary: 30, none: 0 }
const EDUCATION_SPOUSE: Record<CrsInput['education'], number> = { phd: 140, masters: 126, two_plus: 119, bachelors: 112, diploma2: 91, diploma1: 84, secondary: 28, none: 0 }

// ── Core: first official language, per ability (single / with spouse) ─────
const FIRST_LANG_SINGLE: Record<number, number> = { 10: 34, 9: 32, 8: 27, 7: 23, 6: 19, 5: 15, 4: 9 }
const FIRST_LANG_SPOUSE: Record<number, number> = { 10: 32, 9: 29, 8: 25, 7: 21, 6: 17, 5: 13, 4: 8 }

// ── Core: second official language, per ability ───────────────────────────
const SECOND_LANG_SINGLE: Record<number, number> = { 9: 6, 8: 2, 7: 2, 6: 2, 5: 2, 4: 0 }
const SECOND_LANG_SPOUSE: Record<number, number> = { 9: 5, 8: 2, 7: 2, 6: 2, 5: 2, 4: 0 }

// ── Core: Canadian work experience (single / with spouse) ─────────────────
const CANADIAN_SINGLE: Record<number, number> = { 0: 0, 1: 40, 2: 53, 3: 64, 4: 72, 5: 80 }
const CANADIAN_SPOUSE: Record<number, number> = { 0: 0, 1: 35, 2: 46, 3: 56, 4: 63, 5: 70 }

// ── Spouse/partner factors (max 40) ───────────────────────────────────────
const SPOUSE_EDUCATION: Record<string, number> = { phd: 10, masters: 10, two_plus: 9, bachelors: 8, diploma2: 7, diploma1: 6, secondary: 2, none: 0 }
const SPOUSE_LANG_PER_ABILITY: Record<number, number> = { 9: 5, 8: 3, 7: 3, 6: 1, 5: 1, 4: 0 }
const SPOUSE_CANADIAN: Record<number, number> = { 0: 0, 1: 5, 2: 7, 3: 8, 4: 9, 5: 10 }

export interface CrsEstimate {
  total: number
  breakdown: { age: number; education: number; language: number; secondLanguage: number; canadianWork: number; spouse: number; transferability: number; additional: number }
  notes: string[]
}

export function estimateCrs(input: CrsInput): CrsEstimate {
  const notes: string[] = []
  const hasSpouse = Boolean(input.spouse)
  const age = (hasSpouse ? AGE_SPOUSE : AGE_SINGLE)[input.age] ?? 0
  const education = (hasSpouse ? EDUCATION_SPOUSE : EDUCATION_SINGLE)[input.education] ?? 0

  const clb = Math.max(4, Math.min(10, input.clb))
  const language = (hasSpouse ? FIRST_LANG_SPOUSE : FIRST_LANG_SINGLE)[clb] * 4

  const secondClb = Math.max(0, Math.min(10, input.secondClb ?? 0))
  const secondLanguage = secondClb >= 5
    ? (hasSpouse ? SECOND_LANG_SPOUSE : SECOND_LANG_SINGLE)[Math.min(9, secondClb)] * 4
    : 0

  const canadianYears = Math.max(0, Math.min(5, input.canadianYears))
  const canadianWork = (hasSpouse ? CANADIAN_SPOUSE : CANADIAN_SINGLE)[canadianYears] ?? 0
  const foreignYears = Math.max(0, Math.min(5, input.foreignYears))

  // ── Spouse factors (max 40) ──
  let spouse = 0
  if (hasSpouse && input.spouse && input.spouse.education !== 'none') {
    const s = input.spouse
    const sEdu = SPOUSE_EDUCATION[s.education] ?? 0
    const sClb = Math.max(4, Math.min(10, s.clb))
    const sLang = (SPOUSE_LANG_PER_ABILITY[Math.min(9, sClb)] ?? 0) * 4
    const sCan = SPOUSE_CANADIAN[Math.max(0, Math.min(5, s.canadianYears))] ?? 0
    spouse = sEdu + sLang + sCan
  }

  // ── Skill transferability (max 100). Per the OFFICIAL calculator's own
  // worked output (foreign subtotal 38 = A 25 + B 13), each half SUMS its
  // combinations and caps at 50; total caps at 100.
  const postSecondary = input.education !== 'secondary' && input.education !== 'none'
  const higherEdu = input.education === 'two_plus' || input.education === 'masters' || input.education === 'phd'
  const goodLang = clb >= 9
  const midLang = clb >= 7

  // Half 1 — education-based combinations (sum, cap 50).
  let eduHalf = 0
  if (postSecondary) {
    const eduLang = goodLang ? (higherEdu ? 50 : 25) : midLang ? 25 : 0
    const eduCan = canadianYears >= 2 ? (higherEdu ? 50 : 25) : canadianYears >= 1 ? 25 : 0
    eduHalf = Math.min(50, eduLang + eduCan)
  }

  // Half 2 — foreign-work-based combinations (sum, cap 50).
  let workHalf = 0
  if (foreignYears >= 3) {
    const fwLang = goodLang ? 50 : midLang ? 25 : 0
    const fwCan = canadianYears >= 2 ? 50 : canadianYears >= 1 ? 25 : 0
    workHalf = Math.min(50, fwLang + fwCan)
  } else if (foreignYears >= 1) {
    const fwLang = goodLang ? 25 : midLang ? 13 : 0
    const fwCan = canadianYears >= 2 ? 25 : canadianYears >= 1 ? 13 : 0
    workHalf = Math.min(50, fwLang + fwCan)
  }

  // Certificate of qualification + language (own combo, inside the 100 cap).
  const certHalf = input.certificateOfQualification ? (clb >= 7 ? 50 : clb >= 5 ? 25 : 0) : 0

  const transferability = Math.min(100, eduHalf + workHalf + certHalf)

  // ── Additional points (max 600) ──
  let additional = 0
  if (input.pnpNomination) additional += 600
  if (input.frenchNclc7) additional += clb >= 5 ? 50 : 25
  if (input.canadianStudyYears === 1) additional += 15
  if (input.canadianStudyYears === 2) additional += 30
  if (input.siblingCanada) additional += 15

  notes.push('Estimate only — CLB assumed equal across all four abilities; foreign credentials need an ECA; verify with IRCC’s official CRS tool.')
  if (hasSpouse) notes.push('Accompanying-spouse model: core is capped at 460 and spouse factors (max 40) are added — model both scenarios if your spouse could stay home.')
  if (input.frenchNclc7) notes.push('French bonus: 25 pts at English CLB 4 or less, 50 pts at CLB 5+ — and French opens lower-cutoff category draws.')
  notes.push('Arranged-employment (job-offer) points were removed by IRCC on March 25, 2025 — a job offer adds 0 to the CRS score.')
  if (transferability === 0 && postSecondary) notes.push('Skill transferability adds nothing yet — CLB 7+ across all abilities or more Canadian/foreign work unlocks up to 100 pts.')

  const core = age + education + language + secondLanguage + canadianWork
  const total = Math.min(1200, core + spouse + transferability + additional)

  return {
    total,
    breakdown: { age, education, language, secondLanguage, canadianWork, spouse, transferability, additional },
    notes,
  }
}

export type PrChance = 'strong' | 'competitive' | 'close' | 'needs-work'

export function chanceAgainstCutoff(score: number, cutoff: number): { tier: PrChance; label: string } {
  if (score >= cutoff + 50) return { tier: 'strong', label: 'Strong — clears recent cutoffs with room to spare' }
  if (score >= cutoff) return { tier: 'competitive', label: 'Competitive — you would clear recent cutoffs' }
  if (score >= cutoff - 50) return { tier: 'close', label: 'Close — boost points (language, Canadian experience) or consider a BC PNP nomination (+600)' }
  return { tier: 'needs-work', label: 'Needs work — a BC PNP nomination (+600) is the realistic path' }
}
