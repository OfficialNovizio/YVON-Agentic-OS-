import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const adminSb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

async function getApiKey(): Promise<string> {
  const { data } = await adminSb
    .from('ai_provider_keys')
    .select('api_key')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return (data?.api_key as string | null) ?? process.env.ANTHROPIC_API_KEY ?? ''
}

export async function POST(req: NextRequest) {
  let body: { resume_id?: string; job_description?: string; resume_url?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { resume_id, job_description, resume_url } = body

  let fileUrl = resume_url
  if (resume_id && !fileUrl) {
    const { data, error } = await supabase.from('resumes').select('file_url, analysis_json').eq('id', resume_id).single()
    if (error) return Response.json({ error: error.message }, { status: 404 })
    // Return cached analysis if no job description provided (general analysis already done)
    if (!job_description && data.analysis_json) {
      return Response.json({ analysis: data.analysis_json, cached: true })
    }
    fileUrl = data.file_url
  }

  if (!fileUrl) return Response.json({ error: 'resume_id or resume_url is required' }, { status: 400 })

  // Fetch the resume file as base64
  let base64: string
  try {
    const res = await fetch(fileUrl)
    const buf = await res.arrayBuffer()
    base64    = Buffer.from(buf).toString('base64')
  } catch {
    return Response.json({ error: 'Could not fetch resume file' }, { status: 500 })
  }

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

Job Description:
${job_description}

Return only valid JSON. No markdown, no explanation.`
    : `You are an expert resume analyst with deep knowledge of aerospace, aviation, IT, software development, trucking/logistics, drone/UAV, and business sectors.

Analyze this resume and return a JSON object with this exact structure:

{
  "name": "candidate name or empty string",
  "skills": ["extracted skill 1", "extracted skill 2", ...],
  "experience_years": <total years of experience as integer>,
  "industries": ["industry 1", "industry 2"],
  "education": ["degree and institution", ...],
  "ats_score": <0-100 integer based on ATS-friendliness>,
  "ats_issues": ["specific ATS issue", ...],
  "strengths": ["key strength 1", ...],
  "weaknesses": ["specific gap or weakness", ...],
  "suggestions": ["specific actionable improvement with example text", ...],
  "summary": "3-sentence professional summary of the candidate"
}

Return only valid JSON. No markdown, no explanation.`

  try {
    const apiKey = await getApiKey()
    const client = new Anthropic({ apiKey })
    const message = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } },
          { type: 'text', text: analysisPrompt },
        ],
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const analysis = JSON.parse(text)

    // Cache general analysis (no job description) to the resume record
    if (resume_id && !job_description) {
      await supabase.from('resumes').update({ analysis_json: analysis }).eq('id', resume_id)
    }

    return Response.json({ analysis })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Resume analysis failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
