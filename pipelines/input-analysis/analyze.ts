// Input Analysis pipeline — the analyzer (combines stages 1–4).
// Entry: analyzeMessage(). Hybrid: deterministic for structure, LLM for depth.
import type { InputAnalysis } from './types'
import { classifyTier, detectRelation } from './classify'
import { parseInfo } from './extract'
import { routeAgents } from './routing'
import { deriveMustHaves } from './must-haves'

/** Info tier — dynamic fields, deterministic (no LLM). */
export function analyzeInfo(message: string): InputAnalysis {
  const p = parseInfo(message)
  return {
    tier: 'info',
    relation: detectRelation(message),
    what: message.trim(),
    type: p.type,
    subject: p.subject,
    scope: p.scope,
    expected: p.expected,
    format: p.format,
    analyzed: false,
  }
}

/** Build tier — full dynamic extraction via LLM (why/how/end/desired + must-haves). */
export async function analyzeBuild(message: string): Promise<InputAnalysis> {
  const { callFast } = await import('@/lib/ai-client')
  const prompt = [
    'Analyze this action message for the YVON pipeline. Return STRICT JSON only:',
    '{"what":"","why":"","how":"","endResult":"","desiredOutput":""}',
    'Rules:',
    '- what: the core task/change in one sentence',
    '- why: the purpose/motivation',
    '- how: the approach to do it',
    '- endResult: what success looks like — DERIVED from the message',
    '- desiredOutput: the deliverable — DERIVED',
    '- Missing → "not specified". Never invent.',
    '',
    `Message: ${message}`,
  ].join('\n')
  try {
    const result = await callFast({
      system: 'You extract structured intent. Reply with strict JSON only.',
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 300,
    })
    const cleaned = (typeof result === 'string' ? result : JSON.stringify(result)).replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned) as Partial<InputAnalysis>
    return {
      tier: 'build',
      relation: parsed.relation === 'general' ? 'general' : detectRelation(message),
      what: parsed.what ?? 'not specified',
      why: parsed.why ?? 'not specified',
      how: parsed.how ?? 'not specified',
      endResult: parsed.endResult ?? 'not specified',
      desiredOutput: parsed.desiredOutput ?? 'not specified',
      mustHaves: deriveMustHaves(message, parsed.desiredOutput),
      analyzed: true,
    }
  } catch {
    return {
      tier: 'build',
      relation: detectRelation(message),
      what: message.trim().slice(0, 140),
      why: 'not specified',
      how: 'not specified',
      endResult: 'the requested change/result',
      desiredOutput: 'the completed change',
      mustHaves: deriveMustHaves(message),
      analyzed: false,
    }
  }
}

/** Entry point: classify + analyze + route + must-haves. */
export async function analyzeMessage(message: string): Promise<InputAnalysis> {
  const tier = classifyTier(message)
  if (tier === 'generic') {
    return { tier: 'generic', relation: 'general', what: 'not specified', analyzed: false }
  }
  if (tier === 'info') {
    const a = analyzeInfo(message)
    a.targetAgents = routeAgents(message)
    return a
  }
  const a = await analyzeBuild(message)
  a.targetAgents = routeAgents(message)
  return a
}
