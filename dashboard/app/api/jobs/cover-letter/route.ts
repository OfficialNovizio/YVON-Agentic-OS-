import { NextRequest } from 'next/server'
import { callSynthesis } from '@/lib/ai-client'

interface CoverLetterRequest {
  job_title: string
  company: string
  job_description: string
  resume_summary?: string
  tone?: 'professional' | 'confident' | 'concise'
}

export async function POST(req: NextRequest) {
  let body: CoverLetterRequest
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { job_title, company, job_description, resume_summary, tone = 'professional' } = body
  if (!job_title || !company || !job_description) {
    return Response.json({ error: 'job_title, company, and job_description are required' }, { status: 400 })
  }

  const toneGuide: Record<string, string> = {
    professional: 'formal, precise, and results-focused',
    confident:    'assertive and direct — state value clearly without hedging',
    concise:      'tight and punchy — no filler sentences, every line earns its place',
  }

  const prompt = `Write a strong LinkedIn job application cover letter for the following role.

Role: ${job_title}
Company: ${company}
Job Description:
${job_description}

${resume_summary ? `Applicant Background:\n${resume_summary}` : `Applicant Background:
- Bachelor's degree in Aircraft Engineering
- 2 years software development experience at a trucking/dispatch company
- MBA degree
- Target industries: Aerospace, Aviation, IT, Trucking/Logistics, Drone/UAV, Business`}

Tone: ${toneGuide[tone]}

Instructions:
- 3 paragraphs maximum. No filler. No "I am writing to express my interest."
- Paragraph 1: specific hook — reference the company's work or role's challenge
- Paragraph 2: your most relevant experience mapped to what they need
- Paragraph 3: confident close — what you bring and a clear call to action
- Do not start with "Dear Hiring Manager" — write body only (no salutation, no sign-off)
- Under 250 words

Return only the cover letter body. No explanations, no quotes around it.`

  try {
    const text = await callSynthesis({ messages: [{ role: 'user', content: prompt }], maxTokens: 600 })
    return Response.json({ cover_letter: text.trim() })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Cover letter generation failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
