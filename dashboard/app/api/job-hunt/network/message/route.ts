/**
 * POST /api/job-hunt/network/message — AI-drafted LinkedIn re-engagement
 * message for a network contact. Ported from the operator's own YVON-OS
 * app/api/network/message/route.ts (2026-08-15).
 *
 * The original hardcoded the operator's background directly in the prompt,
 * including "Building Novizio (sustainable fashion e-commerce) and Hourbour
 * (fintech SaaS)". Novizio is confirmed elsewhere in this project (it's the
 * dashboard's own primary venture); Hourbour has NOT been confirmed by the
 * operator in this session, so rather than re-hardcode either, this route
 * builds its background block dynamically from job_hunt_profile — the
 * confirmed education/experience/target-industry facts, nothing invented.
 * If the operator wants Novizio/Hourbour founder context in every drafted
 * message, add it to the Master Profile's narrative fields and it'll flow
 * through here automatically.
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

interface ContactInfo {
  name: string
  title?: string | null
  company?: string | null
  industry_tag?: string | null
  how_met?: string | null
  relationship_type?: string | null
  last_contacted?: string | null
  notes?: string | null
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
    const exitStory = (data.narrative as { exit_story?: string } | null)?.exit_story
    if (exitStory) lines.push(`- ${exitStory}`)

    return lines.join('\n')
  } catch {
    return ''
  }
}

export async function POST(req: NextRequest) {
  let body: { contact: ContactInfo; context?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { contact, context } = body
  if (!contact?.name) return Response.json({ error: 'contact.name is required' }, { status: 400 })

  const daysSince = contact.last_contacted
    ? Math.floor((Date.now() - new Date(contact.last_contacted).getTime()) / 86_400_000)
    : null

  const background = await buildBackgroundBlock()

  const prompt = `You are writing a LinkedIn re-engagement message on behalf of someone with this background:
${background || '(no profile on file yet — write generically, do not invent specifics)'}

They want to reach out to:
Name: ${contact.name}
Title: ${contact.title ?? 'Unknown'}
Company: ${contact.company ?? 'Unknown'}
Industry: ${contact.industry_tag ?? 'Unknown'}
How we met: ${contact.how_met ?? 'LinkedIn'}
Relationship: ${contact.relationship_type ?? 'professional contact'}
${daysSince !== null ? `Last contacted: ${daysSince} days ago` : 'Never formally reached out'}
${contact.notes ? `Notes about this person: ${contact.notes}` : ''}
${context ? `Specific reason to reach out: ${context}` : ''}

Write a short, genuine LinkedIn message (3-5 sentences max). Rules:
- Sound like a real person, not a recruiter template
- Reference something specific about them or their work if possible
- No "I hope this message finds you well" — skip corporate filler
- End with a low-pressure question or reason to reply
- Keep it under 120 words
- First-person, conversational, warm but not over-familiar

Return only the message text. No explanation, no quotes around it.`

  try {
    const message = await callSynthesis({ messages: [{ role: 'user', content: prompt }], maxTokens: 300 })
    return Response.json({ message })
  } catch (err) {
    const m = err instanceof Error ? err.message : 'Message generation failed'
    return Response.json({ error: m }, { status: 500 })
  }
}
