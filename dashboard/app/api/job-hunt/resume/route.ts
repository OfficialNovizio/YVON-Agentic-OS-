/**
 * /api/job-hunt/resume — the operator's current resume (upload replaces it;
 * this Job Hunt module treats resume as a single current file, not a
 * versioned vault, per operator instruction 2026-08-15). File lives in the
 * private 'resumes' Storage bucket (migration 125) — never publicly
 * fetchable by URL, unlike the original YVON-OS design.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const BUCKET = 'resumes'
const MAX_MB = 10
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

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
      .from('resumes')
      .select('id, name, industry_tag, file_type, analysis_json, analyzed_at, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ resume: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let form: FormData
  try { form = await req.formData() } catch { return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 }) }

  const file = form.get('file') as File | null
  const industryTag = (form.get('industry_tag') as string | null) ?? 'General'

  if (!file) return Response.json({ error: 'file is required' }, { status: 400 })
  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: 'Only PDF and DOCX files are accepted' }, { status: 415 })
  }
  if (file.size > MAX_MB * 1024 * 1024) {
    return Response.json({ error: `File too large — max ${MAX_MB} MB` }, { status: 413 })
  }

  try {
    const sb = getServiceClient()

    // Single-current-resume model: clear any prior resume (file + row) first.
    const { data: prior } = await sb.from('resumes').select('id, storage_path').order('created_at', { ascending: false })
    if (prior?.length) {
      await sb.storage.from(BUCKET).remove(prior.map((r) => r.storage_path))
      await sb.from('resumes').delete().in('id', prior.map((r) => r.id))
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
    const storagePath = `${Date.now()}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadErr } = await sb.storage.from(BUCKET).upload(storagePath, buffer, { contentType: file.type, upsert: false })
    if (uploadErr) return Response.json({ error: uploadErr.message }, { status: 500 })

    const { data, error: dbErr } = await sb
      .from('resumes')
      .insert({ name: file.name, industry_tag: industryTag, storage_path: storagePath, file_type: file.type })
      .select('id, name, industry_tag, file_type, created_at')
      .single()

    if (dbErr) return Response.json({ error: dbErr.message }, { status: 500 })
    return Response.json({ resume: data }, { status: 201 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const sb = getServiceClient()
    const { data: rows } = await sb.from('resumes').select('id, storage_path')
    if (rows?.length) {
      await sb.storage.from(BUCKET).remove(rows.map((r) => r.storage_path))
      await sb.from('resumes').delete().in('id', rows.map((r) => r.id))
    }
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
