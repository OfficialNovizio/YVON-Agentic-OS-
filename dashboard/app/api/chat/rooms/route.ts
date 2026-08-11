// GET  /api/chat/rooms  — rooms visible to the caller, scoped to the active venture.
// POST /api/chat/rooms  — provision an agent room for (caller, agentId, venture) if absent.
//
// Rooms:
//   workforce (kind='whole_team')  — everyone
//   department                     — visible to owner + assigned bod_member
//   agent                          — caller's 1:1 room with a specific agent
//   assigned_scope                 — caller's "all my assigned depts" room
//
// Venture scoping (2026-08-11): every room kind is now per-venture via a
// nullable venture_slug column (migration 116). NULL = the original
// default/shared room — all pre-existing history lives there untouched, per
// discovery decision, not reassigned to any venture. Switching the venture
// selector reloads the page (VentureSelector.tsx), so this GET re-runs fresh
// against the new yvon_active_venture cookie automatically — no client-side
// venture filtering needed, the room list returned here IS the current
// venture's room list.
//
// Provisioning never uses .upsert(onConflict:) — chat_rooms_*_unique are
// PARTIAL indexes (one kind, split further into a NULL-venture and a
// non-NULL-venture pair by migration 116), and Postgres's ON CONFLICT can't
// target a partial index via a plain column list. Same find → insert → retry
// on race pattern the original agent-room provisioning already used.
//
// Owner: raj · TS-015 WI-2, extended TS-018/venture-rooms 2026-08-11
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase-server'
import { activeWorkspace } from '@/lib/workspaces'
import { FLEET_DEPARTMENTS } from '@/lib/fleet'

export type RoomKind = 'whole_team' | 'department' | 'agent' | 'assigned_scope'

export interface ChatRoom {
  id: string
  kind: RoomKind
  department: string | null
  agentId: string | null
  ownerUserId: string | null
  ventureSlug: string | null
  label: string
  section: 'context' | 'departments' | 'recent'  // hint to the left rail
}

interface Row {
  id: string
  kind: string
  department: string | null
  agent_id: string | null
  owner_user_id: string | null
  venture_slug: string | null
  created_at: string
}

const ROOM_SELECT = 'id, kind, department, agent_id, owner_user_id, venture_slug, created_at'

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

function toRoom(row: Row): ChatRoom {
  return {
    id: row.id,
    kind: row.kind as RoomKind,
    department: row.department,
    agentId: row.agent_id,
    ownerUserId: row.owner_user_id,
    ventureSlug: row.venture_slug,
    label: labelFor(row),
    section: sectionFor(row),
  }
}

/** Resolve the caller's real active venture slug (or null = default/shared
 * room), the same validated-against-DB way stream/route.ts does — never
 * trusts the cookie's raw value against an arbitrary/stale venture. */
async function resolveVentureSlug(supabase: Awaited<ReturnType<typeof supabaseServer>>): Promise<string | null> {
  const cookieStore = await cookies()
  let validSlugs: string[] = []
  try {
    const { data } = await supabase.from('ventures').select('slug')
    validSlugs = ((data as unknown as { slug: string }[] | null) ?? []).map((r) => r.slug)
  } catch {
    // fall through — activeWorkspace() defaults to 'yvon-os' with an empty list
  }
  const workspace = activeWorkspace(cookieStore.get('yvon_active_venture')?.value, validSlugs)
  return workspace === 'yvon-os' ? null : workspace
}

type SupaClient = Awaited<ReturnType<typeof supabaseServer>>

/** find → insert → retry-on-race, never .upsert(onConflict:) — see file header. */
async function findOrCreateRoom(
  supabase: SupaClient,
  match: Record<string, string | null>,
  insert: Record<string, string | null>,
): Promise<Row | null> {
  let query = supabase.from('chat_rooms').select(ROOM_SELECT)
  for (const [col, val] of Object.entries(match)) {
    query = val === null ? query.is(col, null) : query.eq(col, val)
  }
  const existing = await query.maybeSingle()
  if (existing.data) return existing.data as unknown as Row

  const { data: inserted, error: insErr } = await supabase
    .from('chat_rooms')
    .insert(insert)
    .select(ROOM_SELECT)
    .maybeSingle()
  if (!insErr && inserted) return inserted as unknown as Row

  // Unique violation race — someone else provisioned it first; re-select.
  let retryQuery = supabase.from('chat_rooms').select(ROOM_SELECT)
  for (const [col, val] of Object.entries(match)) {
    retryQuery = val === null ? retryQuery.is(col, null) : retryQuery.eq(col, val)
  }
  const retry = await retryQuery.maybeSingle()
  return (retry.data as unknown as Row | null) ?? null
}

// ─── GET — list rooms visible to caller, scoped to the active venture ─────
export async function GET(): Promise<Response> {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const ventureSlug = await resolveVentureSlug(supabase)

  // Auto-provision this venture's fixed rooms — whole_team, every department,
  // and this caller's assigned_scope. Department rooms were originally
  // seeded once as global singletons; venture-scoping means they now need
  // the same on-demand provisioning agent rooms always used.
  await findOrCreateRoom(
    supabase,
    { kind: 'whole_team', venture_slug: ventureSlug },
    { kind: 'whole_team', venture_slug: ventureSlug },
  )
  await Promise.all(
    FLEET_DEPARTMENTS.map((dept) =>
      findOrCreateRoom(
        supabase,
        { kind: 'department', department: dept, venture_slug: ventureSlug },
        { kind: 'department', department: dept, venture_slug: ventureSlug },
      ),
    ),
  )
  await findOrCreateRoom(
    supabase,
    { kind: 'assigned_scope', owner_user_id: user.id, venture_slug: ventureSlug },
    { kind: 'assigned_scope', owner_user_id: user.id, venture_slug: ventureSlug },
  )

  let listQuery = supabase
    .from('chat_rooms')
    .select(ROOM_SELECT)
    .order('kind', { ascending: true })
    .order('department', { ascending: true })
  listQuery = ventureSlug === null ? listQuery.is('venture_slug', null) : listQuery.eq('venture_slug', ventureSlug)

  const { data, error } = await listQuery
  if (error) {
    return Response.json({ error: String((error as { message?: string })?.message ?? error) }, { status: 500 })
  }

  const rows = ((data as unknown as Row[] | null) ?? []).map(toRoom)
  return Response.json({ rooms: rows })
}

// ─── POST — provision an agent room for (caller, agentId, active venture) ─
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

  const ventureSlug = await resolveVentureSlug(supabase)

  const row = await findOrCreateRoom(
    supabase,
    { kind: 'agent', owner_user_id: user.id, agent_id: agentId, venture_slug: ventureSlug },
    { kind: 'agent', owner_user_id: user.id, agent_id: agentId, venture_slug: ventureSlug },
  )
  if (!row) return Response.json({ error: 'room provisioning failed' }, { status: 500 })

  return Response.json({ room: toRoom(row) })
}
