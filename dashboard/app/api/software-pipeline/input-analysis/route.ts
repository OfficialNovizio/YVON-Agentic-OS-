// GET /api/software-pipeline/input-analysis — recent input analyses from the
// events table (kind='input.analysis', persisted by the chat stream route via
// migration 106). Returns normalized analyses for the Input Analysis tree:
// tier/relation, the per-tier dynamic fields, must-haves, and routing
// (primary agent + team + per-agent scores).

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export interface InputAnalysisRow {
  id: string
  ts: number
  message: string | null
  correlation: string | null
  tier: 'generic' | 'info' | 'build'
  relation: 'venture' | 'general'
  fields: [string, string][]
  mustHaves: string[]
  targetAgents: { primary: string; team: string[]; reason: string; scores?: { agent: string; score: number; hits: string[] }[] } | null
}

const FIELD_ORDER_INFO: [string, string][] = [
  ['type', 'Type'],
  ['subject', 'Subject'],
  ['scope', 'Scope'],
  ['expected', 'Expected'],
  ['format', 'Format'],
]
const FIELD_ORDER_BUILD: [string, string][] = [
  ['what', 'What'],
  ['why', 'Why'],
  ['how', 'How'],
  ['end result', 'End result'],
  ['desired output', 'Desired output'],
]

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const limit = Math.min(Math.max(1, Number(url.searchParams.get('limit') ?? '12') || 12), 50)

  try {
    const { data } = await supabase
      .from('events')
      .select('id, ts, payload')
      .eq('kind', 'input.analysis')
      .order('ts', { ascending: false })
      .limit(limit)

    const rows: InputAnalysisRow[] = []
    for (const r of data ?? []) {
      const p = (r.payload ?? {}) as Record<string, unknown>
      const tier = (p.tier === 'build' || p.tier === 'generic' ? p.tier : 'info') as InputAnalysisRow['tier']
      const relation = (p.relation === 'general' ? 'general' : 'venture') as InputAnalysisRow['relation']
      const order = tier === 'info' ? FIELD_ORDER_INFO : FIELD_ORDER_BUILD
      const fields = order
        .map(([key, label]) => [label, String(p[key] ?? '')] as [string, string])
        .filter(([, v]) => v && v !== 'not specified' && v !== 'undefined')

      rows.push({
        id: String(r.id),
        ts: r.ts ? new Date(r.ts).getTime() : Date.now(),
        message: (p.message as string | null) ?? (p.text as string | null) ?? null,
        correlation: (p.correlation as string | null) ?? null,
        tier,
        relation,
        fields,
        mustHaves: Array.isArray(p.mustHaves) ? (p.mustHaves as string[]) : [],
        targetAgents: p.targetAgents
          ? (p.targetAgents as InputAnalysisRow['targetAgents'])
          : null,
      })
    }

    return Response.json({ analyses: rows })
  } catch (err) {
    return Response.json({ analyses: [], error: String(err) }, { status: 500 })
  }
}
