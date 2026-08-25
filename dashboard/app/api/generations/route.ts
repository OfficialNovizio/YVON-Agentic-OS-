/**
 * GET /api/generations — the generation ledger, session-scoped or global.
 * Owner: quinn · engineering
 *
 * IDENTITY
 * --------
 * Every row is keyed by `request_id`, the value the provider returns on submit.
 * It is never client-generated. This is the one non-negotiable in this file:
 * a global library you cannot search and a session view you cannot join are
 * both the same bug, and both come from a random id.
 *
 * PRICING
 * -------
 * `cost_usd` is nullable and stays null when the provider gave us no number.
 * It is NEVER coerced to 0 — a $0 on a batch that cost real money is the most
 * dangerous value this route could return. Totals are reported as
 * { committedUsd, unpricedRows } so a caller cannot mistake one for the other.
 *
 * FAILURE
 * -------
 * A database error is a 502 with rows: []. It is not an empty library. The one
 * thing this route must not do is make "nothing here" and "we could not look"
 * render identically.
 *
 * NOT BUILT YET (marked, not faked):
 *   · balanceUsd — needs GET /account/balance wired through getSecret
 *   · regenerations — needs the regen_of column populated by the writer
 */

import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { errMsg } from '@/lib/errors'

export const maxDuration = 30

const KINDS = ['image', 'video', 'upload'] as const
const STATUSES = ['running', 'done', 'failed', 'discarded'] as const

type Kind = (typeof KINDS)[number]
type Status = (typeof STATUSES)[number]

interface Row {
  request_id: string
  kind: Kind
  status: Status
  model: string
  session_id: string | null
  prompt_shape: 'json' | 'prose' | null
  width: number | null
  height: number | null
  aspect: string | null
  quality: string | null
  seconds: number | null
  cost_usd: number | null
  pricing_source: string | null
  asset_url: string | null
  derived_from: string | null
  regen_of: string | null
  poll_attempt: number | null
  poll_ceiling: number | null
  created_at: string
}

const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const sessionId = url.searchParams.get('session')

  // Auth gate. The ledger carries spend, so it is never anonymous.
  const jar = await cookies()
  const token = jar.get('sb-access-token')?.value ?? jar.get('supabase-auth-token')?.value
  if (!token) {
    return Response.json({ error: 'not authenticated' }, { status: 401 })
  }

  try {
    let q = supabase
      .from('generations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)

    if (sessionId) q = q.eq('session_id', sessionId)

    const { data, error } = await q
    if (error) throw new Error(error.message)

    const rows = (data ?? []) as Row[]

    // Totals. Priced and unpriced are reported separately, on purpose.
    const priced = rows.filter((r) => num(r.cost_usd) !== null)
    const committedUsd = priced.length
      ? Math.round(priced.reduce((t, r) => t + (r.cost_usd as number), 0) * 1000) / 1000
      : null
    const unpricedRows = rows.length - priced.length
    const regenerations = rows.filter((r) => r.regen_of !== null).length

    // Session header, if this tab was opened from one.
    let session = null
    if (sessionId) {
      const { data: s } = await supabase
        .from('design_sessions')
        .select('id, kind, gate, ceiling_usd, spec')
        .eq('id', sessionId)
        .maybeSingle()
      if (s) {
        session = {
          id: s.id as string,
          kind: (s.kind as string) ?? 'session',
          gate: (s.gate as string) ?? 'open',
          ceilingUsd: num(s.ceiling_usd),
          spec: (s.spec as string) ?? null,
        }
      }
      // A session id that resolves to nothing stays null rather than being
      // invented — the UI renders "no session" and that is the truth.
    }

    // Counts are computed over the unfiltered set so the scope toggle can show
    // both numbers without a second round trip.
    const { count: totalCount } = await supabase
      .from('generations')
      .select('request_id', { count: 'exact', head: true })

    return Response.json({
      rows: rows.map((r) => ({
        requestId: r.request_id,
        kind: r.kind,
        status: r.status,
        model: r.model,
        sessionId: r.session_id,
        promptShape: r.prompt_shape,
        width: num(r.width),
        height: num(r.height),
        aspect: r.aspect,
        quality: r.quality,
        seconds: num(r.seconds),
        costUsd: num(r.cost_usd),
        pricingSource: r.pricing_source,
        assetUrl: r.asset_url,
        derivedFrom: r.derived_from,
        pollAttempt: num(r.poll_attempt),
        pollCeiling: num(r.poll_ceiling),
        createdAt: r.created_at,
      })),
      sessionCount: sessionId ? rows.length : 0,
      totalCount: totalCount ?? rows.length,
      committedUsd,
      unpricedRows,
      regenerations,
      balanceUsd: null,   // not wired — see header. Never guessed.
      session,
    })
  } catch (err) {
    // Loud, not silent. rows:[] with a 502 so the UI shows the error state.
    return Response.json(
      { error: errMsg(err), rows: [], sessionCount: 0, totalCount: 0,
        committedUsd: null, unpricedRows: 0, regenerations: 0, balanceUsd: null, session: null },
      { status: 502 },
    )
  }
}
