import { NextRequest } from 'next/server'
import { callSynthesis } from '@/lib/ai-client'

export async function POST(req: NextRequest) {

  let body: { industry_a?: string; industry_b?: string }
  try { body = await req.json() } catch { body = {} }

  const { industry_a, industry_b } = body

  const combo = industry_a && industry_b
    ? `between ${industry_a} and ${industry_b}`
    : 'across your industries'

  const prompt = `You are helping someone with this unique background generate cross-industry LinkedIn post angles:

Background:
- Bachelor's in Aircraft Engineering
- 2 years software development at a trucking/dispatch company
- MBA
- Building Novizio (sustainable fashion e-commerce) and Hourbour (fintech SaaS)
- Industries: Aerospace, Aviation, IT, Trucking/Logistics, Drone/UAV, Business, Entrepreneurship

Generate 6 highly specific cross-industry post angles ${combo}.

These should be angles ONLY this person can write authentically — impossible to fake without their exact experience.

Return a JSON array of 6 objects:
[
  {
    "angle": "One-sentence post angle or hook",
    "industries": ["Industry A", "Industry B"],
    "why_unique": "Why only this person can write this authentically (one sentence)",
    "tone_suggestion": "story | insight | hot_take | data | behind_scenes | bridging",
    "example_hook": "The exact first line of this post"
  }
]

Make the angles specific and surprising — not generic "my engineering background helps in business" clichés.
Return only valid JSON array.`

  try {
    const text   = await callSynthesis({ messages: [{ role: 'user', content: prompt }], maxTokens: 1200 })
    const angles = JSON.parse(text)
    return Response.json({ angles })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Angle generation failed'
    return Response.json({ error: msg }, { status: 500 })
  }
}
