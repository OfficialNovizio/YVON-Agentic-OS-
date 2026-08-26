// GET /api/software-pipeline/caos — rebuild the CAOS v2 view for the most
// recent turns from the events table (phase.*, gate.*, loop.*, tool.call,
// run.*, venture.context, input.analysis). The same pure reducer the chat
// HUD uses (lib/caos-v2.ts buildCaosView) runs here server-side over the
// persisted events; usage comes from run.completed's payload when present —
// otherwise cost fields stay null ("absent is the truth", never faked to 0).

import { createClient } from '@supabase/supabase-js'
import { stageFromEventRow, type TurnEvent } from '@/lib/pipeline'
import { buildCaosView, type CaosView } from '@/lib/caos-v2'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

const KINDS = [
  'phase.classify', 'phase.resolve', 'phase.retrieve', 'tool.call',
  'gate.passed', 'gate.blocked', 'loop.iteration',
  'run.completed', 'run.failed', 'venture.context', 'skill.disclosure', 'input.analysis',
]

export interface CaosTurnSummary {
  id: string
  ts: number
  agent: string | null
  count: number
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '400') || 400, 1000)

  try {
    const { data } = await supabase
      .from('events')
      .select('id, actor, context_id, kind, ts, payload')
      .in('kind', KINDS)
      .order('ts', { ascending: false })
      .limit(limit)

    const rows = (data ?? []) as {
      id: string
      actor: string | null
      context_id: string | null
      kind: string
      ts: string
      payload: Record<string, unknown> | null
    }[]

    const events: TurnEvent[] = rows.map((r) => ({
      id: r.id,
      actor: r.actor ?? null,
      contextId: r.context_id ?? null,
      kind: r.kind,
      ts: r.ts,
      payload: r.payload ?? {},
    }) as TurnEvent)

    // Group into turns: by payload.correlation when present, else by
    // actor + 10-minute bucket (events within one turn share a correlation
    // once migration 106 emits it; the bucket is the honest fallback).
    const turns = new Map<string, TurnEvent[]>()
    for (const e of events) {
      const corr = (e.payload?.correlation as string | null) ?? null
      const key = corr ?? `${e.actor ?? '?'}|${Math.floor(new Date(e.ts).getTime() / 600000)}`
      const arr = turns.get(key) ?? []
      arr.push(e)
      turns.set(key, arr)
    }

    const turnList: CaosTurnSummary[] = [...turns.entries()]
      .map(([key, evs]) => {
        const sorted = evs.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime())
        const last = sorted[sorted.length - 1]
        return {
          id: key,
          ts: new Date(last.ts).getTime(),
          agent: last.actor ?? sorted[0].actor ?? null,
          count: sorted.length,
        }
      })
      .sort((a, b) => b.ts - a.ts)

    // Build the view for the most recent turn.
    let view: CaosView | null = null
    if (turnList[0]) {
      const evs = turns.get(turnList[0].id)!
      const stages = evs
        .map((e) => stageFromEventRow(e))
        .filter((s): s is NonNullable<typeof s> => !!s)
      const usageRow = evs.find((e) => e.kind === 'run.completed' && e.payload?.usage)
      view = buildCaosView({
        stages,
        source: 'past',
        usage: (usageRow?.payload?.usage as Record<string, unknown> | null) ?? null,
        agent: turnList[0].agent,
      })
    }

    return Response.json({ turns: turnList.slice(0, 12), view })
  } catch (err) {
    return Response.json({ turns: [], view: null, error: String(err) }, { status: 500 })
  }
}
