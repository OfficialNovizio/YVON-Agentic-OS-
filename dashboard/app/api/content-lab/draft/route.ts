import { NextRequest } from 'next/server'
import { callSynthesis } from '@/lib/ai-client'

const TONE_DESCRIPTIONS: Record<string, string> = {
  story:         'Personal story format — "Here\'s what happened to me…" Hook → conflict → lesson → takeaway',
  insight:       'Educational insight — "3 things I learned about X…" Clear numbered points, practical value',
  hot_take:      'Bold opinion — "Unpopular opinion: X is broken" Confident, slightly controversial, invites debate',
  data:          'Data-driven — Lead with a surprising number or fact, then explain why it matters',
  behind_scenes: 'Behind-the-scenes founder — Raw, authentic, specific details about building. No corporate speak',
  question:      'Thought-provoking question — Short setup, strong question at the end that invites replies',
  bridging:      'Cross-industry bridge — Connect two of your industries in a way only you can write',
}

const VENTURE_CONTEXT: Record<string, string> = {
  novizio:  'Novizio is a sustainable fashion e-commerce brand. Founder voice: authentic, building in public, honest about the entrepreneurship journey in fashion.',
  hourbour: 'Hourbour is a fintech SaaS product. Founder voice: technical but accessible, honest about building in a regulated industry, shares real product decisions.',
}

const INDUSTRY_REACH: Record<string, string> = {
  story:         'Gets most comments and emotional responses. Best for Aerospace and Entrepreneurship topics.',
  insight:       'Gets saves and shares. Best for IT, MBA, and Business topics.',
  hot_take:      'Gets highest reach through controversy. Works across all industries but use sparingly.',
  data:          'Gets shared by professionals. Best for Trucking stats, aviation facts, and fintech numbers.',
  behind_scenes: 'Gets authentic engagement. Best for Novizio and Hourbour founder content.',
  question:      'Gets most replies. Use when you want community feedback.',
  bridging:      'Gets shares from multiple networks simultaneously. Your most unique format.',
}

interface DraftRequest {
  topic:        string
  industry_tag: string
  venture_slug?: string
  tone?:        string
  generate_all?: boolean
}

export async function POST(req: NextRequest) {
  let body: DraftRequest
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { topic, industry_tag, venture_slug, tone, generate_all = false } = body
  if (!topic || !industry_tag) {
    return Response.json({ error: 'topic and industry_tag are required' }, { status: 400 })
  }

  const background = `
Background of the person posting:
- Bachelor's degree in Aircraft Engineering
- 2 years of software development experience at a trucking/dispatch company
- MBA degree
- Building two ventures: Novizio (sustainable fashion e-commerce) and Hourbour (fintech SaaS)
- Target industries: Aerospace, Aviation, IT, Trucking/Logistics, Drone/UAV, Business
- Posts 3x per week on LinkedIn
- Based in Canada`

  const ventureCtx = venture_slug ? `\nVenture context: ${VENTURE_CONTEXT[venture_slug] ?? ''}` : ''

  if (generate_all) {
    // Generate tone recommendations + one draft per top 3 tones
    const recommendPrompt = `${background}${ventureCtx}

Topic to post about: "${topic}"
Industry: ${industry_tag}

First, recommend the top 3 tones for this topic from this list and explain why each would perform well for this specific person and topic:
- story, insight, hot_take, data, behind_scenes, question, bridging

Then generate a LinkedIn post draft for each of the 3 recommended tones.

Return a JSON array with exactly 3 objects:
[
  {
    "tone": "tone_id",
    "tone_label": "Human readable tone name",
    "why": "One sentence why this tone works for this topic and their background",
    "reach_tip": "One sentence on what kind of engagement to expect",
    "draft": "Full LinkedIn post draft (150-300 words). First line is the scroll-stopping hook. End with a question or CTA."
  }
]

Rules for every draft:
- First line must stop the scroll — bold claim, surprising fact, or vulnerability
- Authentic personal voice, not corporate
- No hashtags
- 150-300 words
- End with a question that invites comments
- If venture post: founder voice, specific and real, not marketing speak

Return only valid JSON array. No markdown wrapping.`

    const text = await callSynthesis({ messages: [{ role: 'user', content: recommendPrompt }], maxTokens: 2000 })
    const recommendations = JSON.parse(text)
    return Response.json({ recommendations })
  }

  // Single tone draft
  if (!tone) return Response.json({ error: 'tone is required for single draft' }, { status: 400 })

  const prompt = `${background}${ventureCtx}

Write a LinkedIn post about: "${topic}"
Industry: ${industry_tag}
Tone: ${TONE_DESCRIPTIONS[tone] ?? tone}

Rules:
- First line must stop the scroll — bold claim, surprising fact, or vulnerability
- Authentic personal voice, not corporate
- No hashtags
- 150-300 words
- End with a question that invites comments
- If this is a venture post: use founder voice — specific, real, not marketing speak

Return only the post text. No explanation, no quotes around it.`

  const draft = await callSynthesis({ messages: [{ role: 'user', content: prompt }], maxTokens: 600 })
  return Response.json({ draft, tone, reach_tip: INDUSTRY_REACH[tone] })
}
