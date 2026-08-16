/**
 * /api/job-hunt/linkedin/import — upload the operator's own LinkedIn
 * data-export ZIP ("Get a copy of your data"). NOT scraping — see
 * lib/job-hunt/linkedin-export.ts. Mirrors app/api/job-hunt/resume/route.ts:
 * one current import, private storage bucket, replace-on-upload.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { parseLinkedInExport } from '@/lib/job-hunt/linkedin-export'

const BUCKET = 'linkedin-imports'
const MAX_MB = 50 // LinkedIn exports with activity history can run large

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET() {
  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('linkedin_imports')
      .select('id, files_found, analysis_json, analyzed_at, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ import: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let form: FormData
  try { form = await req.formData() } catch { return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 }) }

  const file = form.get('file') as File | null
  if (!file) return Response.json({ error: 'file is required' }, { status: 400 })
  if (!file.name.toLowerCase().endsWith('.zip') && file.type !== 'application/zip') {
    return Response.json({ error: 'Expected the .zip file from LinkedIn\'s data export' }, { status: 415 })
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    return Response.json({ error: `File too large — max ${MAX_MB} MB` }, { status: 413 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    // Parse up front so we fail fast on a bad/empty zip before storing anything.
    const parsed = await parseLinkedInExport(buffer)
    if (parsed.filesFound.length === 0) {
      return Response.json({
        error: 'No recognizable LinkedIn profile files found in this ZIP (looked for Profile.csv, Positions.csv, Education.csv, Skills.csv, Certifications.csv, Organizations.csv, Volunteering.csv). Make sure this is the full data export ZIP from LinkedIn, not a different file.',
      }, { status: 422 })
    }

    const sb = getServiceClient()

    // Single-current-import model: clear any prior one first.
    const { data: prior } = await sb.from('linkedin_imports').select('id, storage_path').order('created_at', { ascending: false })
    if (prior?.length) {
      await sb.storage.from(BUCKET).remove(prior.map((r) => r.storage_path))
      await sb.from('linkedin_imports').delete().in('id', prior.map((r) => r.id))
    }

    const storagePath = `${Date.now()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}.zip`
    const { error: uploadErr } = await sb.storage.from(BUCKET).upload(storagePath, buffer, { contentType: 'application/zip', upsert: false })
    if (uploadErr) return Response.json({ error: uploadErr.message }, { status: 500 })

    const { data, error: dbErr } = await sb
      .from('linkedin_imports')
      .insert({ storage_path: storagePath, files_found: parsed.filesFound })
      .select('id, files_found, created_at')
      .single()

    if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })
    return Response.json({ import: data }, { status: 201 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const sb = getServiceClient()
    const { data: rows } = await sb.from('linkedin_imports').select('id, storage_path')
    if (rows?.length) {
      await sb.storage.from(BUCKET).remove(rows.map((r) => r.storage_path))
      await sb.from('linkedin_imports').delete().in('id', rows.map((r) => r.id))
    }
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
