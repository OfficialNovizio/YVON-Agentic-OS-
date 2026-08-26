/**
 * /api/job-hunt/sectors/custom — create a sector on the fly (2026-08-25).
 * POST { name } → creates a `custom` catalog row with auto-generated sync
 * keywords, then the client adds it to the Explorer. Live data (posting
 * counts, pay) is computed on the fly from job_postings — no curated
 * demand/pay/PR values are invented for custom sectors.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
}

// Auto-keywords from the display name: base name, individual words, plural/
// singular, and common derivations (branding → brand; designer → design,
// designing; project manager → project management). Best-effort — the
// keyword editor is a follow-up; these feed the pull engines and live counts.
function makeKeywords(name: string): string[] {
  const base = name.trim().toLowerCase()
  const words = base.split(/[^a-z0-9]+/).filter((w) => w.length >= 3 && !['and', 'the', 'for', 'with', 'job'].includes(w))
  const kws = new Set<string>([base])
  for (const w of words) kws.add(w)
  kws.add(base.endsWith('s') ? base.slice(0, -1) : `${base}s`)
  if (base.endsWith('ing')) kws.add(base.slice(0, -3))
  if (base.endsWith('er')) kws.add(base.slice(0, -2))
  if (base.endsWith('er')) kws.add(`${base.slice(0, -2)}ing`)
  if (words.includes('manager')) kws.add(base.replace(/\bmanager\b/, 'management'))
  // Single-word tech (flutter, docker, …): add the common job-title variants.
  if (words.length === 1) {
    kws.add(`${base} developer`)
    kws.add(`${base} engineer`)
  }
  return [...kws].slice(0, 8)
}

export async function POST(request: NextRequest) {
  let body: { name?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const name = (body.name ?? '').trim()
  if (!name || name.length > 60) return Response.json({ error: 'name is required (max 60 chars)' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const id = `custom-${slugify(name) || Date.now().toString(36)}`

    // Dedupe: an existing custom sector with the same id/name is returned as-is.
    const { data: existing } = await sb.from('job_hunt_sector_catalog').select('id').eq('id', id).maybeSingle()
    if (existing) return Response.json({ ok: true, id: existing.id, name })

    const keywords = makeKeywords(name)
    const { data, error } = await sb.from('job_hunt_sector_catalog').insert({
      id, name, keywords,
      description: null, demand: null, typical_pay: null, pr_value: null, teer: null,
      custom: true,
    }).select('id, name, keywords').single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true, id: data.id, name: data.name, keywords: data.keywords })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
