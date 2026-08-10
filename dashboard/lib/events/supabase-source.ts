// Supabase Realtime implementation of the EventSource seam.
//
// The browser opens the WebSocket to Supabase itself — Vercel is not involved
// (§10.1: Vercel is web-surface only; it cannot hold a live connection).
// Push, never poll (§5.3); Supabase Realtime is already in the stack (§6.4).
'use client'

import { supabaseBrowser } from '@/lib/supabase-browser'
import type { EventSource, RunEvent } from './index'

type Row = {
  actor: string | null
  context_id: string
  source: string
  kind: string
  ts: string
  payload: Record<string, unknown> | null
}

/** Minimal structural view of the realtime surface we use (avoids client union types). */
interface RealtimeCapable {
  channel(name: string): {
    on(event: string, filter: Record<string, unknown>, cb: (msg: { new: Row }) => void): {
      subscribe(): { unsubscribe(): void }
    }
  }
}

/**
 * Subscribe to inserts on the append-only `events` table.
 * @param contextId optional scope filter — 'yvon-os' | … (§12.1)
 */
export function supabaseSource(contextId?: string): EventSource {
  return {
    subscribe(cb: (e: RunEvent) => void) {
      let channel: { unsubscribe(): void } | null = null
      try {
        const sb = supabaseBrowser() as unknown as RealtimeCapable
        channel = sb
          .channel('events-live')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'events',
              ...(contextId ? { filter: `context_id=eq.${contextId}` } : {}),
            },
            (msg: { new: Row }) => {
              const r = msg.new
              if (!r?.actor) return
              cb({
                actor: r.actor,
                contextId: r.context_id,
                source: r.source,
                kind: r.kind,
                ts: r.ts ? Date.parse(r.ts) : Date.now(),
                payload: r.payload ?? undefined,
              })
            },
          )
          .subscribe()
      } catch {
        // No Supabase env configured (local dev) — stay silent rather than crash;
        // the graph simply shows no activity.
        return () => {}
      }
      return () => { try { channel?.unsubscribe() } catch { /* noop */ } }
    },
  }
}
