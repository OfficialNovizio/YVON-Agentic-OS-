'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ExternalLink, Loader2, ShieldCheck, Briefcase, CalendarClock } from 'lucide-react'
import { AtelierBackdrop, Squiggle } from '../../chat/Atelier'
import { estimateCrs, chanceAgainstCutoff, type CrsInput } from '@/lib/job-hunt/crs-estimate'
import '../../chat/chat.css'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — PR INSIGHTS (2026-08-25 · tabs + CRS meter)
//  Recent / Past / Upcoming rule history + a CRS estimate meter + PR-aware
//  posting stats. Informational only — "as of" dates, source links, never
//  legal advice. The CRS figure is an ESTIMATE (single applicant, no spouse
//  factors/nomination) — IRCC's official tool is the real number.
// ═══════════════════════════════════════════════════════════════════════════

interface Rule { topic: string; title: string; body: string; source_url: string; fetched_at: string }
interface PrPosting { id: string; title: string; company: string; location: string | null; url: string; fit_score: number | null }

const TOPIC_LABELS: Record<string, string> = {
  'express-entry': 'Express Entry', crs: 'CRS — points grid', cec: 'Canadian Experience Class',
  'noc-teer': 'NOC / TEER', 'bc-pnp': 'BC PNP — Skills Immigration', 'work-permit': 'Work permits',
}

function asOf(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const UPCOMING_HINTS = /upcoming|planned|will come into effect|effective|proposed|announced|in 2026|in 2027/i

type Tab = 'recent' | 'past' | 'upcoming'
const TABS: { key: Tab; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'past', label: 'Past' },
  { key: 'upcoming', label: 'Upcoming' },
]

const EDUC_OPTIONS: { value: CrsInput['education']; label: string }[] = [
  { value: 'phd', label: 'PhD' },
  { value: 'masters', label: "Master's / professional degree" },
  { value: 'two_plus', label: 'Two or more credentials (one 3+ yr)' },
  { value: 'bachelors', label: "Bachelor's (3+ yr program)" },
  { value: 'diploma2', label: '2-year diploma' },
  { value: 'diploma1', label: '1-year diploma' },
  { value: 'secondary', label: 'Secondary school' },
  { value: 'none', label: 'None / less than secondary' },
]
const SPOUSE_EDUC_OPTIONS: { value: CrsInput['education']; label: string }[] = EDUC_OPTIONS

export default function JobHuntPrPage() {
  const [rules, setRules] = useState<Rule[] | null>(null)
  const [stats, setStats] = useState<{ bcPnpInDemand: number; canadianExp: number } | null>(null)
  const [topPr, setTopPr] = useState<PrPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('recent')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // CRS estimator inputs (full official grid — see crs-estimate.ts).
  const [crs, setCrs] = useState<CrsInput>({
    age: 30, education: 'masters', clb: 9, secondClb: 0, canadianYears: 0, foreignYears: 5,
    pnpNomination: false, frenchNclc7: false, canadianStudyYears: 0, siblingCanada: false,
  })
  const [cutoff, setCutoff] = useState(500)

  const crsResult = useMemo(() => estimateCrs(crs), [crs])
  const chance = useMemo(() => chanceAgainstCutoff(crsResult.total, cutoff), [crsResult.total, cutoff])
  const meterPct = Math.min(100, Math.round((crsResult.total / 1200) * 100))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/job-hunt/pr')
      const data = await res.json()
      setRules(data.rules ?? [])
      setStats(data.stats ?? null)
      setTopPr(data.topPrPostings ?? [])
    } catch { setRules([]) }
    setLoading(false)
  }, [])
  useEffect(() => { load() }, [load])

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const latestByTopic = useMemo(() => {
    const m = new Map<string, Rule>()
    for (const r of rules ?? []) if (!m.has(r.topic)) m.set(r.topic, r)
    return m
  }, [rules])

  const pastVersions = useMemo(() => {
    const out: Rule[] = []
    for (const r of rules ?? []) if (latestByTopic.get(r.topic)?.fetched_at !== r.fetched_at) out.push(r)
    return out
  }, [rules, latestByTopic])

  const upcoming = useMemo(() => {
    const hits: { rule: Rule; snippet: string }[] = []
    for (const r of rules ?? []) {
      const m = r.body.match(UPCOMING_HINTS)
      if (m) {
        const idx = r.body.indexOf(m[0])
        hits.push({ rule: r, snippet: r.body.slice(Math.max(0, idx - 160), idx + 220) })
      }
    }
    return hits
  }, [rules])

  const nextFetch = useMemo(() => {
    const d = new Date()
    const day = d.getUTCDay()
    const diff = (0 - day + 7) % 7
    const next = new Date(d)
    next.setUTCDate(d.getUTCDate() + diff)
    next.setUTCHours(4, 30, 0, 0)
    return next
  }, [])

  const num = (v: string, d: number) => { const n = Number(v); return Number.isFinite(n) ? n : d }

  return (
    <div className="chat-shell relative min-h-screen overflow-hidden">
      <AtelierBackdrop />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-10">
        <Link href="/job-hunt" className="mb-3 inline-flex items-center gap-1 text-[11.5px] text-[var(--chat-text-dim)] hover:text-[var(--chat-accent)]">← Back to Job Hunt</Link>
        <h1 className="adora-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--chat-text)] md:text-[34px]">
          <Squiggle>PR Insights</Squiggle>
        </h1>
        <p className="mt-2 max-w-[680px] text-[13.5px] leading-[1.55] text-[var(--chat-text-dim)]">
          IRCC &amp; BC PNP rules fetched weekly from official sources (canada.ca, welcomebc.ca), the postings with the
          best PR value, and your estimated CRS position. Informational only — never legal advice.
        </p>

        {/* ══ CRS meter ══ */}
        <div className="chat-glass mt-6 p-5">
          <h2 className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--chat-body)]">
            <ShieldCheck size={15} className="text-[var(--chat-accent)]" /> CRS estimate — your position
          </h2>
          <p className="mt-1 text-[11.5px] leading-[1.5] text-[var(--chat-text-faint)]">
            Full official CRS grid: core human capital (single or with spouse), spouse factors, skill transferability,
            and additional points. CLB assumed equal across the four abilities. Verify with IRCC&apos;s official tool.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            <label className="flex flex-col gap-1">
              <span className="text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]">Age</span>
              <input type="number" min={18} max={50} value={crs.age}
                onChange={(e) => setCrs((p) => ({ ...p, age: num(e.target.value, 30) }))}
                className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2 py-1.5 text-[12.5px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]" />
            </label>
            <label className="col-span-2 flex flex-col gap-1">
              <span className="text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]">Education</span>
              <select value={crs.education} onChange={(e) => setCrs((p) => ({ ...p, education: e.target.value as CrsInput['education'] }))}
                className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2 py-1.5 text-[12px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]">
                {EDUC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]">CLB (first lang)</span>
              <input type="number" min={4} max={10} value={crs.clb}
                onChange={(e) => setCrs((p) => ({ ...p, clb: num(e.target.value, 9) }))}
                className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2 py-1.5 text-[12.5px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]">2nd lang CLB</span>
              <input type="number" min={0} max={10} value={crs.secondClb ?? 0}
                onChange={(e) => setCrs((p) => ({ ...p, secondClb: num(e.target.value, 0) }))}
                className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2 py-1.5 text-[12.5px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]">Can. yrs</span>
              <input type="number" min={0} max={5} value={crs.canadianYears}
                onChange={(e) => setCrs((p) => ({ ...p, canadianYears: num(e.target.value, 0) }))}
                className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2 py-1.5 text-[12.5px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]">Foreign yrs</span>
              <input type="number" min={0} max={5} value={crs.foreignYears}
                onChange={(e) => setCrs((p) => ({ ...p, foreignYears: num(e.target.value, 0) }))}
                className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2 py-1.5 text-[12.5px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]" />
            </label>
          </div>

          {/* Spouse / partner factors */}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--chat-hairline)] pt-3">
            <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[var(--chat-body)]">
              <input type="checkbox" checked={!!crs.spouse}
                onChange={(e) => setCrs((p) => ({ ...p, spouse: e.target.checked ? { education: 'bachelors', clb: 8, canadianYears: 0 } : undefined }))}
                className="accent-[#592eff]" />
              Accompanying spouse / partner
            </label>
          </div>
          {crs.spouse && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="col-span-2 flex flex-col gap-1">
                <span className="text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]">Spouse education</span>
                <select value={crs.spouse.education}
                  onChange={(e) => setCrs((p) => ({ ...p, spouse: { ...(p.spouse ?? { education: 'none' as const, clb: 8, canadianYears: 0 }), education: e.target.value as 'none' | CrsInput['education'] } }))}
                  className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2 py-1.5 text-[12px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]">
                  {SPOUSE_EDUC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]">Spouse CLB</span>
                <input type="number" min={4} max={10} value={crs.spouse.clb}
                  onChange={(e) => setCrs((p) => ({ ...p, spouse: { ...(p.spouse ?? { education: 'none' as const, clb: 8, canadianYears: 0 }), clb: num(e.target.value, 8) } }))}
                  className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2 py-1.5 text-[12.5px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]">Spouse can. yrs</span>
                <input type="number" min={0} max={5} value={crs.spouse.canadianYears}
                  onChange={(e) => setCrs((p) => ({ ...p, spouse: { ...(p.spouse ?? { education: 'none' as const, clb: 8, canadianYears: 0 }), canadianYears: num(e.target.value, 0) } }))}
                  className="rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2 py-1.5 text-[12.5px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]" />
              </label>
            </div>
          )}

          {/* Additional points */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--chat-hairline)] pt-3">
            <span className="text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]">Additional points</span>
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[var(--chat-body)]">
              <input type="checkbox" checked={!!crs.pnpNomination} onChange={(e) => setCrs((p) => ({ ...p, pnpNomination: e.target.checked }))} className="accent-[#592eff]" />
              BC PNP nomination <span className="text-[10px] text-[var(--chat-text-faint)]">(+600)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[var(--chat-body)]">
              <input type="checkbox" checked={!!crs.frenchNclc7} onChange={(e) => setCrs((p) => ({ ...p, frenchNclc7: e.target.checked }))} className="accent-[#592eff]" />
              French NCLC 7+ <span className="text-[10px] text-[var(--chat-text-faint)]">(+25/50)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[var(--chat-body)]">
              Canadian study
              <select value={crs.canadianStudyYears ?? 0} onChange={(e) => setCrs((p) => ({ ...p, canadianStudyYears: Number(e.target.value) as 0 | 1 | 2 }))}
                className="rounded-[8px] border border-[var(--chat-hairline)] bg-white px-1.5 py-0.5 text-[11px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]">
                <option value={0}>none</option>
                <option value={1}>1-2 yr credential (+15)</option>
                <option value={2}>3+ yr credential (+30)</option>
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[var(--chat-body)]">
              <input type="checkbox" checked={!!crs.siblingCanada} onChange={(e) => setCrs((p) => ({ ...p, siblingCanada: e.target.checked }))} className="accent-[#592eff]" />
              Sibling in Canada <span className="text-[10px] text-[var(--chat-text-faint)]">(+15)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-[12px] text-[var(--chat-body)]">
              <input type="checkbox" checked={!!crs.certificateOfQualification} onChange={(e) => setCrs((p) => ({ ...p, certificateOfQualification: e.target.checked }))} className="accent-[#592eff]" />
              Trade certificate of qualification <span className="text-[10px] text-[var(--chat-text-faint)]">(+25/50)</span>
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="relative h-3 flex-1 overflow-hidden rounded-[200px] bg-[var(--chat-surface-strong)]">
              <div className="h-full rounded-[200px] transition-all" style={{ width: `${meterPct}%`, background: '#592eff' }} />
            </div>
            <div className="shrink-0 text-right">
              <div className="text-[22px] font-bold leading-none text-[var(--chat-body)]">{crsResult.total}</div>
              <div className="text-[10px] text-[var(--chat-text-faint)]">of 1200</div>
            </div>
          </div>
          <div className="mt-1.5 flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] text-[var(--chat-text-faint)]">
              vs cutoff
              <input type="number" value={cutoff} onChange={(e) => setCutoff(num(e.target.value, 500))}
                className="w-16 rounded-[8px] border border-[var(--chat-hairline)] bg-white px-1.5 py-0.5 text-[11px] text-[var(--chat-body)] outline-none focus:border-[var(--chat-accent)]" />
            </label>
            <span className={`rounded-[200px] px-2.5 py-1 text-[11px] font-semibold ${
              chance.tier === 'strong' ? 'bg-[rgba(16,185,129,0.12)] text-[#047857]'
              : chance.tier === 'competitive' ? 'bg-[rgba(89,46,255,0.1)] text-[var(--chat-accent)]'
              : chance.tier === 'close' ? 'bg-[rgba(138,97,20,0.12)] text-[#8a6114]'
              : 'bg-[rgba(239,68,68,0.12)] text-[#b91c1c]'}`}>
              {chance.label}
            </span>
          </div>
          <p className="mt-2 text-[10.5px] leading-[1.5] text-[var(--chat-text-faint)]">
            Age {crsResult.breakdown.age} · Education {crsResult.breakdown.education} · First lang {crsResult.breakdown.language} · 2nd lang {crsResult.breakdown.secondLanguage} ·
            Can. work {crsResult.breakdown.canadianWork} · Spouse {crsResult.breakdown.spouse} · Transferability {crsResult.breakdown.transferability} · Additional {crsResult.breakdown.additional}
          </p>
          {crsResult.notes.map((n, i) => <p key={i} className="text-[10.5px] text-[var(--chat-text-faint)]">· {n}</p>)}
        </div>

        {stats && (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-[200px] bg-[rgba(89,46,255,0.1)] px-3 py-1.5 text-[12px] font-semibold text-[var(--chat-accent)]">
              <Briefcase size={11} className="mr-1 inline" /> {stats.bcPnpInDemand} postings look BC-PNP in-demand
            </span>
            <span className="rounded-[200px] bg-[rgba(16,185,129,0.12)] px-3 py-1.5 text-[12px] font-semibold text-[#047857]">
              <ShieldCheck size={11} className="mr-1 inline" /> {stats.canadianExp} postings mention Canadian experience
            </span>
          </div>
        )}

        {/* ══ Tabs ══ */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`rounded-[200px] px-4 py-1.5 text-[12px] font-semibold transition border ${
                tab === t.key ? 'border-transparent bg-[rgba(89,46,255,0.1)] text-[var(--chat-accent)]' : 'border-[var(--chat-hairline)] bg-white text-[var(--chat-text-dim)]'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--chat-text-faint)]" /></div>
        ) : tab === 'recent' ? (
          <>
            {topPr.length > 0 && (
              <div className="mt-5">
                <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--chat-text-faint)]">Top PR-value postings right now</h3>
                <div className="flex flex-col gap-2">
                  {topPr.slice(0, 10).map((p) => (
                    <div key={p.id} className="chat-glass flex items-center justify-between gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-[13px] font-semibold text-[var(--chat-body)] hover:underline">
                          {p.title} <ExternalLink size={10} className="inline opacity-50" />
                        </a>
                        <p className="mt-0.5 text-[11px] text-[var(--chat-text-faint)]">{p.company}{p.location ? ` · ${p.location}` : ''}</p>
                      </div>
                      {typeof p.fit_score === 'number' && (
                        <span className="shrink-0 rounded-[200px] bg-[rgba(89,46,255,0.1)] px-2 py-0.5 text-[11px] font-bold text-[var(--chat-accent)]">fit {p.fit_score}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {[...latestByTopic.values()].map((r) => {
                const key = `${r.topic}|${r.fetched_at}`
                const open = expanded.has(key)
                return (
                  <div key={key} className="chat-glass flex flex-col gap-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[13.5px] font-semibold text-[var(--chat-body)]">{TOPIC_LABELS[r.topic] ?? r.title}</h3>
                      <span className="shrink-0 rounded-[200px] bg-[var(--chat-surface-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--chat-text-faint)]">as of {asOf(r.fetched_at)}</span>
                    </div>
                    <p className={`text-[12px] leading-[1.6] text-[var(--chat-text-dim)] ${open ? '' : 'line-clamp-4'}`}>
                      {open ? r.body : r.body.slice(0, 500)}{!open && r.body.length > 500 ? ' …' : ''}
                    </p>
                    <div className="mt-auto flex items-center gap-3 pt-1">
                      {r.body.length > 500 && (
                        <button onClick={() => toggle(key)} className="text-[11px] font-semibold text-[var(--chat-accent)] hover:opacity-80">{open ? 'Show less' : 'Read more'}</button>
                      )}
                      <a href={r.source_url} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1 text-[11px] text-[var(--chat-text-faint)] hover:text-[var(--chat-accent)]">source <ExternalLink size={10} /></a>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : tab === 'past' ? (
          <div className="mt-5 flex flex-col gap-2">
            {pastVersions.length === 0 ? (
              <p className="py-8 text-center text-sm italic text-[var(--chat-text-faint)]">No older versions yet — the next weekly fetch will create history here.</p>
            ) : pastVersions.map((r) => (
              <div key={`${r.topic}|${r.fetched_at}`} className="chat-glass p-3.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-[12.5px] font-semibold text-[var(--chat-body)]">{TOPIC_LABELS[r.topic] ?? r.title}</h4>
                  <span className="rounded-[200px] bg-[var(--chat-surface-strong)] px-2 py-0.5 text-[10px] font-semibold text-[var(--chat-text-faint)]">fetched {asOf(r.fetched_at)}</span>
                </div>
                <p className="mt-1 line-clamp-3 text-[11.5px] leading-[1.55] text-[var(--chat-text-faint)]">{r.body.slice(0, 400)}…</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <div className="chat-glass mb-3 flex items-center gap-2 p-3.5">
              <CalendarClock size={14} className="text-[var(--chat-accent)]" />
              <p className="text-[12px] text-[var(--chat-text-dim)]">
                Next scheduled rules refresh: <span className="font-semibold text-[var(--chat-body)]">{nextFetch.toUTCString()}</span>.
                IRCC does not publish future draw dates — "upcoming" below is what the current rules text mentions as planned or announced.
              </p>
            </div>
            {upcoming.length === 0 ? (
              <p className="py-8 text-center text-sm italic text-[var(--chat-text-faint)]">No upcoming/planned changes mentioned in the current rules text.</p>
            ) : upcoming.map(({ rule, snippet }, i) => (
              <div key={i} className="chat-glass mb-2 p-3.5">
                <h4 className="text-[12.5px] font-semibold text-[var(--chat-body)]">{TOPIC_LABELS[rule.topic] ?? rule.title}</h4>
                <p className="mt-1 text-[11.5px] leading-[1.55] text-[var(--chat-text-dim)]">…{snippet}…</p>
                <a href={rule.source_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] text-[var(--chat-text-faint)] hover:text-[var(--chat-accent)]">source <ExternalLink size={10} /></a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
