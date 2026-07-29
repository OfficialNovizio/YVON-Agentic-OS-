import { NextRequest } from 'next/server'
import { callSynthesis } from '@/lib/ai-client'

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

export async function POST(req: NextRequest) {
  let body: { contact: ContactInfo; context?: string }
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { contact, context } = body
  if (!contact?.name) return Response.json({ error: 'contact.name is required' }, { status: 400 })

  const daysSince = contact.last_contacted
    ? Math.floor((Date.now() - new Date(contact.last_contacted).getTime()) / 86_400_000)
    : null

  const prompt = `You are writing a LinkedIn re-engagement message on behalf of someone with this background:
- Aircraft Engineering degree
- 2 years software development at a trucking/dispatch company
- MBA
- Building Novizio (sustainable fashion e-commerce) and Hourbour (fintech SaaS)
- Based in Canada

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
