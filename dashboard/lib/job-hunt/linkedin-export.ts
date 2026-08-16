/**
 * lib/job-hunt/linkedin-export.ts — parses a LinkedIn "Download your data"
 * export ZIP into plain structured text ready for AI extraction.
 *
 * NOT a scraper. The operator downloads this file themselves from LinkedIn
 * Settings & Privacy > "Get a copy of your data" — this only reads the file
 * after the fact. See app/api/job-hunt/linkedin/import/route.ts for why:
 * scraping (even one's own profile) risks account restriction and violates
 * LinkedIn's ToS, which this whole Job Hunt module has avoided from the
 * start per the operator's own standing instruction.
 *
 * LinkedIn doesn't publish a formal schema for the export's CSV columns,
 * and it has changed over time (confirmed via multiple third-party
 * writeups, not LinkedIn documentation, since LinkedIn's own help pages
 * describe the *contents* of the export but not exact column names). So
 * this deliberately does NOT hardcode column positions/names. Each CSV's
 * header row is parsed dynamically into key -> value objects, and the
 * resulting structured JSON is handed to the AI extraction prompt (same
 * pattern as resume analysis) — robust to whatever LinkedIn's actual
 * column names are, rather than guessing and silently returning nothing
 * if a guess is wrong.
 *
 * PRIVACY ALLOWLIST: the export ZIP also contains sensitive files
 * (Connections.csv, Ad_Targeting.csv, Inferences_about_you.csv, job
 * application screening-question responses, etc.) that have nothing to do
 * with building a career profile. This parser only reads files matching
 * PROFILE_RELEVANT_FILES below — everything else in the ZIP is never
 * opened, never read, never sent anywhere, regardless of what's in it.
 */

import JSZip from 'jszip'
import Papa from 'papaparse'

// Case-insensitive match against the ZIP entry's base filename (without
// path prefix — LinkedIn exports sometimes nest files in a subfolder).
const PROFILE_RELEVANT_FILES = [
  'profile.csv',
  'positions.csv',
  'education.csv',
  'skills.csv',
  'certifications.csv',
  'organizations.csv',
  'volunteering.csv',
] as const

export interface LinkedInExportData {
  filesFound: string[]
  sections: Record<string, Record<string, string>[]>
}

export async function parseLinkedInExport(buffer: Buffer): Promise<LinkedInExportData> {
  const zip = await JSZip.loadAsync(buffer)
  const sections: Record<string, Record<string, string>[]> = {}
  const filesFound: string[] = []

  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue
    const baseName = path.split('/').pop()?.toLowerCase() ?? ''
    if (!PROFILE_RELEVANT_FILES.includes(baseName as typeof PROFILE_RELEVANT_FILES[number])) continue

    const csvText = await entry.async('string')
    const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true })
    if (parsed.data.length === 0) continue

    const sectionKey = baseName.replace(/\.csv$/, '')
    sections[sectionKey] = parsed.data
    filesFound.push(baseName)
  }

  return { filesFound, sections }
}

/** Renders parsed sections into a compact text block for the AI prompt. */
export function linkedInExportToText(data: LinkedInExportData): string {
  const parts: string[] = []
  for (const [section, rows] of Object.entries(data.sections)) {
    parts.push(`## ${section}`)
    for (const row of rows) {
      const line = Object.entries(row)
        .filter(([, v]) => v && v.trim())
        .map(([k, v]) => `${k}: ${v}`)
        .join(' | ')
      if (line) parts.push(`- ${line}`)
    }
    parts.push('')
  }
  return parts.join('\n').trim()
}
