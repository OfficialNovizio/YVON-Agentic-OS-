'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui'
import { Users, Save, Loader2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
//  AGENTS (TEAM GRANTS) TAB — 2026-08-15
// ═══════════════════════════════════════════════════════════════════════════
// The one settings tab that DOESN'T follow the parent-owns-all-state pattern
// the other 4 tabs use (_general/_technical/_social/_deployment) — grants
// are their own async data source (structure.json's 46-agent roster + this
// venture's current venture_agents rows), unrelated to the VentureData PATCH
// body those tabs share, so this tab fetches and saves independently.
//
// This is what YvonGraph's "Team" mode (components/YvonGraph.tsx, satellite
// view) reads — before this tab existed, venture_agents had NO write path
// anywhere (confirmed 2026-08-15: no UI, no API route; the only rows ever in
// it came from a one-time manual SQL backfill that was later wiped). Every
// venture's Team mode was permanently empty with no way for an operator to
// fix that short of raw SQL.

interface RosterAgent { id: string; name: string; tag: string }
interface RosterDept { id: string; name: string; agents: RosterAgent[] }

export default function AgentsTab({ ventureId, ventureName }: { ventureId: string; ventureName: string }) {
  const [depts, setDepts] = useState<RosterDept[]>([])
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch('/structure.json').then((r) => r.json()),
      fetch(`/api/ventures/${ventureId}/agents`).then((r) => r.json()),
    ])
      .then(([structure, grants]: [{ departments: RosterDept[] }, { agentIds?: string[] }]) => {
        setDepts(structure.departments ?? [])
        setChecked(new Set(grants.agentIds ?? []))
      })
      .catch(() => { setDepts([]); setChecked(new Set()) })
      .finally(() => setLoading(false))
  }, [ventureId])

  const toggle = (agentId: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(agentId)) next.delete(agentId)
      else next.add(agentId)
      return next
    })
  }

  const setDept = (dept: RosterDept, on: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev)
      for (const a of dept.agents) (on ? next.add(a.id) : next.delete(a.id))
      return next
    })
  }

  const save = useCallback(async () => {
    setSaving(true); setSaveMsg('')
    try {
      const res = await fetch(`/api/ventures/${ventureId}/agents`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentIds: Array.from(checked) }),
      })
      setSaveMsg(res.ok ? 'Saved ✓' : 'Error saving')
    } catch { setSaveMsg('Network error') }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }, [ventureId, checked])

  if (loading) {
    return <div className="flex items-center justify-center h-32"><Loader2 size={20} className="animate-spin text-on-surface-variant" /></div>
  }

  const totalAgents = depts.reduce((n, d) => n + d.agents.length, 0)

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-on-surface-variant/70 -mt-1 mb-1">
        Which of YVON&apos;s {totalAgents} fleet agents can work on <b className="text-on-surface">{ventureName}</b>.
        This drives brain-wiki&apos;s &ldquo;Team&rdquo; graph view — an ungranted agent won&apos;t show up there at all.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {depts.map((dept) => {
          const deptChecked = dept.agents.filter((a) => checked.has(a.id)).length
          const allOn = deptChecked === dept.agents.length && dept.agents.length > 0
          return (
            <Card key={dept.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Users size={15} style={{ color: 'var(--ws-accent)' }} />
                  <h3 className="text-sm font-semibold">{dept.name}</h3>
                  <span className="text-[11px] text-on-surface-variant/50">{deptChecked}/{dept.agents.length}</span>
                </div>
                <button onClick={() => setDept(dept, !allOn)}
                  className="text-[11px] text-on-surface-variant hover:text-on-surface underline decoration-dotted">
                  {allOn ? 'Clear' : 'All'}
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {dept.agents.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-white/[0.03] cursor-pointer">
                    <input type="checkbox" checked={checked.has(a.id)} onChange={() => toggle(a.id)}
                      className="accent-current" style={{ color: 'var(--ws-accent)' }} />
                    <span className="text-[13px] text-on-surface">{a.name}</span>
                    <span className="text-[11px] text-on-surface-variant/50 truncate">{a.tag}</span>
                  </label>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      <div className="flex items-center gap-3 pb-4">
        <button onClick={save} disabled={saving} className="btn-accent flex items-center gap-1.5 text-xs px-4 py-2">
          <Save size={14} /> {saving ? 'Saving...' : `Save Grants (${checked.size} granted)`}
        </button>
        {saveMsg && <span className={`text-xs ${saveMsg.startsWith('Saved') ? 'text-emerald-400' : 'text-red-400'}`}>{saveMsg}</span>}
      </div>
    </div>
  )
}
