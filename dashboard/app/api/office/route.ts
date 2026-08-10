// GET /api/office — fleet + live activity for the isometric office view.
//
// Returns the real 46-agent fleet (always) enriched with any live activity
// pulled from Supabase agent_sessions. No fake data anywhere — if Supabase
// is unreachable or a session field is missing, the field is undefined and
// the UI renders the empty state.
//
// Owner: raj + dana · TS-010 WI-2
import { createClient } from '@supabase/supabase-js'
import { FLEET, FLEET_DEPARTMENTS, fleetByDepartment } from '@/lib/fleet'
import type { FleetAgent } from '@/lib/fleet'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type AgentStatus = 'working' | 'idle' | 'in-council' | 'errored'
export type WorkspaceKey = string

export interface OfficeAgent extends FleetAgent {
  status: AgentStatus
  /** Session id — used by the UI to draw team-halo linking co-agents */
  sessionId?: string
  /** Human-readable current task (summary from agent_sessions) */
  currentTask?: string
  /** Other agent ids in the same active session */
  coAgents?: string[]
  /** Which workspace this session belongs to */
  workspace?: WorkspaceKey
  /** e.g. "TS-010" */
  taskSpec?: string
  /** e.g. "WI-3" */
  taskSpecWorkItem?: string
  /** 0–100 completed_work_items / total_work_items of current TASK-SPEC */
  progress?: number
  /** ISO timestamp session started */
  startedAt?: string
}

export interface OfficeResponse {
  agents: OfficeAgent[]
  departments: { name: string; total: number; active: number }[]
  supabaseConnected: boolean
  updatedAt: string
}

// ── Session row shape (loose — Supabase schema is still evolving) ────────────
interface SessionRow {
  id?: string
  agent_name?: string
  agent_id?: string
  status?: string
  summary?: string
  started_at?: string
  ended_at?: string | null
  session_id?: string
  workspace?: string
  task_spec?: string
  work_item?: string
  progress?: number
}

function normalizeStatus(s: string | undefined): AgentStatus {
  if (!s) return 'idle'
  const v = s.toLowerCase()
  if (v === 'active' || v === 'working' || v === 'running') return 'working'
  if (v === 'error' || v === 'errored' || v === 'failed') return 'errored'
  if (v === 'council' || v === 'in-council' || v === 'meeting') return 'in-council'
  return 'idle'
}

function normalizeWorkspace(w: string | undefined): WorkspaceKey | undefined {
  if (!w) return undefined
  const v = w.toLowerCase()
  if (v === 'yvon-os' || v === 'yvon' || v === 'yvon_os') return 'yvon-os'
  return (v || 'yvon-os') as WorkspaceKey
  return undefined
}

export async function GET(): Promise<Response> {
  // ── Fleet baseline (always available) ─────────────────────────────────────
  const agents: OfficeAgent[] = FLEET.map((a) => ({ ...a, status: 'idle' as AgentStatus }))
  const byId = new Map(agents.map((a) => [a.id, a]))

  // ── Live activity — best effort. Supabase down → agents stay idle. ────────
  let supabaseConnected = false
  try {
    const { data, error } = await supabase
      .from('agent_sessions')
      .select('*')
      .in('status', ['active', 'working', 'running', 'in-council'])
      .order('started_at', { ascending: false })
      .limit(200)

    if (!error) {
      supabaseConnected = true
      const rows: SessionRow[] = data ?? []

      // First pass: enrich each agent with its session
      for (const row of rows) {
        const key = (row.agent_id ?? row.agent_name ?? '').toLowerCase()
        const agent = byId.get(key)
        if (!agent) continue
        // Only overwrite if this is the agent's most-recent session
        if (agent.startedAt && row.started_at && row.started_at < agent.startedAt) continue
        agent.status = normalizeStatus(row.status)
        agent.sessionId = row.session_id ?? row.id
        agent.currentTask = row.summary
        agent.workspace = normalizeWorkspace(row.workspace)
        agent.taskSpec = row.task_spec
        agent.taskSpecWorkItem = row.work_item
        agent.progress = typeof row.progress === 'number' ? row.progress : undefined
        agent.startedAt = row.started_at
      }

      // Second pass: link co-agents by shared sessionId
      const bySession = new Map<string, string[]>()
      for (const agent of agents) {
        if (!agent.sessionId) continue
        const list = bySession.get(agent.sessionId) ?? []
        list.push(agent.id)
        bySession.set(agent.sessionId, list)
      }
      for (const agent of agents) {
        if (!agent.sessionId) continue
        const peers = bySession.get(agent.sessionId) ?? []
        const coAgents = peers.filter((id) => id !== agent.id)
        if (coAgents.length > 0) agent.coAgents = coAgents
      }
    }
  } catch {
    // Supabase unreachable — agents remain idle, no fabricated data.
  }

  // ── Department roll-up ───────────────────────────────────────────────────
  const departments = FLEET_DEPARTMENTS.map((name) => {
    const members = fleetByDepartment(name)
    const active = members.filter(
      (m) => byId.get(m.id)?.status === 'working' || byId.get(m.id)?.status === 'in-council'
    ).length
    return { name, total: members.length, active }
  })

  const body: OfficeResponse = {
    agents,
    departments,
    supabaseConnected,
    updatedAt: new Date().toISOString(),
  }
  return Response.json(body)
}
