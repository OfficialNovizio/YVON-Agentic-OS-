import { NextRequest } from 'next/server'
import { callSynthesis } from '@/lib/ai-client'

export async function POST(_req: NextRequest) {

  const today = new Date().toISOString().slice(0, 10)

  const prompt = `Today is ${today}.

You are helping someone with this background find sizzling, timely LinkedIn post topics:

Background:
- Aircraft Engineering degree
- 2 years software development at a trucking/dispatch company
- MBA
- Building Novizio (sustainable fashion e-commerce) and Hourbour (fintech SaaS)
- Industries: Aerospace, Aviation, IT, Trucking/Logistics, Drone/UAV, Business, Entrepreneurship
- Based in Canada

Think about what is genuinely HOT right now in these industries. Consider:
- Industry disruptions and layoffs in tech / aviation / logistics
- AI adoption in trucking, aerospace maintenance, fintech compliance
- Drone regulation changes in Canada/US (Transport Canada, FAA)
- Sustainable aviation fuel (SAF) mandates and economics
- Supply chain and freight market conditions
- Canadian startup ecosystem and venture funding climate
- Fintech regulatory pressure (OSFI, open banking)
- Fashion sustainability mandates and fast-fashion backlash

Generate 8 sizzling, specific, timely topics this person can authentically post about.
Each topic must be something currently being debated or discussed in that industry — not generic.

Return a JSON array only, no markdown:
[
  {
    "topic": "Specific, sharp angle — not a generic subject",
    "industry": "Aerospace | IT | Trucking | Drone | Business | Entrepreneurship",
    "why_hot": "Why people in this industry are talking about this right now (1 sentence, specific)",
    "suggested_tone": "story | insight | hot_take | data | behind_scenes | question | bridging",
    "hook": "The exact scroll-stopping first line of a post on this topic"
  }
]`

  try {
    const raw     = await callSynthesis({ messages: [{ role: 'user', content: prompt }], maxTokens: 2000 })
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const topics  = JSON.parse(cleaned)
    return Response.json({ topics })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Trending fetch failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
