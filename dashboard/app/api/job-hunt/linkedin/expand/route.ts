/**
 * POST /api/job-hunt/linkedin/expand — turns a rough post idea into a
 * drafted LinkedIn post, using the operator's Master Profile for voice/
 * background context (same buildBackgroundBlock pattern as the network
 * message-drafter route). New code — YVON-OS's content-lab schema
 * (025_content_lab.sql) was pulled verbatim, but no matching "expand idea"
 * API route existed there to port, so this is written fresh against the
 * same table shape.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { callSynthesis } from '@/lib/ai-client'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

async function buildBackgroundBlock(): Promise<string> {
  try {
    const sb = getServiceClient()
    const { data } = await sb
      .from('job_hunt_profile')
      .select('education, experience, target_roles, narrative, location')
      .eq('id', 'operator')
      .maybeSingle()
    if (!data) return ''

    const lines: string[] = []
    const education = (data.education ?? []) as { degree?: string }[]
    for (const e of education) if (e.degree) lines.push(`- ${e.degree}`)
    const experience = (data.experience ?? []) as { title?: string; bullets?: string }[]
    for (const e of experience) if (e.title) lines.push(`- ${e.title}${e.bullets ? `: ${e.bullets}` : ''}`)
    const archetypes = ((data.target_roles as { archetypes?: { name?: string; fit?: string }[] } | null)?.archetypes ?? [])
      .filter((a) => a.fit === 'primary').map((a) => a.name).filter(Boolean)
    if (archetypes.length) lines.push(`- Target industries: ${archetypes.join(', ')}`)
    const country = (data.location as { country?: string } | null)?.country
    if (country) lines.push(`- Based in ${country}`)

    return lines.join('\n')
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  let body: { rough_idea?: string; industry_tag?: string; tone?: string; format?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!body.rough_idea?.trim()) return Response.json({ error: 'rough_idea is required' }, { status: 400 })

  const background = await buildBackgroundBlock()
  const tone = body.tone ?? 'story'
  const format = body.format ?? 'text'

  const prompt = `You are drafting a LinkedIn post on behalf of someone with this background:
${background || '(no profile on file yet — write generically, do not invent specifics)'}

Rough idea to expand into a full post:
"${body.rough_idea}"

${body.industry_tag ? `Relevant industry: ${body.industry_tag}` : ''}
Tone: ${tone}
Format: ${format}

Rules:
- Sound like a real person posting on LinkedIn, not corporate marketing copy
- No generic hooks like "I'm excited to announce" unless the idea genuinely calls for it
- Short paragraphs, line breaks for readability (LinkedIn native formatting)
- 100-250 words
- End with something that invites engagement (a question, an opinion others might react to) — but only if it fits naturally, don't force it
- Do not use hashtags unless the idea specifically calls for a couple

Return only the post text. No explanation, no quotes around it.`

  try {
    const draft = await callSynthesis({ messages: [{ role: 'user', content: prompt }], maxTokens: 500 })
    return Response.json({ draft })
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Draft generation failed'
    return Response.json({ error: m }, { status: 500 })
  }
}
