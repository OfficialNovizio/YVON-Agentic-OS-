// GET  /api/chat/threads  — the caller's own past chats, newest first.
// POST /api/chat/threads  — start a new chat (an empty thread room).
//
// WHY THIS EXISTS (2026-08-21)
// ---------------------------
// Until now /chat had no way to start a conversation. The four room kinds
// are all auto-provisioned singletons — one whole_team room, one room per
// department, one assigned_scope room per user, one agent room per
// (user, agent) — so every message you ever sent to the workforce landed in
// the SAME room forever. The header's "New message ⌘K" button only focused
// the textarea; there was no "new chat" anywhere, and no history to browse
// because there was only ever one thread to be in.
//
// A thread room fixes both at once, and fixes a third thing for free: the
// Hermes agent pool is keyed on (user_id, room_id), so a brand-new thread
// gets a brand-new agent with no carried-over context — which is exactly
// what "start from scratch" is supposed to mean.
//
// Titles are DERIVED, not stored, unless someone explicitly set one. The
// first user message in a thread is its label. That keeps the write path
// untouched (no title-stamping hook in the send path, nothing to get out of
// sync if a send half-fails) and means existing threads get sensible labels
// with no backfill. `chat_rooms.title` stays available as an override for a
// future rename affordance.
//
// Nothing here deletes anything. Archiving is a soft flag; chat_messages
// rows always remain, so the usage/graph views keep their source data.
import { supabaseServer } from '@/lib/supabase-server'
import { resolveVentureSlug } from '@/lib/chat-venture'

export interface ChatThread {
  id: string
  title: string
  /** First line of the most recent message, for the History list's subtitle. */
  preview: string
  messageCount: number
  createdAt: string
  lastMessageAt: string | null
}

/** Cap on threads returned — History is a browsing list, not an export. */
const THREAD_LIMIT = 60
/** Longest derived title before ellipsis. */
const TITLE_MAX = 64
const PREVIEW_MAX = 90

function squash(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  return `${flat.slice(0, max - 1).trimEnd()}…`
}

interface RoomRow {
  id: string
  title: string | null
  created_at: string
}

interface MsgRow {
  room_id: string
  author_kind: string
  content: string | null
  created_at: string
}

// ─── GET — the caller's threads for the active venture ────────────────────
export async function GET(): Promise<Response> {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const ventureSlug = await resolveVentureSlug(supabase)

  let roomQuery = supabase
    .from('chat_rooms')
    .select('id, title, created_at')
    .eq('kind', 'thread')
    .eq('owner_user_id', user.id)
    .is('archived_at', null)
    .order('created_at', { ascending: false })
    .limit(THREAD_LIMIT)
  roomQuery = ventureSlug === null
    ? roomQuery.is('venture_slug', null)
    : roomQuery.eq('venture_slug', ventureSlug)

  const { data: roomData, error: roomErr } = await roomQuery
  if (roomErr) {
    return Response.json({ error: String(roomErr.message ?? roomErr) }, { status: 500 })
  }
  const rooms = (roomData as unknown as RoomRow[] | null) ?? []
  if (rooms.length === 0) return Response.json({ threads: [] })

  // One batched read for every thread's messages rather than a query per
  // thread — History opens with up to 60 rooms in the list.
  const { data: msgData, error: msgErr } = await supabase
    .from('chat_messages')
    .select('room_id, author_kind, content, created_at')
    .in('room_id', rooms.map((r) => r.id))
    .order('created_at', { ascending: true })
  if (msgErr) {
    return Response.json({ error: String(msgErr.message ?? msgErr) }, { status: 500 })
  }

  const byRoom = new Map<string, MsgRow[]>()
  for (const raw of ((msgData as unknown as MsgRow[] | null) ?? [])) {
    const bucket = byRoom.get(raw.room_id)
    if (bucket) bucket.push(raw)
    else byRoom.set(raw.room_id, [raw])
  }

  const threads: ChatThread[] = rooms.map((room) => {
    const msgs = byRoom.get(room.id) ?? []
    const firstUser = msgs.find((m) => m.author_kind === 'user')
    const last = msgs[msgs.length - 1]
    const derived = firstUser?.content ? squash(firstUser.content, TITLE_MAX) : ''
    return {
      id: room.id,
      title: room.title?.trim() || derived || 'New chat',
      preview: last?.content ? squash(last.content, PREVIEW_MAX) : '',
      messageCount: msgs.length,
      createdAt: room.created_at,
      lastMessageAt: last?.created_at ?? null,
    }
  })

  // Most recently ACTIVE first — a thread you replied in an hour ago belongs
  // above one you created yesterday and abandoned. Falls back to created_at
  // so a brand-new empty thread still sorts to the top.
  threads.sort((a, b) => (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt))

  return Response.json({ threads })
}

// ─── POST — start a new chat ──────────────────────────────────────────────
// Body: { title?: string }  (optional; normally derived from message one)
export async function POST(request: Request): Promise<Response> {
  let body: { title?: string } = {}
  try {
    body = (await request.json()) as { title?: string }
  } catch {
    // no body is the normal case for "New chat" — not an error
  }

  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const ventureSlug = await resolveVentureSlug(supabase)
  const title = (body.title ?? '').trim().slice(0, TITLE_MAX) || null

  const { data, error } = await supabase
    .from('chat_rooms')
    .insert({
      kind: 'thread',
      owner_user_id: user.id,
      venture_slug: ventureSlug,
      title,
    })
    .select('id, kind, department, agent_id, owner_user_id, venture_slug, title, created_at')
    .maybeSingle()

  if (error || !data) {
    return Response.json(
      { error: String((error as { message?: string } | null)?.message ?? 'thread creation failed') },
      { status: 500 },
    )
  }

  const row = data as unknown as {
    id: string
    kind: string
    department: string | null
    agent_id: string | null
    owner_user_id: string | null
    venture_slug: string | null
    title: string | null
  }

  return Response.json({
    room: {
      id: row.id,
      kind: 'thread' as const,
      department: row.department,
      agentId: row.agent_id,
      ownerUserId: row.owner_user_id,
      ventureSlug: row.venture_slug,
      title: row.title,
      label: row.title || 'New chat',
      section: 'recent' as const,
    },
  })
}
