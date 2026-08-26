/**
 * seed-demo-flow.mjs — the "One Request, End to End" demo chat (2026-08-24).
 * ─────────────────────────────────────────────────────────────────────────
 * Seeds the demo side of the artifact's flow into Supabase so the dashboard
 * shows the real end-to-end chain:
 *
 *   1. A chat_rooms row (kind='department', department='demo-scroll-animation',
 *      title='Demo · One request, end to end') — visible to the owner via RLS
 *      (is_owner()), listed in History because the threads route reads every
 *      room the caller can see.
 *   2. chat_messages — the artifact's transcript (beat 1–8): the ask, CAOS
 *      routing, the session's ceiling/screening/plan/fork/probes, the PRD gate.
 *   3. events rows — kind='task.proposal.accepted', payload
 *      { room_id, taskId, title, summary, kanbanOk: false } per task
 *      TS-042…TS-047 (same shape migration 107 writes). This is what powers
 *      /api/task-spec's roomId scoping and the task-detail "Open in chat"
 *      navigation — the task chain itself lives in store/tasks/TS-04*.yaml
 *      (repo files, created separately).
 *
 * The task records are the SOURCE of truth; this script only makes the chat
 * side real. Idempotent: if the demo room already exists, it prints and exits
 * 0 without touching anything.
 *
 * Usage (from dashboard/):
 *   node scripts/seed-demo-flow.mjs
 *
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local (service
 * role, because events is service-role-insert-only by design — migration 052).
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Load env vars (same pattern as fetch-orgbook-leads.mjs) ───────────────
function loadEnv() {
  try {
    const envFile = readFileSync(join(__dirname, '../.env.local'), 'utf8')
    for (const line of envFile.split('\n')) {
      if (!line.trim() || line.startsWith('#')) continue
      const idx = line.indexOf('=')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // No .env.local — fine if env vars are already set some other way
  }
}

function supabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) {
    console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. Add to .env.local.')
    process.exit(1)
  }
  return createClient(url, key)
}

// ── The transcript (artifact beats 1–8, compressed to chat messages) ────────
// author_kind: 'user' | 'agent' · author_id: profiles.id for users, agent id
// for agents (no FK on the text). The chat UI renders content as text.
const MESSAGES = [
  {
    author_kind: 'user',
    author_id: 'operator',
    author_name: 'Novy',
    content:
      'I need a scroll animation for the landing page. Something that dives through, like the Apple product pages.',
    ts: '2026-08-19T11:00:00Z',
  },
  {
    author_kind: 'agent',
    author_id: 'caos',
    author_name: 'CAOS',
    content:
      'tier build · three departments above threshold\n· design.motion — 8 · "scroll", "dives"\n· brand — 5 · landing page\n· writing — 4 · section beats\nEscalating to a session (design.motion).',
    ts: '2026-08-19T11:01:00Z',
  },
  {
    author_kind: 'agent',
    author_id: 'session',
    author_name: 'design.motion',
    content:
      'Before anything else — what is the hard generation ceiling? Strict means I will refuse work rather than exceed it, and refuse providers I cannot price.',
    ts: '2026-08-19T11:01:30Z',
  },
  {
    author_kind: 'user',
    author_id: 'operator',
    author_name: 'Novy',
    content: '50 cents. Strict.',
    ts: '2026-08-19T11:02:00Z',
  },
  {
    author_kind: 'agent',
    author_id: 'session',
    author_name: 'design.motion',
    content:
      'Screening: krea/flux-image and higgsfield/* blocked — no published rate. kling-3.0 priced but unaffordable (3s = $0.53 > ceiling). Only seedance-2.0-fast is usable ($0.0677/s, verified).',
    ts: '2026-08-19T11:02:20Z',
  },
  {
    author_kind: 'agent',
    author_id: 'session',
    author_name: 'design.motion',
    content:
      'Manifest: atlas (brand) → indigo ground, one cyan accent. lena (writing) → six beats, copy fixed first. mia (design.motion) → 6 dives ×5s + 5 links ×3s = 45s of video.\nDoes not fit: 45s × $0.0677/s is 6.1× over the ceiling. The plan is stated, not quietly shrunk.',
    ts: '2026-08-19T11:03:00Z',
  },
  {
    author_kind: 'agent',
    author_id: 'session',
    author_name: 'design.motion · gate 1 of 3',
    content:
      'Spend · the model cannot decide this. $3.04 of video, or 40¢ of evidence?\n· Probe first · $0.40\n· Go programmatic for $0.00\n· Raise the ceiling',
    ts: '2026-08-19T11:03:30Z',
  },
  {
    author_kind: 'user',
    author_id: 'operator',
    author_name: 'Novy',
    content: "Probe first. If it doesn't hold, we go programmatic.",
    ts: '2026-08-19T11:04:00Z',
  },
  {
    author_kind: 'agent',
    author_id: 'mia',
    author_name: 'mia · design.motion',
    content:
      'Two probes on section 3, $0.20 each — the largest identical pair the ceiling allows. Both failed the same check: neither held frame-to-frame continuity at a seam (JSON held the palette tighter; still drifted 14°). A third probe would test the same failing property, so it is refused.',
    ts: '2026-08-19T11:05:00Z',
  },
  {
    author_kind: 'agent',
    author_id: 'spec',
    author_name: 'spec · prd generator',
    content:
      'Nothing has been created yet. This is the decision point. The PRD proposes a programmatic SVG trace — ~4 KB vector, no drift, no regeneration when copy changes. 4 acceptance criteria; the four assertions the suite will run. RICE 0 (unranked — rice.py did not run).\nConvert to task, or discard?',
    ts: '2026-08-19T11:06:00Z',
  },
  {
    author_kind: 'user',
    author_id: 'operator',
    author_name: 'Novy',
    content: 'Convert it.',
    ts: '2026-08-19T11:06:30Z',
  },
  {
    author_kind: 'agent',
    author_id: 'caos',
    author_name: 'CAOS',
    content:
      'TS-042 created (draft, ACTIVE) and mirrored to the Kanban board. The conversion chain ran: new → write prd.md → set-prd → fill-discovery → discover → approve → start. Its acceptance criteria ARE the four assertions the suite will run.',
    ts: '2026-08-19T11:07:00Z',
  },
]

// The proposal events — one per record in the chain. Same payload shape as
// migration 107's chat_emit_task_proposal_event for kind='task.proposal.accepted'.
const PROPOSALS = [
  { taskId: 'TS-042', title: 'Scroll animation · CAOS panel', summary: 'The CAOS panel dive animation, keyboard-reachable, inside the 312px rail.' },
  { taskId: 'TS-043', title: 'Rework the keyboard path', summary: 'Revision of TS-042 — Enter on .caos2-head must expand the row.' },
  { taskId: 'TS-044', title: 'Data contract: TaskSpecItem', summary: 'designSessionId on the interface; every field the panel reads declared.' },
  { taskId: 'TS-045', title: 'Backend: run records', summary: '/api/task-spec returns run records; failed runs never omitted.' },
  { taskId: 'TS-046', title: 'Wiring: end-to-end', summary: 'The panel shows live data from a cold chat room; no stubs remain.' },
  { taskId: 'TS-047', title: 'Cost per task · ledger link', summary: 'The deferral, made into a record rather than a memory.' },
]

const ROOM_DEPARTMENT = 'demo-scroll-animation'

async function main() {
  loadEnv()
  const db = supabase()

  // ── 1. Room (idempotent) ────────────────────────────────────────────────
  const { data: existing } = await db
    .from('chat_rooms')
    .select('id')
    .eq('department', ROOM_DEPARTMENT)
    .maybeSingle()
  if (existing) {
    console.log(`✓ demo room already exists (${existing.id}) — nothing to do.`)
    return
  }

  // `title` is not in any migration (threads/route.ts reads it, but it was
  // added dashboard-side) — try with, fall back to without so the script
  // works on a fresh database too.
  let roomId = null
  const { data: room, error: roomErr } = await db
    .from('chat_rooms')
    .insert({ kind: 'department', department: ROOM_DEPARTMENT, title: 'Demo · One request, end to end' })
    .select('id')
    .single()
  if (roomErr) {
    if (!String(roomErr.message).toLowerCase().includes('title')) {
      console.error('❌ could not create demo room:', roomErr.message)
      process.exit(1)
    }
    const { data: room2, error: roomErr2 } = await db
      .from('chat_rooms')
      .insert({ kind: 'department', department: ROOM_DEPARTMENT })
      .select('id')
      .single()
    if (roomErr2 || !room2) {
      console.error('❌ could not create demo room (no-title fallback):', roomErr2?.message ?? 'no row')
      process.exit(1)
    }
    roomId = room2.id
    console.log(`✓ demo room created (${roomId}, no title column available)`)
  } else {
    roomId = room.id
    console.log(`✓ demo room created (${roomId})`)
  }

  // ── 2. Messages ─────────────────────────────────────────────────────────
  const { error: msgErr } = await db.from('chat_messages').insert(
    MESSAGES.map((m) => ({ ...m, room_id: roomId })),
  )
  if (msgErr) {
    console.error('❌ could not insert messages:', msgErr.message)
    process.exit(1)
  }
  console.log(`✓ ${MESSAGES.length} messages inserted`)

  // ── 3. Proposal events (append-only log, service role) ──────────────────
  const correlation = randomUUID()
  const { error: evErr } = await db.from('events').insert(
    PROPOSALS.map((p, i) => ({
      source: 'yvon',
      context_id: 'yvon-os',
      kind: 'task.proposal.accepted',
      actor: 'caos',
      correlation,
      payload: {
        room_id: roomId,
        taskId: p.taskId,
        title: p.title,
        summary: p.summary,
        kanbanOk: false,
      },
      ts: `2026-08-19T11:0${7 + Math.min(i, 2)}:00Z`,
    })),
  )
  if (evErr) {
    console.error('❌ could not insert proposal events:', evErr.message)
    process.exit(1)
  }
  console.log(`✓ ${PROPOSALS.length} task.proposal.accepted events inserted (correlation ${correlation})`)

  console.log('\nDemo seeded. Open the dashboard → History → "Demo · One request, end to end",')
  console.log('or open the Tasks panel — TS-042…TS-047 are live records in store/tasks/.')
  console.log('The Task Lineage page (/tasks) shows the whole chain grouped by request.')
}

main().catch((e) => {
  console.error('❌', e instanceof Error ? e.message : e)
  process.exit(1)
})
