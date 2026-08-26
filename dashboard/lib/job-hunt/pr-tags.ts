// pr-tags.ts — PR-aware job tagging (2026-08-25).
//
// Best-effort inference from title/description only — never a guarantee:
// the real determination of TEER category, Canadian-experience eligibility,
// or BC PNP in-demand status happens at application time with a human in the
// loop. These flags exist to RANK candidates ("this posting looks PR-
// valuable"), not to decide eligibility. Each tag is a boolean heuristic.

const BC_PNP_TECH_KEYWORDS = [
  'software engineer', 'software developer', 'full stack', 'backend developer', 'frontend developer',
  'web developer', 'computer programmer', 'data scientist', 'data engineer', 'machine learning',
  'devops', 'cloud engineer', 'network engineer', 'systems analyst', 'ux designer', 'ui designer',
  'product manager', 'project manager', 'scrum master', 'qa engineer', 'test engineer',
  'cyber security', 'security engineer', 'database administrator', 'database analyst',
  'mechanical engineer', 'electrical engineer', 'civil engineer', 'aerospace engineer',
  'drone', 'uav', 'robotics', 'telecommunications',
]

const TEER_1_TITLES = ['engineer', 'developer', 'scientist', 'analyst', 'architect', 'designer', 'manager', 'specialist', 'consultant']
const TEER_2_TITLES = ['technician', 'technologist', 'coordinator', 'supervisor', 'administrator', 'nurse']
const TEER_3_TITLES = ['truck driver', 'driver', 'welder', 'carpenter', 'electrician', 'mechanic', 'cook', 'assistant']

const CANADIAN_EXP_SIGNALS = ['canadian experience', 'canadian work experience', 'worked in canada', 'canadian job market']

export interface PrTags {
  teerCategory: string | null // '0' | '1' | '2' | '3' | null
  canadianExp: boolean
  bcPnpInDemand: boolean
}

function textOf(title: string | null | undefined, description: string | null | undefined): string {
  return `${title ?? ''} ${description ?? ''}`.toLowerCase()
}

export function inferPrTags(title?: string | null, description?: string | null): PrTags {
  const text = textOf(title, description)

  let teerCategory: string | null = null
  if (TEER_1_TITLES.some((t) => text.includes(t))) teerCategory = '1'
  else if (TEER_2_TITLES.some((t) => text.includes(t))) teerCategory = '2'
  else if (TEER_3_TITLES.some((t) => text.includes(t))) teerCategory = '3'

  const canadianExp = CANADIAN_EXP_SIGNALS.some((s) => text.includes(s))
  const bcPnpInDemand = BC_PNP_TECH_KEYWORDS.some((k) => text.includes(k))

  return { teerCategory, canadianExp, bcPnpInDemand }
}

export function prValue(tags: PrTags): number {
  // 0-100 heuristic: BC-PNP in-demand + Canadian-experience are the strongest
  // PR signals for the operator's stated goal; TEER 0/1 adds weight.
  let v = 0
  if (tags.bcPnpInDemand) v += 50
  if (tags.canadianExp) v += 35
  if (tags.teerCategory === '0' || tags.teerCategory === '1') v += 15
  else if (tags.teerCategory === '2') v += 8
  else if (tags.teerCategory === '3') v += 3
  return Math.min(100, v)
}
