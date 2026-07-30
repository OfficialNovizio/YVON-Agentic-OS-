// GET  /api/chat/rooms  — rooms visible to the caller.
// POST /api/chat/rooms  — provision an agent room for (caller, agentId) if absent.
//
// Rooms:
//   workforce (kind='whole_team')  — everyone
//   department                     — visible to owner + assigned bod_member
//   agent                          — caller's 1:1 room with a specific agent
//   assigned_scope                 — caller's "all my assigned depts" room
//
// Owner: raj · TS-015 WI-2
import { supabaseServer } from '@/lib/supabase-server'

export type RoomKind = 'whole_team' | 'department' | 'agent' | 'assigned_scope'

export interface ChatRoom {
  id: string
  kind: RoomKind
  department: string | null
  agentId: string | null
  ownerUserId: string | null
  label: string
  section: 'context' | 'departments' | 'recent'  // hint to the left rail
}

interface Row {
  id: string
  kind: string
  department: string | null
  agent_id: string | null
  owner_user_id: string | null
  created_at: string
}

function labelFor(row: Row): string {
  if (row.kind === 'whole_team') return 'Workforce'
  if (row.kind === 'assigned_scope') return 'All assigned'
  if (row.kind === 'agent') return `@${row.agent_id ?? 'agent'}`
  return row.department ?? '(unknown)'
}

function sectionFor(row: Row): ChatRoom['section'] {
  if (row.kind === 'whole_team' || row.kind === 'assigned_scope') return 'context'
  if (row.kind === 'department') return 'departments'
  return 'recent'
}

// ─── GET — list rooms visible to caller (RLS filtered) ────────────────────
export async function GET(): Promise<Response> {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  // Ensure the caller has an assigned_scope room (auto-provisioned on first read).
  await supabase
    .from('chat_rooms')
    .upsert(
      { kind: 'assigned_scope', owner_user_id: user.id },
      { onConflict: 'owner_user_id' /* partial-unique on kind=assigned_scope */ }
    )
    // Ignore conflict errors; the partial-unique index handles dupes silently.
    .throwOnError()
    .then(undefined, () => undefined)

  const { data, error } = await supabase
    .from('chat_rooms')
    .select('id, kind, department, agent_id, owner_user_id, created_at')
    .order('kind', { ascending: true })
    .order('department', { ascending: true })

  if (error) {
    return Response.json({ error: String((error as { message?: string })?.message ?? error) }, { status: 500 })
  }

  const rows = ((data as unknown as Row[] | null) ?? []).map<ChatRoom>((r) => ({
    id: r.id,
    kind: r.kind as RoomKind,
    department: r.department,
    agentId: r.agent_id,
    ownerUserId: r.owner_user_id,
    label: labelFor(r),
    section: sectionFor(r),
  }))

  return Response.json({ rooms: rows })
}

// ─── POST — provision an agent room for (caller, agentId) ─────────────────
// Body: { agentId: string }
export async function POST(request: Request): Promise<Response> {
  let body: { agentId?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid JSON' }, { status: 400 })
  }
  const agentId = (body.agentId ?? '').trim().toLowerCase()
  if (!agentId || !/^[a-z][a-z0-9-]*$/.test(agentId)) {
    return Response.json({ error: 'agentId required (kebab-case)' }, { status: 400 })
  }

  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  // Upsert the agent room. Unique index on (owner_user_id, agent_id) where kind='agent'.
  const { data, error } = await supabase
    .from('chat_rooms')
    .upsert(
      { kind: 'agent', agent_id: agentId, owner_user_id: user.id },
      { onConflict: 'owner_user_id,agent_id' }
    )
    .select('id, kind, department, agent_id, owner_user_id, created_at')
    .single()

  if (error) {
    return Response.json({ error: String((error as { message?: string })?.message ?? error) }, { status: 500 })
  }

  const row = data as unknown as Row
  const room: ChatRoom = {
    id: row.id,
    kind: row.kind as RoomKind,
    department: row.department,
    agentId: row.agent_id,
    ownerUserId: row.owner_user_id,
    label: labelFor(row),
    section: sectionFor(row),
  }
  return Response.json({ room })
}
