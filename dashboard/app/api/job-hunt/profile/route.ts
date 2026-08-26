/**
 * /api/job-hunt/profile — singleton master profile for the personal Job Hunt module.
 *
 * One row (id='operator'). Schema pulled from santifer/career-ops
 * (config/profile.example.yml) + MadsLorentzen/ai-job-search
 * (job-application-assistant skill files) per operator instruction 2026-08-15 —
 * see migrations/121_job_hunt_profile.sql for the field-by-field mapping.
 *
 * Service-role only, same pattern as /api/ai-keys — the browser never talks to
 * Supabase directly for this table.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

const PROFILE_ID = 'operator'

export interface JobHuntProfile {
  id: string
  identity: Record<string, unknown>
  target_roles: Record<string, unknown>
  narrative: Record<string, unknown>
  compensation: Record<string, unknown>
  location: Record<string, unknown>
  education: unknown[]
  experience: unknown[]
  projects: unknown[]
  skills: Record<string, unknown>
  publications: unknown[]
  awards: unknown[]
  references: unknown[]
  behavioral: Record<string, unknown>
  evaluation_prefs: Record<string, unknown>
  weights: Record<string, number>
  setup_complete: boolean
  created_at: string
  updated_at: string
}

// ─── GET — fetch the profile (creates an empty one on first read) ─────────────

export async function GET() {
  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('job_hunt_profile')
      .select('*')
      .eq('id', PROFILE_ID)
      .maybeSingle()

    if (error) return Response.json({ error: error.message }, { status: 500 })

    if (data) return Response.json({ profile: data as JobHuntProfile })

    // First visit — create the empty singleton row so GET is always safe to call.
    const { data: created, error: insertErr } = await sb
      .from('job_hunt_profile')
      .insert({ id: PROFILE_ID })
      .select('*')
      .single()

    if (insertErr) return Response.json({ error: insertErr.message }, { status: 500 })
    return Response.json({ profile: created as JobHuntProfile })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

// ─── POST — upsert the profile (partial updates: only send sections that changed) ──

export async function POST(request: NextRequest) {
  let body: Partial<Omit<JobHuntProfile, 'id' | 'created_at' | 'updated_at'>>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const allowedSections = [
    'identity', 'target_roles', 'narrative', 'compensation', 'location',
    'education', 'experience', 'projects', 'skills', 'publications',
    'awards', 'references', 'behavioral', 'evaluation_prefs', 'weights',
    'setup_complete',
  ] as const

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowedSections) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 1) {
    return Response.json({ error: 'no recognized profile fields in body' }, { status: 400 })
  }

  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('job_hunt_profile')
      .upsert({ id: PROFILE_ID, ...updates }, { onConflict: 'id' })
      .select('*')
      .single()

    if (error) {
      console.error('[job-hunt/profile POST] upsert error:', error.message, error.details)
      return Response.json({ error: error.message, details: error.details }, { status: 500 })
    }

    return Response.json({ ok: true, profile: data as JobHuntProfile })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
