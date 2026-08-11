'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader, Card } from '@/components/ui'
import { useWorkspace } from '@/lib/WorkspaceContext'
import {
  Bell, Cpu, Loader2, ToggleLeft, ToggleRight, Plus, Globe, Check, ChevronRight,
} from 'lucide-react'
import AIProviderCard from './AIProviderCard'

// ── YVON-wide preferences (localStorage) ─────────────────────────────────────
const LS = {
  notifications: 'yvon_settings_notifications',
  autoApprove: 'yvon_settings_auto_approve',
  darkMode: 'yvon_settings_dark_mode',
  compactSidebar: 'yvon_settings_compact_sidebar',
}
function load(k: string, fb: boolean): boolean {
  try { const v = localStorage.getItem(k); return v === null ? fb : v === 'true' } catch { return fb }
}
function save(k: string, v: boolean) { try { localStorage.setItem(k, String(v)) } catch {} }

interface SystemInfo {
  systemHealth: {
    status: string; agentsLive: number; supabaseConnected: boolean
    deepseekBalance: number | null; tokenSpentToday: number
  }
}
interface Venture {
  slug: string; name: string; color: string; description?: string
}

export default function SettingsPage() {
  const { workspace, ventures, addVenture } = useWorkspace()
  const [info, setInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const [notifications, setNotificationsState] = useState(true)
  const [autoApprove, setAutoApproveState] = useState(false)
  const [darkMode, setDarkModeState] = useState(true)
  const [compactSidebar, setCompactSidebarState] = useState(false)

  const [selectedVenture, setSelectedVenture] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newVenture, setNewVenture] = useState({ name: '', slug: '', color: '#6366F1', description: '' })
  const [addError, setAddError] = useState<string | null>(null)
  const [addSaving, setAddSaving] = useState(false)

  useEffect(() => {
    setNotificationsState(load(LS.notifications, true))
    setAutoApproveState(load(LS.autoApprove, false))
    setDarkModeState(load(LS.darkMode, true))
    setCompactSidebarState(load(LS.compactSidebar, false))
  }, [])

  const setNotifications = useCallback((v: boolean) => { setNotificationsState(v); save(LS.notifications, v) }, [])
  const setAutoApprove    = useCallback((v: boolean) => { setAutoApproveState(v); save(LS.autoApprove, v) }, [])
  const setDarkMode       = useCallback((v: boolean) => { setDarkModeState(v); save(LS.darkMode, v); document.documentElement.classList.toggle('dark', v) }, [])
  const setCompactSidebar = useCallback((v: boolean) => { setCompactSidebarState(v); save(LS.compactSidebar, v) }, [])

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => { setInfo(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const s = info?.systemHealth

  // ── Add venture ──────────────────────────────────────────────────────────
  async function createVenture() {
    if (!newVenture.name.trim() || !newVenture.slug.trim()) { setAddError('name and slug are required'); return }
    setAddSaving(true); setAddError(null)
    try {
      const res = await fetch('/api/ventures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newVenture.name.trim(),
          slug: newVenture.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          color: newVenture.color,
          description: newVenture.description.trim(),
          igHandle: '', ytChannelId: '', liProfileUrl: '', ga4PropertyId: '',
        }),
      })
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error ?? `HTTP ${res.status}`) }
      const created = await res.json()
      // TS-030: add to the SHARED store so every consumer (selector,
      // switcher, settings, graph) updates instantly — no refresh.
      addVenture(created)
      setAdding(false); setNewVenture({ name: '', slug: '', color: '#6366F1', description: '' })
      setSelectedVenture(created.slug)
    } catch (e) {
      setAddError(e instanceof Error ? e.message : String(e))
    } finally { setAddSaving(false) }
  }

  const toggle = (label: string, value: boolean, onChange: (v: boolean) => void) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-[13px] text-on-surface">{label}</span>
      <button onClick={() => onChange(!value)} className="text-on-surface-variant hover:text-on-surface transition">
        {value ? <ToggleRight size={22} style={{ color: 'var(--ws-accent)' }} /> : <ToggleLeft size={22} />}
      </button>
    </div>
  )

  // ── Tabs: YVON-wide (AI Provider, Preferences) + Ventures ────────────────
  const [tab, setTab] = useState<'provider' | 'prefs' | 'ventures'>('ventures')
  const active = (t: typeof tab) => tab === t

  const tabBtn = (t: typeof tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(t)}
      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition ${
        active(t) ? 'bg-white/[0.08] text-on-surface' : 'text-on-surface-variant hover:bg-white/[0.04] hover:text-on-surface'
      }`}
    >
      {icon}{label}
    </button>
  )

  const selected = ventures.find((v) => v.slug === selectedVenture) ?? ventures.find((v) => v.slug === workspace.key)

  return (
    <div>
      <PageHeader title="Settings" subtitle="Venture-centric configuration, system preferences, and AI provider." />

      <div className="flex gap-6">
        {/* ── Left tab rail ─────────────────────────────────────────────── */}
        <nav className="w-56 shrink-0 space-y-1">
          <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/60">System</div>
          {tabBtn('provider', 'AI Provider', <Cpu size={15} />)}
          {tabBtn('prefs', 'Preferences', <Bell size={15} />)}
          <div className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/60">Ventures</div>
          {tabBtn('ventures', 'Ventures', <Globe size={15} />)}
        </nav>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div className="min-w-0 flex-1">
          {tab === 'provider' && <AIProviderCard />}

          {tab === 'prefs' && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3"><Bell size={16} style={{ color: 'var(--ws-accent)' }} /><h3 className="text-sm font-semibold text-on-surface">Preferences</h3></div>
              {toggle('Decision Queue nudge (30 min)', notifications, setNotifications)}
              {toggle('Auto-approve low-risk tasks', autoApprove, setAutoApprove)}
              {toggle('Dark mode', darkMode, setDarkMode)}
              {toggle('Compact sidebar', compactSidebar, setCompactSidebar)}
              <p className="mt-3 text-[12px] text-on-surface-variant/60">System-wide preferences. Not per-venture.</p>
            </Card>
          )}

          {tab === 'ventures' && (
            <div className="space-y-4">
              {/* Venture list + add */}
              <Card className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Globe size={16} style={{ color: 'var(--ws-accent)' }} /><h3 className="text-sm font-semibold text-on-surface">Ventures</h3></div>
                  <button
                    onClick={() => setAdding((v) => !v)}
                    className="flex items-center gap-1.5 rounded-lg bg-[var(--ws-accent)] px-3 py-1.5 text-[12px] font-medium text-[#06121f] hover:opacity-90"
                  >
                    <Plus size={14} /> Add Venture
                  </button>
                </div>

                {adding && (
                  <div className="mb-4 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-[13px] font-medium text-on-surface">New Venture</div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input value={newVenture.name} onChange={(e) => setNewVenture({ ...newVenture, name: e.target.value })} placeholder="Name (e.g. Novizio)" className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-white/25" />
                      <input value={newVenture.slug} onChange={(e) => setNewVenture({ ...newVenture, slug: e.target.value })} placeholder="Slug (e.g. novizio)" className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-white/25" />
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="color" value={newVenture.color} onChange={(e) => setNewVenture({ ...newVenture, color: e.target.value })} className="h-9 w-9 cursor-pointer rounded border border-white/10 bg-transparent" />
                      <input value={newVenture.description} onChange={(e) => setNewVenture({ ...newVenture, description: e.target.value })} placeholder="Description (optional)" className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-white/25" />
                    </div>
                    {addError && <p className="text-[12px] text-red-400">{addError}</p>}
                    <div className="flex gap-2">
                      <button onClick={createVenture} disabled={addSaving} className="rounded-lg bg-[var(--ws-accent)] px-4 py-1.5 text-[12px] font-medium text-[#06121f] hover:opacity-90 disabled:opacity-40">
                        {addSaving ? 'Creating…' : 'Create Venture'}
                      </button>
                      <button onClick={() => setAdding(false)} className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] text-on-surface-variant hover:bg-white/20">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Venture list */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {ventures.map((v) => (
                    <button
                      key={v.slug}
                      onClick={() => setSelectedVenture(v.slug)}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition ${
                        selected?.slug === v.slug ? 'border-[var(--ws-accent)] bg-white/[0.06]' : 'border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]'
                      }`}
                    >
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: v.color }} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-on-surface">{v.name}</span>
                        <span className="block truncate text-[11px] text-on-surface-variant/60">{v.description || v.slug}</span>
                      </span>
                      {selected?.slug === v.slug && <Check size={14} style={{ color: 'var(--ws-accent)' }} />}
                    </button>
                  ))}
                  {ventures.length === 0 && <p className="text-[12px] text-on-surface-variant/60 col-span-2 py-2">No ventures yet. Add one above.</p>}
                </div>
              </Card>

              {/* Selected venture detail — opens the full edit view (General ·
                  Social · Technical · Database · API Keys · Deployment) */}
              {selected && (
                <Card className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ background: selected.color }} />
                      <h3 className="text-sm font-semibold text-on-surface">{selected.name}</h3>
                      <span className="text-[11px] text-on-surface-variant/60">· {selected.slug}</span>
                    </div>
                    <Link
                      href={`/settings/venture?slug=${selected.slug}`}
                      className="flex items-center gap-1.5 rounded-lg bg-[var(--ws-accent)] px-3 py-1.5 text-[12px] font-medium text-[#06121f] hover:opacity-90"
                    >
                      <ChevronRight size={14} /> Open Full Setup
                    </Link>
                  </div>
                  <p className="text-[13px] text-on-surface">{selected.description || 'No description'}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <VentureStat label="Database" value={s?.supabaseConnected ? 'Connected' : '—'} />
                    <VentureStat label="API Keys" value="—" />
                    <VentureStat label="Deployment" value="—" />
                  </div>
                  <p className="mt-4 text-[12px] text-on-surface-variant/60">
                    Click <span className="text-on-surface">Open Full Setup</span> to view and edit this venture's
                    General · Social · Technical · Database · API Keys · Deployment.
                  </p>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VentureStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/60">{label}</div>
      <div className="mt-0.5 text-[13px] text-on-surface">{value}</div>
    </div>
  )
}
