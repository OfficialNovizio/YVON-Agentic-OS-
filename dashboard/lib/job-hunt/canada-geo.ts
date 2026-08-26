/**
 * Canada province/city reference data — bundled, not scraped. Sourced from
 * dr5hn/countries-states-cities-database (ODbL licensed, github.com/dr5hn/
 * countries-states-cities-database), pulled via git sparse-checkout on
 * 2026-08-15 and trimmed to just province code/name + city names (no lat/
 * long/timezone — not needed for a filter dropdown). 13 provinces/
 * territories, 1080 cities total. Used to power the Companies page's
 * province -> city cascading multi-select filter, independent of which
 * cities happen to already have a seed company in them.
 *
 * ODbL requires attribution for redistribution of the database itself; this
 * comment + the `_source` field in canada-geo.json serve that purpose for
 * this internal, non-redistributed use.
 */

import raw from './canada-geo.json'

export interface Province {
  code: string
  name: string
  type: 'province' | 'territory'
  cities: string[]
}

interface RawShape {
  provinces: Record<string, { name: string; type: string; cities: string[] }>
}

const data = raw as unknown as RawShape

export const PROVINCES: Province[] = Object.entries(data.provinces)
  .map(([code, p]) => ({ code, name: p.name, type: p.type as 'province' | 'territory', cities: p.cities }))
  .sort((a, b) => a.name.localeCompare(b.name))

export const PROVINCE_BY_CODE: Record<string, Province> = Object.fromEntries(PROVINCES.map((p) => [p.code, p]))

/** Cities across a set of province codes, deduped + sorted. Empty input -> all cities (all provinces). */
export function citiesFor(provinceCodes: string[]): string[] {
  const codes = provinceCodes.length ? provinceCodes : PROVINCES.map((p) => p.code)
  const set = new Set<string>()
  for (const code of codes) for (const c of PROVINCE_BY_CODE[code]?.cities ?? []) set.add(c)
  return [...set].sort()
}
