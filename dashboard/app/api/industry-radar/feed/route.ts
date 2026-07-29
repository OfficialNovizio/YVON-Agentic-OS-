import { NextRequest } from 'next/server'
import { callSynthesis } from '@/lib/ai-client'

const INDUSTRY_MAP: Record<string, string> = {
  all:       'Aerospace, Aviation, IT / Software, Trucking & Logistics, Drone / UAV, Business & Entrepreneurship',
  aerospace: 'Aerospace and Aviation',
  it:        'IT and Software',
  trucking:  'Trucking and Logistics',
  drone:     'Drone and UAV',
}

export async function POST(req: NextRequest) {

  let body: { industry?: string }
  try { body = await req.json() } catch { body = {} }

  const industry     = body.industry ?? 'all'
  const industryText = INDUSTRY_MAP[industry] ?? INDUSTRY_MAP.all
  const count        = industry === 'all' ? 10 : 7
  const today        = new Date().toISOString().slice(0, 10)

  const prompt = `Today is ${today}.

You are an industry intelligence analyst briefing someone with this background:
- Aircraft Engineering degree
- 2 years software development at a trucking/dispatch company
- MBA
- Building Novizio (sustainable fashion e-commerce) and Hourbour (fintech SaaS)
- Based in Canada

Generate ${count} specific, current intelligence items for: ${industryText}

Each item should be a real, specific development — not generic. Think about:
- Regulatory changes (Transport Canada, FAA, OSFI, CRTC)
- Mergers, acquisitions, bankruptcies, funding rounds
- AI and automation disruption in the sector
- Labour and supply chain pressures
- Emerging competitors or market shifts
- Technology breakthroughs or setbacks
- Economic conditions affecting the industry
- Canadian-specific dynamics

For each item, explain why it's relevant to THIS specific person (their background, ventures, and career aspirations).

Return JSON array only — no markdown wrapper:
[
  {
    "headline": "Specific, concrete headline (not generic)",
    "industry": "Aerospace | IT | Trucking | Drone | Business",
    "summary": "2-3 sentence factual summary of what's happening and why it matters",
    "why_relevant": "1 sentence — why this matters specifically to someone with aircraft engineering + SW dev + MBA + fintech/fashion ventures",
    "impact": "opportunity | threat | watch | neutral",
    "source_type": "regulatory | market | tech | funding | talent",
    "suggested_angle": "story | insight | hot_take | data | behind_scenes | question | bridging",
    "post_hook": "The exact scroll-stopping first line of a LinkedIn post about this"
  }
]`

  try {
    const text    = await callSynthesis({ messages: [{ role: 'user', content: prompt }], maxTokens: 3000 })
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const items   = JSON.parse(cleaned)
    return Response.json({ items, refreshed_at: new Date().toISOString() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Feed generation failed'
    return Response.json({ error: message }, { status: 500 })
  }
}
