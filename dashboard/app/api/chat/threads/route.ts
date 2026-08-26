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
  /** Room kind — History lists real past conversations of every kind, not
   *  only threads, because "where are my previous chats" means all of them. */
  kind: 'whole_team' | 'department' | 'agent' | 'assigned_scope' | 'thread'
  /** Every row can be hidden from History. */
  canArchive: boolean
  /** True only in the includeHidden view, so the UI can offer "restore". */
  hidden: boolean
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
  kind: ChatThread['kind']
  department: string | null
  agent_id: string | null
  title: string | null
  created_at: string
}

/** Display name for a non-thread room — mirrors labelFor() in rooms/route.ts. */
function roomLabel(row: RoomRow): string {
  if (row.kind === 'whole_team') return 'Workforce'
  if (row.kind === 'assigned_scope') return 'All assigned'
  if (row.kind === 'agent') return `@${row.agent_id ?? 'agent'}`
  if (row.kind === 'department') return `#${row.department ?? 'department'}`
  return 'New chat'
}

interface MsgRow {
  room_id: string
  author_kind: string
  content: string | null
  created_at: string
}

// ─── GET — the caller's threads for the active venture ────────────────────
export async function GET(request: Request): Promise<Response> {
  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const ventureSlug = await resolveVentureSlug(supabase)
  const { searchParams } = new URL(request.url)
  const includeHidden = searchParams.get('includeHidden') === '1'

  // Rooms this user has hidden from their own History (chat_room_hidden).
  // Per-user by design — see that table's migration for why archived_at was
  // the wrong mechanism.
  const { data: hiddenRows } = await supabase.from('chat_room_hidden').select('room_id')
  const hidden = new Set(
    ((hiddenRows as unknown as { room_id: string }[] | null) ?? []).map((r) => r.room_id),
  )

  // Every room the caller can see in this venture, not just threads. "Where
  // are my previous chats" means all of them — the long-running Workforce
  // conversation is the most important one in most people's history, and
  // listing only threads made it look like it had vanished. RLS already
  // limits this to rooms the caller may see.
  let roomQuery = supabase
    .from('chat_rooms')
    .select('id, kind, department, agent_id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(THREAD_LIMIT)
  roomQuery = ventureSlug === null
    ? roomQuery.is('venture_slug', null)
    : roomQuery.eq('venture_slug', ventureSlug)

  const { data: roomData, error: roomErr } = await roomQuery
  if (roomErr) {
    return Response.json({ error: String(roomErr.message ?? roomErr) }, { status: 500 })
  }
  const allRooms = (roomData as unknown as RoomRow[] | null) ?? []
  const rooms = includeHidden ? allRooms : allRooms.filter((r) => !hidden.has(r.id))
  if (rooms.length === 0) {
    return Response.json({ threads: [], hiddenCount: hidden.size })
  }

  const roomIds = rooms.map((r) => r.id)

  // Two narrow reads instead of "every message in every room": the newest
  // messages overall (for each room's preview + activity time), and the
  // earliest user messages in threads only (for derived titles). Pulling a
  // whole room's history just to read its first and last line does not scale
  // once the Workforce room has thousands of messages in it.
  const [{ data: recentData, error: recentErr }, { data: firstData, error: firstErr }] =
    await Promise.all([
      supabase
        .from('chat_messages')
        .select('room_id, author_kind, content, created_at')
        .in('room_id', roomIds)
        .order('created_at', { ascending: false })
        .limit(600),
      supabase
        .from('chat_messages')
        .select('room_id, author_kind, content, created_at')
        .in('room_id', rooms.filter((r) => r.kind === 'thread').map((r) => r.id))
        .eq('author_kind', 'user')
        .order('created_at', { ascending: true })
        .limit(300),
    ])
  if (recentErr || firstErr) {
    const err = recentErr ?? firstErr
    return Response.json({ error: String(err?.message ?? err) }, { status: 500 })
  }

  // First occurrence wins: `recent` is newest-first, so the first row seen for
  // a room is its latest message; `first` is oldest-first, so the first row
  // seen there is that thread's opening user message.
  const latest = new Map<string, MsgRow>()
  const counts = new Map<string, number>()
  for (const row of ((recentData as unknown as MsgRow[] | null) ?? [])) {
    if (!latest.has(row.room_id)) latest.set(row.room_id, row)
    counts.set(row.room_id, (counts.get(row.room_id) ?? 0) + 1)
  }
  const opener = new Map<string, MsgRow>()
  for (const row of ((firstData as unknown as MsgRow[] | null) ?? [])) {
    if (!opener.has(row.room_id)) opener.set(row.room_id, row)
  }

  // Empty threads are drafts, not history. The landing chat is a real
  // chat_rooms row created before the user has typed anything, so listing it
  // filled History with meaningless "New chat" rows. A thread earns its place
  // in the list by having at least one message in it.
  const threadsWithNoMessages = new Set(
    rooms.filter((r) => r.kind === 'thread' && !latest.has(r.id) && !r.title).map((r) => r.id),
  )

  const threads: ChatThread[] = rooms.filter((r) => !threadsWithNoMessages.has(r.id)).map((room) => {
    const last = latest.get(room.id)
    const derived = room.kind === 'thread'
      ? squash(opener.get(room.id)?.content ?? '', TITLE_MAX)
      : ''
    return {
      id: room.id,
      kind: room.kind,
      // Every row can be removed from History, including Workforce and the
      // department rooms (2026-08-21, by request). Removing one is a LIST
      // operation, not a delete: the room keeps existing and stays reachable
      // from the dock rail, and every message stays in the database. See the
      // DELETE handler for why that distinction is the honest one.
      canArchive: true,
      hidden: hidden.has(room.id),
      title: room.title?.trim() || derived || roomLabel(room),
      preview: last?.content ? squash(last.content, PREVIEW_MAX) : '',
      // Capped by the 600-row window above, so this is "at least N" for very
      // busy rooms rather than an exact total. It drives a hint, not a claim.
      messageCount: counts.get(room.id) ?? 0,
      createdAt: room.created_at,
      lastMessageAt: last?.created_at ?? null,
    }
  })

  // Real conversations first, newest activity at the top. Rooms that have
  // never been used sink below everything with history — except brand-new
  // threads, which fall back to created_at so a just-clicked New chat still
  // appears at the top where the user expects it.
  const used = threads.filter((t) => t.lastMessageAt)
  used.sort((a, b) =>
    (b.lastMessageAt ?? b.createdAt).localeCompare(a.lastMessageAt ?? a.createdAt),
  )
  const unused = threads
    .filter((t) => !t.lastMessageAt)
    .sort((a, b) => a.title.localeCompare(b.title))

  return Response.json({ threads: [...used, ...unused], hiddenCount: hidden.size })
}

// ─── POST — start a new chat ──────────────────────────────────────────────
// Body: { title?: string, reuseEmpty?: boolean }
//
// `reuseEmpty` is what the /chat landing uses. Opening the page should land
// on a blank chat, but a blank chat is a real chat_rooms row, and creating
// one per page load would breed junk rooms forever (two already appeared
// during a few minutes of testing). With reuseEmpty the server hands back an
// existing untouched draft if one is lying around, so no matter how many
// times the page is opened there is at most one unused thread. The moment a
// message lands in it, it stops being empty and the next visit makes a new one.
//
// FIX (2026-08-21): this was silently handing back real conversations.
// `chat_rooms.title` is derived, never stored (see file header), so
// `.is('title', null)` is true for nearly every thread, empty or not — the
// only real gate was the chat_messages "is it used" check below, and that
// check read `data` without ever looking at `error`. A failed/blocked lookup
// made every candidate look unused, so the first (most recently *created*,
// not most recently *empty*) thread — however much history it held — got
// returned as "New chat". Separately, hiding a thread from History (the X
// button, DELETE below) only writes to chat_room_hidden; it never touches
// `archived_at` or `title`, so a hidden thread was never excluded from the
// candidate pool either — a chat you'd explicitly removed could still
// resurface here. Both are fixed below: hidden rooms are excluded up front,
// and the used-check fails CLOSED (treat as "used" on error, never "unused").
export async function POST(request: Request): Promise<Response> {
  let body: { title?: string; reuseEmpty?: boolean } = {}
  try {
    body = (await request.json()) as { title?: string; reuseEmpty?: boolean }
  } catch {
    // no body is the normal case for "New chat" — not an error
  }

  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const ventureSlug = await resolveVentureSlug(supabase)
  const title = (body.title ?? '').trim().slice(0, TITLE_MAX) || null

  if (body.reuseEmpty && !title) {
    // Rooms this user has hidden from History — never eligible to come back
    // as "your new chat". If this lookup fails we cannot prove a candidate
    // ISN'T one of them, so skip reuse entirely for this request (falls
    // through to the plain INSERT below) rather than risk resurfacing one.
    const { data: hiddenRows, error: hiddenErr } = await supabase
      .from('chat_room_hidden')
      .select('room_id')
      .eq('user_id', user.id)

    if (!hiddenErr) {
      const hidden = new Set(
        ((hiddenRows as unknown as { room_id: string }[] | null) ?? []).map((r) => r.room_id),
      )

      let candidates = supabase
        .from('chat_rooms')
        .select('id, kind, department, agent_id, owner_user_id, venture_slug, title, created_at')
        .eq('kind', 'thread')
        .eq('owner_user_id', user.id)
        .is('archived_at', null)
        .is('title', null)
        .order('created_at', { ascending: false })
        // Widened from 10: hidden candidates are now filtered out below, so a
        // user with several hidden threads at the top of their own list needs
        // enough rows left to still find a genuinely empty one further back.
        .limit(30)
      candidates = ventureSlug === null
        ? candidates.is('venture_slug', null)
        : candidates.eq('venture_slug', ventureSlug)

      const { data: possible } = await candidates
      const rows = (
        (possible as unknown as Array<Record<string, unknown>> | null) ?? []
      ).filter((r) => !hidden.has(String(r.id)))

      if (rows.length > 0) {
        const ids = rows.map((r) => String(r.id))
        const { data: usedRows, error: usedErr } = await supabase
          .from('chat_messages')
          .select('room_id')
          .in('room_id', ids)
        // Fail CLOSED: on error, assume every candidate is used (real
        // conversation) rather than assume none are. The previous version
        // ignored `usedErr` entirely, which is the root cause this whole fix
        // is for — an unchecked failure here is what let a real conversation
        // pass as "empty".
        const used = usedErr
          ? new Set(ids)
          : new Set(
              ((usedRows as unknown as { room_id: string }[] | null) ?? []).map((m) => m.room_id),
            )
        const reusable = rows.find((r) => !used.has(String(r.id)))
        if (reusable) {
          return Response.json({
            room: {
              id: String(reusable.id),
              kind: 'thread' as const,
              department: null,
              agentId: null,
              ownerUserId: String(reusable.owner_user_id ?? ''),
              ventureSlug: (reusable.venture_slug as string | null) ?? null,
              title: null,
              label: 'New chat',
              section: 'recent' as const,
            },
            reused: true,
          })
        }
      }
    }
  }

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
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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

// ─── DELETE — remove a chat from History ──────────────────────────────────
// Query: ?roomId=<uuid>
//
// This ARCHIVES, it does not destroy. `archived_at` is stamped, the room
// stops appearing in History, and every chat_messages row stays exactly
// where it is — the usage and graph views read that table, and silently
// shredding their source data to tidy a list would be the wrong trade. If a
// hard delete is ever genuinely wanted it should be a separate, explicit,
// clearly-labelled action rather than the thing the X button does.
//
// Works on ANY room the caller can see, including Workforce and the
// department rooms (2026-08-21 — the first version refused those, which was
// wrong: "get this out of my History" is a reasonable thing to want for a
// ten-hour room full of old rate-limit errors). The distinction that matters
// is that for a shared room this is purely a list preference — /api/chat/rooms
// deliberately does NOT filter on archived_at, so Workforce stays exactly
// where it is on the dock rail and keeps working. Only History stops
// listing it.
export async function DELETE(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')
  if (!roomId) return Response.json({ error: 'roomId required' }, { status: 400 })

  const supabase = await supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const { data: room, error: readErr } = await supabase
    .from('chat_rooms')
    .select('id, kind, owner_user_id')
    .eq('id', roomId)
    .maybeSingle()
  if (readErr) {
    return Response.json({ error: String(readErr.message ?? readErr) }, { status: 500 })
  }
  if (!room) return Response.json({ error: 'chat not found' }, { status: 404 })

  const row = room as unknown as { kind: string; owner_user_id: string | null }

  // Personal rooms (threads, agent 1:1s, assigned_scope) must belong to the
  // caller. The shared rooms — Workforce and departments — have no owner, and
  // hiding one only affects this caller's list, so ownership does not apply.
  const personal = row.kind === 'thread' || row.kind === 'agent' || row.kind === 'assigned_scope'
  if (personal && row.owner_user_id !== user.id) {
    return Response.json({ error: 'not your chat' }, { status: 403 })
  }

  // Restore (?restore=1) removes the hide, so a mis-click is recoverable.
  if (searchParams.get('restore') === '1') {
    const { error: delErr } = await supabase
      .from('chat_room_hidden')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', user.id)
    if (delErr) {
      return Response.json({ error: String(delErr.message ?? delErr) }, { status: 500 })
    }
    return Response.json({ ok: true, restored: roomId })
  }

  const { error: insErr } = await supabase
    .from('chat_room_hidden')
    .upsert({ user_id: user.id, room_id: roomId }, { onConflict: 'user_id,room_id' })
  if (insErr) {
    return Response.json({ error: String(insErr.message ?? insErr) }, { status: 500 })
  }

  // Read back before claiming success. The previous version reported ok:true
  // on an UPDATE that RLS had silently turned into a zero-row no-op, so the
  // UI removed the row optimistically and the next poll brought it straight
  // back. A write that cannot be observed is not a write.
  const { data: check } = await supabase
    .from('chat_room_hidden')
    .select('room_id')
    .eq('room_id', roomId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!check) {
    return Response.json(
      { error: 'Could not hide this chat — the change did not persist.' },
      { status: 500 },
    )
  }

  return Response.json({ ok: true, hidden: roomId })
}
