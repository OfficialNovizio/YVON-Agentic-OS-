// bc-filter.ts — STRICT British Columbia relevance filter (2026-08-25 v2).
//
// v1 treated every remote posting as BC-relevant — that let US/Spain remote
// companies through a "BC" filter, which the operator correctly called out.
// v2 is strict: a posting passes ONLY if its location names BC, a BC city,
// or Canada — OR the location is genuinely remote/anywhere (no city at all,
// so no foreign on-site signal). US/German/Spanish city locations fail,
// even when marked remote. This matches what a "BC companies" filter means.

import { PROVINCE_BY_CODE } from './canada-geo'

const BC_TERMS = ['bc', 'british columbia', 'canada']
// Union with the boards script's city list — locations like "Chilliwack" or
// "Fort St John" that aren't in the geo dataset still match the BC view.
const EXTRA_BC_CITIES = ['whistler', 'squamish', 'coquitlam', 'langley', 'maple ridge', 'new westminster', 'delta', 'chilliwack', 'mission', 'courtenay', 'comox', 'campbell river', 'fort st john', 'quesnel', 'williams lake', 'salmon arm', 'nelson', 'trail', 'golden', 'revelstoke', 'grand forks', 'north vancouver', 'penticton', 'vernon', 'cranbrook', 'dawson creek', 'terrace', 'abbotsford', 'kamloops', 'nanaimo', 'prince george', 'kelowna', 'victoria', 'vancouver', 'burnaby', 'surrey', 'richmond']
const BC_CITIES = new Set([...(PROVINCE_BY_CODE.BC?.cities ?? []).map((c) => c.toLowerCase()), ...EXTRA_BC_CITIES])
// Remote-only signals — a location that is JUST "remote"/"anywhere" with no
// city is apply-from-anywhere; a location naming a foreign city is not.
const REMOTE_TERMS = ['remote', 'anywhere', 'worldwide', 'work from home']

export function isBcRelevant(location: string | null | undefined, remote: boolean | null | undefined): boolean {
  const loc = (location ?? '').toLowerCase().trim()
  if (!loc) return false // unknown location — can't prove BC, don't assume

  // Location names a BC/Canada place → in.
  if (BC_TERMS.some((t) => loc.includes(t))) return true
  for (const city of BC_CITIES) {
    if (loc.includes(city)) return true
  }

  // Location is remote/anywhere with NO city → apply-from-anywhere, in.
  // (remote flag alone is NOT enough — a US city marked "remote" is still US.)
  if (REMOTE_TERMS.some((t) => loc.includes(t))) {
    const hasForeignCity = /[a-z]/.test(loc.replace(REMOTE_TERMS.join('|'), '').trim())
    if (!hasForeignCity) return true
  }

  return false
}

/** Strict location-only rule for the BC VIEW (2026-08-25): remote-only
 *  postings ("Remote"/"Anywhere" with no city) are kept in the DB for a
 *  Remote search, but a "BC companies" view should not be flooded with them.
 *  Passes only when the location names BC/Canada/a BC city. */
export function isBcLocationOnly(location: string | null | undefined): boolean {
  const loc = (location ?? '').toLowerCase().trim()
  if (!loc) return false
  if (BC_TERMS.some((t) => loc.includes(t))) return true
  for (const city of BC_CITIES) {
    if (loc.includes(city)) return true
  }
  return false
}

export function splitBcRelevant<T extends { location?: string | null; remote?: boolean | null }>(
  jobs: T[],
): { kept: T[]; dropped: T[] } {
  const kept: T[] = []
  const dropped: T[] = []
  for (const j of jobs) (isBcRelevant(j.location, j.remote) ? kept : dropped).push(j)
  return { kept, dropped }
}
