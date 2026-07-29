// GET /api/chat/rooms — rooms visible to the caller.
// RLS enforces access; we just return whatever the caller can see.
// Owner: raj · TS-009 Push C1
import { supabaseServer } from '@/lib/supabase-server'

export interface ChatRoom {
  id: string
  kind: 'whole_team' | 'department'
  department: string | null
  label: string
  memberCount: number
}

const ROOM_LABEL_WHOLE = 'Whole team'

export async function GET(): Promise<Response> {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('unauthorized', { status: 401 })

  const { data: rooms, error } = await supabase
    .from('chat_rooms')
    .select('id, kind, department, created_at')
    .order('kind', { ascending: false })
    .order('department', { ascending: true })

  if (error) {
    return Response.json({ error: String(error.message ?? error) }, { status: 500 })
  }

  const rows = ((rooms as unknown as Array<Record<string, unknown>>) ?? []).map((r) => {
    const kind = String(r.kind) as ChatRoom['kind']
    const department = r.department == null ? null : String(r.department)
    return {
      id: String(r.id),
      kind,
      department,
      label: kind === 'whole_team' ? ROOM_LABEL_WHOLE : (department ?? ''),
      memberCount: 0, // filled in when we join with fleet counts in a later push
    } satisfies ChatRoom
  })

  return Response.json({ rooms: rows })
}
