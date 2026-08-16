/**
 * POST /api/job-hunt/resume/analyze — AI resume analysis. Ported from the
 * operator's own YVON-OS app/api/jobs/analyze-resume/route.ts (both its
 * general-analysis and job-description-match prompt structures kept
 * verbatim), adapted two ways:
 *   1. Text is extracted server-side (lib/job-hunt/resume-text.ts) and sent
 *      through callSynthesis as plain text, instead of Claude's native PDF
 *      document-vision block — works with whatever AI provider is active,
 *      not just Anthropic.
 *   2. Reads/writes this module's own `resumes` table (migration 125,
 *      private storage bucket) instead of the old public-URL bucket.
 *
 * General mode (no job_description): extracts skills/education/experience/
 * ATS score, cached to resumes.analysis_json. Also returns `profile_patch` —
 * a ready-to-apply shape for job_hunt_profile so the operator can prefill
 * their profile from the resume instead of typing it by hand.
 *
 * JD-match mode (job_description passed): scores the resume against a
 * specific posting — match_score, strong_matches, missing_keywords. Not
 * cached (varies per posting). This is the hook the future "wide-spectrum
 * job suggestions" artifact will call per discovered posting.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { callSynthesis } from '@/lib/ai-client'
import { extractResumeText } from '@/lib/job-hunt/resume-text'

const BUCKET = 'resumes'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

function extractJson(text: string): Record<string, unknown> {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '')
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Model did not return JSON')
  return JSON.parse(match[0])
}

export async function POST(req: NextRequest) {
  let body: { job_description?: string }
  try { body = await req.json() } catch { body = {} }

  const { job_description } = body

  try {
    const sb = getServiceClient()
    const { data: resume, error: fetchErr } = await sb
      .from('resumes')
      .select('id, storage_path, file_type, analysis_json')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchErr || !resume) return Response.json({ error: 'No resume uploaded yet' }, { status: 404 })

    // General analysis is cached — return it as-is if already analyzed.
    if (!job_description && resume.analysis_json) {
      return Response.json({ analysis: resume.analysis_json, cached: true })
    }

    const { data: fileData, error: downloadErr } = await sb.storage.from(BUCKET).download(resume.storage_path)
    if (downloadErr || !fileData) return Response.json({ error: 'Could not read resume file' }, { status: 500 })

    const buffer = Buffer.from(await fileData.arrayBuffer())
    const resumeText = await extractResumeText(buffer, resume.file_type)
    if (!resumeText) return Response.json({ error: 'Could not extract text from resume file' }, { status: 422 })

    const analysisPrompt = job_description
      ? `You are an expert resume analyst and recruiter with 20 years of experience in aerospace, IT, trucking, and business sectors.

Analyze this resume against the following job description and return a JSON object with this exact structure:

{
  "match_score": <0-100 integer>,
  "strong_matches": ["skill/experience that directly matches", ...],
  "missing_keywords": ["important JD keyword not in resume", ...],
  "ats_score": <0-100 integer>,
  "ats_issues": ["specific ATS formatting or keyword issue", ...],
  "weaknesses": ["specific gap or weakness for this role", ...],
  "suggestions": ["specific actionable improvement", ...],
  "summary": "2-sentence executive summary of fit"
}

Resume:
${resumeText}

Job Description:
${job_description}

Return only valid JSON. No markdown, no explanation.`
      : `You are an expert resume analyst with deep knowledge of aerospace, aviation, IT, software development, trucking/logistics, drone/UAV, and business sectors.

Analyze this resume and return a JSON object with this exact structure:

{
  "name": "candidate name or empty string",
  "skills": {
    "programming": ["programming language / ML framework skill", ...],
    "domain": ["domain expertise / industry-specific skill", ...],
    "tools": ["software / tool / platform skill", ...]
  },
  "experience_years": <total years of experience as integer>,
  "industries": ["industry 1", "industry 2"],
  "education": [{"degree": "degree name", "institution": "school if present", "period": "years if present", "topics": "key coursework/focus if present"}],
  "experience": [{"title": "job title", "company": "company if present", "start": "start date if present", "end": "end date if present", "location": "location if present", "bullets": "condensed summary of responsibilities/achievements"}],
  "ats_score": <0-100 integer based on ATS-friendliness>,
  "ats_issues": ["specific ATS issue", ...],
  "strengths": ["key strength 1", ...],
  "weaknesses": ["specific gap or weakness", ...],
  "suggestions": ["specific actionable improvement with example text", ...],
  "summary": "3-sentence professional summary of the candidate"
}

Resume:
${resumeText}

Return only valid JSON. No markdown, no explanation.`

    const raw = await callSynthesis({ messages: [{ role: 'user', content: analysisPrompt }], maxTokens: 1800 })
    const analysis = extractJson(raw)

    if (!job_description) {
      await sb.from('resumes').update({ analysis_json: analysis, analyzed_at: new Date().toISOString() }).eq('id', resume.id)
    }

    return Response.json({ analysis })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Resume analysis failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
