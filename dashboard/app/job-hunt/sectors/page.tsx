'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Search, Loader2, TrendingUp, DollarSign, ShieldCheck, Check, Plus, X, Sparkles } from 'lucide-react'
import { AtelierBackdrop, Squiggle } from '../../chat/Atelier'
import '../../chat/chat.css'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — SECTOR EXPLORER v4 (2026-08-25)
//  One-button flow per operator feedback: tick a sector → it's in your
//  selection → manage it on the SAVED tab (one list, Save button at the
//  bottom). No separate Explorer stage, no dual circles, no header save.
//  Custom sectors: created on the fly, auto-ticked, live-derived data (≈)
//  until researched/seeded; "Available · data fills as pulls run" fallback.
// ═══════════════════════════════════════════════════════════════════════════

interface Sector {
  id: string
  name: string
  description: string | null
  keywords: string[]
  demand: string | null
  typical_pay: string | null
  pr_value: string | null
  teer: string | null
  custom: boolean
  liveDerived: boolean
  livePostings: number
  livePay: string | null
}

const DEMAND_TONE: Record<string, string> = {
  high: 'bg-[rgba(16,185,129,0.12)] text-[#047857]',
  medium: 'bg-[rgba(138,97,20,0.12)] text-[#8a6114]',
  low: 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-faint)]',
}
const PR_TONE: Record<string, string> = {
  excellent: 'bg-[rgba(16,185,129,0.12)] text-[#047857]',
  good: 'bg-[rgba(89,46,255,0.1)] text-[var(--chat-accent)]',
  moderate: 'bg-[rgba(138,97,20,0.12)] text-[#8a6114]',
}
const TAB_CLS = (active: boolean) =>
  `rounded-[200px] px-4 py-2 text-[12.5px] font-semibold transition border ` +
  (active
    ? 'border-transparent bg-[rgba(89,46,255,0.1)] text-[var(--chat-accent)]'
    : 'border-[var(--chat-hairline)] bg-white text-[var(--chat-text-dim)] hover:border-[var(--chat-text-faint)]')

function Tags({ s }: { s: Sector }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {s.demand && (
        <span className={`flex items-center gap-1 rounded-[200px] px-2 py-0.5 text-[10px] font-bold capitalize ${DEMAND_TONE[s.demand] ?? ''}`}>
          <TrendingUp size={9} /> {s.liveDerived ? '≈ ' : ''}{s.demand} demand
        </span>
      )}
      {s.typical_pay && (
        <span className="flex items-center gap-1 rounded-[200px] bg-[var(--chat-surface-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--chat-text-dim)]">
          <DollarSign size={9} /> {s.livePay ?? s.typical_pay}
        </span>
      )}
      {s.pr_value && (
        <span className={`flex items-center gap-1 rounded-[200px] px-2 py-0.5 text-[10px] font-bold capitalize ${PR_TONE[s.pr_value] ?? ''}`}>
          <ShieldCheck size={9} /> {s.liveDerived ? '≈ ' : ''}PR {s.pr_value}
        </span>
      )}
      {s.teer && <span className="rounded-[200px] bg-[var(--chat-surface-strong)] px-2 py-0.5 text-[10px] text-[var(--chat-text-faint)]">{s.liveDerived ? '≈ ' : ''}TEER {s.teer}</span>}
      <span className="rounded-[200px] px-2 py-0.5 text-[10px] font-semibold text-[var(--chat-text-faint)]">{s.livePostings} live</span>
      {s.custom && <span className="rounded-[200px] bg-[rgba(89,46,255,0.1)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--chat-accent)]">custom</span>}
      {s.custom && s.livePostings === 0 && !s.livePay && !s.typical_pay && (
        <span className="rounded-[200px] bg-[rgba(138,97,20,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[#8a6114]">Available · data fills as pulls run</span>
      )}
    </div>
  )
}

export default function JobHuntSectorsPage() {
  const [sectors, setSectors] = useState<Sector[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [recommended, setRecommended] = useState<{ id: string; name: string; reasons: string[] }[]>([])
  const [profileSeeded, setProfileSeeded] = useState(false)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'explore' | 'saved'>('explore')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const byId = useMemo(() => new Map(sectors.map((s) => [s.id, s])), [sectors])

  const notify = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(null), 4000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/job-hunt/sectors')
      const data = await res.json()
      setSectors(data.sectors ?? [])
      setSelected(new Set(data.selected ?? []))
      setRecommended(data.recommended ?? [])
      setProfileSeeded(data.profileSeeded === true)
    } catch { setSectors([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sectors
    return sectors.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      (s.description ?? '').toLowerCase().includes(q) ||
      (s.keywords ?? []).some((k) => k.toLowerCase().includes(q)))
  }, [sectors, query])

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q.length > 0 && sectors.some((s) => s.name.toLowerCase() === q)
  }, [sectors, query])

  const save = useCallback(async () => {
    setSaving(true); setSaved(false); setSaveError(null)
    try {
      const res = await fetch('/api/job-hunt/sectors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selected: [...selected] }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 4000)
      } else {
        const data = await res.json().catch(() => null)
        setSaveError(data?.error ?? 'Save failed — try again')
      }
    } catch { setSaveError('Network error — try again') }
    setSaving(false)
  }, [selected])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const createSector = async (name: string) => {
    setBusy('__create__')
    try {
      const res = await fetch('/api/job-hunt/sectors/custom', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'create failed')
      setSelected((prev) => {
        const next = new Set(prev)
        next.add(data.id)
        return next
      })
      setQuery('')
      notify(`Created "${name}" — added to your selection ✓`)
      await load()
    } catch { notify(`Couldn't create "${name}" — try again`) }
    setBusy(null)
  }

  // The ONE action on every card: tick = in your selection (Saved tab).
  const TickCircle = ({ s }: { s: Sector }) => {
    const on = selected.has(s.id)
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(s.id) }}
        aria-label={on ? `Remove ${s.name} from selection` : `Add ${s.name} to selection`}
        title={on ? 'In your selection — click to remove' : 'Add to selection'}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${on ? 'border-transparent bg-[#592eff] text-white' : 'border-[var(--chat-hairline)] text-transparent hover:border-[var(--chat-accent)] hover:text-[var(--chat-accent)]'}`}
      >
        <Check size={12} />
      </button>
    )
  }

  const searching = query.trim().length > 0

  return (
    <div className="chat-shell relative min-h-screen overflow-hidden">
      <AtelierBackdrop />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-10">
        <Link href="/job-hunt" className="mb-3 inline-flex items-center gap-1 text-[11.5px] text-[var(--chat-text-dim)] hover:text-[var(--chat-accent)]">← Back to Job Hunt</Link>
        <div>
          <h1 className="adora-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--chat-text)] md:text-[34px]">
            <Squiggle>Sector Explorer</Squiggle>
          </h1>
          <p className="mt-2 max-w-[680px] text-[13.5px] leading-[1.55] text-[var(--chat-text-dim)]">
            Tick the sectors you want — they land in Saved. Save once and Discover, the sync engines, resumes, and PR
            tagging all follow. Live counts come from Canadian postings as the pull engines collect them.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button onClick={() => setTab('explore')} className={TAB_CLS(tab === 'explore')}>Explore</button>
          <button onClick={() => setTab('saved')} className={TAB_CLS(tab === 'saved')}>
            Saved {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>

        {flash && (
          <p className="mt-3 rounded-[12px] bg-[rgba(89,46,255,0.1)] px-3 py-2 text-[12px] text-[var(--chat-accent)]">{flash}</p>
        )}

        {!loading && tab === 'explore' && !searching && recommended.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[15px] font-bold text-[var(--chat-text)]">Recommended for you</h2>
              <span className="rounded-[200px] bg-[rgba(89,46,255,0.1)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--chat-accent)]">
                future · pay · PR fit
              </span>
              {!profileSeeded && (
                <Link href="/job-hunt" className="text-[11.5px] text-[var(--chat-text-dim)] underline decoration-dotted underline-offset-2 hover:text-[var(--chat-accent)]">
                  Update your Job Hunt profile for personalized picks →
                </Link>
              )}
            </div>
            <p className="mt-1 text-[12px] leading-[1.5] text-[var(--chat-text-faint)]">
              Ranked on live Canadian demand, real posted pay, BC PNP / PR compatibility, and your profile{profileSeeded ? '' : ' (once you fill it in)'}.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((r, i) => {
                const s = byId.get(r.id)
                if (!s) return null
                return (
                  <div key={r.id} className={`chat-glass flex flex-col gap-2 p-4 ${selected.has(s.id) ? 'ring-2 ring-[var(--chat-accent)]' : ''}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#592eff] text-[11px] font-bold text-white">#{i + 1}</span>
                        <Link href={`/job-hunt/sectors/${s.id}`} className="truncate text-[13.5px] font-semibold text-[var(--chat-body)] hover:text-[var(--chat-accent)]">{r.name}</Link>
                      </div>
                      <TickCircle s={s} />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {r.reasons.map((reason) => (
                        <span key={reason} className={`rounded-[200px] px-2 py-0.5 text-[10px] font-semibold capitalize ${
                          reason.includes('demand') ? 'bg-[rgba(16,185,129,0.12)] text-[#047857]'
                          : reason.includes('pay') ? 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-dim)]'
                          : 'bg-[rgba(89,46,255,0.1)] text-[var(--chat-accent)]'
                        }`}>
                          {reason}
                        </span>
                      ))}
                      <span className="ml-auto rounded-[200px] px-2 py-0.5 text-[10px] font-semibold text-[var(--chat-text-faint)]">{s.livePostings} live</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--chat-text-faint)]" /></div>
        ) : tab === 'explore' ? (
          <>
            <div className="relative mt-5 max-w-md">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--chat-text-faint)]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search any sector — e.g. flutter, product manager…"
                className="w-full rounded-[200px] border border-[var(--chat-hairline)] bg-white py-1.5 pl-8 pr-3 text-[11.5px] text-[var(--chat-body)] outline-none placeholder:text-[var(--chat-text-faint)] focus:border-[var(--chat-accent)]" />
            </div>

            {searching ? (
              <div className="mt-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">
                  Search results for “{query.trim()}”
                </p>
                <div className="flex flex-col gap-2">
                  {!exactMatch && (
                    <button onClick={() => createSector(query.trim())} disabled={busy === '__create__'}
                      className="chat-glass flex items-center gap-3 p-4 text-left transition hover:border-[var(--chat-accent)] disabled:opacity-60">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(89,46,255,0.12)] text-[var(--chat-accent)]">
                        <Sparkles size={14} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-[13px] font-semibold text-[var(--chat-body)]">Create sector “{query.trim()}”</span>
                        <span className="block text-[11.5px] text-[var(--chat-text-faint)]">Auto-keywords + live Canadian posting data — added to your selection automatically</span>
                      </span>
                      {busy === '__create__' ? <Loader2 size={14} className="animate-spin text-[var(--chat-accent)]" /> : <Plus size={14} className="text-[var(--chat-accent)]" />}
                    </button>
                  )}
                  {visible.map((s) => (
                    <Link key={s.id} href={`/job-hunt/sectors/${s.id}`}
                      className={`chat-glass flex items-center gap-3 p-4 text-left transition ${selected.has(s.id) ? 'ring-2 ring-[var(--chat-accent)]' : 'hover:border-[var(--chat-text-faint)]'}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[13.5px] font-semibold text-[var(--chat-body)]">{s.name}</h3>
                          {selected.has(s.id) && <span className="rounded-[200px] bg-[#592eff] px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">saved</span>}
                        </div>
                        {s.description && <p className="mt-0.5 truncate text-[11.5px] text-[var(--chat-text-faint)]">{s.description}</p>}
                        <div className="mt-1.5"><Tags s={s} /></div>
                      </div>
                      <TickCircle s={s} />
                    </Link>
                  ))}
                  {visible.length === 0 && (
                    <p className="rounded-[12px] bg-[var(--chat-surface-strong)] px-3 py-2 text-[12px] text-[var(--chat-text-faint)]">
                      Nothing in the catalog matches — use “Create sector” above to start one from scratch.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <h2 className="text-[15px] font-bold text-[var(--chat-text)]">Catalog</h2>
                <p className="mt-1 text-[12px] leading-[1.5] text-[var(--chat-text-faint)]">
                  Tick a sector and it goes to Saved. Untick to remove.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sectors.map((s) => (
                    <Link key={s.id} href={`/job-hunt/sectors/${s.id}`}
                      className={`chat-glass flex flex-col gap-2 p-4 text-left transition ${selected.has(s.id) ? 'ring-2 ring-[var(--chat-accent)]' : 'hover:border-[var(--chat-text-faint)]'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[13.5px] font-semibold text-[var(--chat-body)]">{s.name}</h3>
                        <TickCircle s={s} />
                      </div>
                      {s.description && <p className="text-[11.5px] leading-[1.5] text-[var(--chat-text-faint)]">{s.description}</p>}
                      <div className="mt-auto"><Tags s={s} /></div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 max-w-[1000px]">
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-[var(--chat-text)]">Your selection</h2>
              <span className="rounded-[200px] bg-[var(--chat-surface-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--chat-text-dim)]">{selected.size}</span>
            </div>
            <p className="mt-1 text-[12px] leading-[1.5] text-[var(--chat-text-faint)]">
              Everything you ticked in Explore. Remove what you don’t want, then save — Discover, the 3× daily sync,
              resume variants, and PR tagging follow this one list.
            </p>

            {selected.size === 0 ? (
              <p className="mt-3 rounded-[12px] bg-[var(--chat-surface-strong)] px-3 py-2 text-[12px] text-[var(--chat-text-faint)]">
                Nothing selected yet — go to Explore, tick the sectors you want, and they’ll appear here.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[...selected].map((id) => {
                  const s = byId.get(id)
                  if (!s) return null
                  return (
                    <div key={id} className="chat-glass flex flex-col gap-2 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-[13.5px] font-semibold text-[var(--chat-body)]">{s.name}</h3>
                        <button onClick={() => toggle(s.id)} aria-label={`Remove ${s.name} from selection`} title="Remove from selection"
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--chat-text-faint)] hover:bg-[var(--chat-surface-strong)] hover:text-[#b91c1c]">
                          <X size={12} />
                        </button>
                      </div>
                      <div className="mt-auto"><Tags s={s} /></div>
                      <button onClick={() => toggle(s.id)}
                        className="mt-1 flex items-center justify-center gap-1.5 rounded-[10px] bg-[var(--chat-surface-strong)] px-3 py-1.5 text-[11.5px] font-semibold text-[var(--chat-text-dim)] transition hover:text-[#b91c1c]">
                        Remove from selection
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            <button onClick={save} disabled={saving || selected.size === 0}
              className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-[12px] bg-[#592eff] px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-[#4520cc] disabled:opacity-50">
              {saving ? 'Saving…' : selected.size === 0 ? 'Nothing to save yet' : `Save selection (${selected.size})`}
            </button>
            {saveError && (
              <p className="mt-2 text-center text-[12px] text-[#b91c1c]">{saveError}</p>
            )}
            {saved && (
              <p className="mt-2 text-center text-[12px] text-[#047857]">Saved ✓ — Discover, the 3× daily sync, resume variants, and PR tagging now follow your {selected.size} selected sectors.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
