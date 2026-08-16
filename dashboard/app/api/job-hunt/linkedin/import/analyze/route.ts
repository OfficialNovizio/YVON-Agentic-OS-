/**
 * POST /api/job-hunt/linkedin/import/analyze — AI extraction from the
 * operator's uploaded LinkedIn export. Mirrors
 * app/api/job-hunt/resume/analyze/route.ts's general-analysis mode and
 * output shape exactly (skills{programming,domain,tools}, education[],
 * experience[]) so the Resume page's "pick what to add to profile" UI
 * pattern can be reused for LinkedIn import too.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { callSynthesis } from '@/lib/ai-client'
import { parseLinkedInExport, linkedInExportToText } from '@/lib/job-hunt/linkedin-export'

const BUCKET = 'linkedin-imports'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) {
    console.error('[linkedin/import/analyze] model did not return parseable JSON. Raw response (first 500 chars):', text.slice(0, 500))
    const snippet = text.trim() ? text.trim().slice(0, 200) : '(empty response)'
    throw new Error(`Model did not return JSON. Raw response started with: ${snippet}`)
  }
  try {
    return JSON.parse(match[0])
  } catch (e) {
    console.error('[linkedin/import/analyze] matched a { ... } block but it failed to parse:', match[0].slice(0, 500))
    throw new Error(`Model's JSON was malformed: ${e instanceof Error ? e.message : String(e)}`)
  }
}

export async function POST() {
  try {
    const sb = getServiceClient()
    const { data: imp, error: fetchErr } = await sb
      .from('linkedin_imports')
      .select('id, storage_path, analysis_json')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchErr || !imp) return Response.json({ error: 'No LinkedIn export uploaded yet' }, { status: 404 })

    if (imp.analysis_json) {
      return Response.json({ analysis: imp.analysis_json, cached: true })
    }

    const { data: fileData, error: downloadErr } = await sb.storage.from(BUCKET).download(imp.storage_path)
    if (downloadErr || !fileData) return Response.json({ error: 'Could not read LinkedIn export file' }, { status: 500 })

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const parsed = await parseLinkedInExport(buffer)
    const exportText = linkedInExportToText(parsed)
    if (!exportText) return Response.json({ error: 'No profile-relevant data found in the export' }, { status: 422 })

    const prompt = `You are an expert career analyst. Below is structured data extracted from someone's LinkedIn data export (profile, positions, education, skills, and similar sections). Extract it into a JSON object with this exact structure:

{
  "name": "candidate name or empty string",
  "headline": "their LinkedIn headline/tagline if present, else empty string",
  "skills": {
    "programming": ["programming language / ML framework skill", ...],
    "domain": ["domain expertise / industry-specific skill", ...],
    "tools": ["software / tool / platform skill", ...]
  },
  "industries": ["industry 1", "industry 2"],
  "education": [{"degree": "degree name", "institution": "school if present", "period": "years if present", "topics": "key coursework/focus if present"}],
  "experience": [{"title": "job title", "company": "company if present", "start": "start date if present", "end": "end date if present", "location": "location if present", "bullets": "condensed summary of responsibilities/achievements from the description field"}],
  "summary": "3-sentence professional summary based on this data"
}

LinkedIn export data:
${exportText}

Return only valid JSON. No markdown, no explanation.`

    const raw = await callSynthesis({ messages: [{ role: 'user', content: prompt }], maxTokens: 4000, jsonMode: true })
    const analysis = extractJson(raw)

    await sb.from('linkedin_imports').update({ analysis_json: analysis, analyzed_at: new Date().toISOString() }).eq('id', imp.id)

    return Response.json({ analysis })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'LinkedIn import analysis failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
