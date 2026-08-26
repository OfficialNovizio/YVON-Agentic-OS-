'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { Briefcase, Save, Loader2, Plus, Trash2, Sparkles, Linkedin, CheckCircle2, FileText, Settings2, ShieldCheck, X } from 'lucide-react'
import { AtelierBackdrop, Squiggle } from '../chat/Atelier'
import '../chat/chat.css'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — MASTER PROFILE v2 (2026-08-25)
//  Operator-only personal module. Redesign per operator feedback:
//  - No empty textboxes for pickable values — dropdowns with full option
//    lists + free-typed additions; selections show as chips with ✕ to remove.
//  - Removed: GitHub, employment status, constraints, and the Roles &
//    Narrative tab — job preference now follows the selected sectors.
//  - Canada-first defaults: country Canada, timezone America/Vancouver, visa
//    work permit, currency CAD, 50 km radius around each selected city.
//  - Target comp: multiple min/max ranges.
//  - Skills: ONE technical-skills list (legacy domain/tools merged in) plus
//    a soft-skills list — all chips. Everything still saves into the same
//    singleton row (migration 121); downstream reads keep working
//    (target_range re-derived from ranges on save; city = first selected
//    city; domain/tools values merge into programming).
// ═══════════════════════════════════════════════════════════════════════════

type Section = Record<string, unknown>

interface ProfileState {
  identity: Section
  target_roles: Section
  narrative: Section
  compensation: Section
  location: Section
  education: Section[]
  experience: Section[]
  projects: Section[]
  skills: Section
  behavioral: Section
  evaluation_prefs: Section
  weights: { technical_skills: number; experience_match: number; behavioral_fit: number; career_alignment: number }
  setup_complete: boolean
}

const EMPTY: ProfileState = {
  identity: {}, target_roles: {}, narrative: {}, compensation: {}, location: {},
  education: [], experience: [], projects: [], skills: {}, behavioral: {}, evaluation_prefs: {},
  weights: { technical_skills: 30, experience_match: 25, behavioral_fit: 15, career_alignment: 30 },
  setup_complete: false,
}

const LABEL_CLS = 'text-[11px] uppercase tracking-wide text-[var(--chat-text-faint)]'
const INPUT_CLS = 'w-full rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2.5 py-1.5 text-[13px] text-[var(--chat-body)] placeholder:text-[var(--chat-text-faint)] focus:border-[var(--chat-accent)] focus:outline-none'
const SECTION_CLS = 'text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--chat-text-faint)]'
const TAB_CLS = (active: boolean) =>
  `rounded-[200px] px-4 py-2 text-[12.5px] font-semibold transition border ` +
  (active
    ? 'border-transparent bg-[rgba(89,46,255,0.1)] text-[var(--chat-accent)]'
    : 'border-[var(--chat-hairline)] bg-white text-[var(--chat-text-dim)] hover:border-[var(--chat-text-faint)]')

// ── Dropdown option lists — "give dropdown options, I pick, chips with ✕" ──
const CITY_OPTIONS = ['Vancouver', 'Burnaby', 'Surrey', 'Richmond', 'North Vancouver', 'West Vancouver', 'Coquitlam', 'Port Coquitlam', 'Port Moody', 'New Westminster', 'Delta', 'Langley', 'Abbotsford', 'Mission', 'Maple Ridge', 'Chilliwack', 'Squamish', 'Whistler', 'Kelowna', 'Victoria', 'Nanaimo', 'Kamloops', 'Prince George', 'Calgary', 'Edmonton', 'Toronto', 'Ottawa', 'Montreal']
const TIMEZONE_OPTIONS = ['America/Vancouver', 'America/Edmonton', 'America/Regina', 'America/Winnipeg', 'America/Toronto', 'America/Montreal', 'America/Halifax', 'America/St_Johns']
const VISA_OPTIONS = ['Work permit (open)', 'Work permit (employer-specific)', 'PGWP (post-grad)', 'Canadian citizen', 'Permanent resident', 'Study permit', 'Visitor — no work rights', 'Other']
const CURRENCY_OPTIONS = ['CAD', 'USD', 'EUR', 'GBP', 'INR', 'AED']
const COUNTRY_OPTIONS = ['Canada', 'USA', 'UK', 'Germany', 'India', 'UAE', 'Australia']
const FLEX_OPTIONS = ['Remote', 'Hybrid', 'On-site', 'Remote-first', 'Flexible hours', '4-day week', 'Travel required', 'Occasional office']
const LANGUAGE_OPTIONS = ['English', 'French', 'Spanish', 'Hindi', 'Punjabi', 'Mandarin', 'Cantonese', 'German', 'Arabic']
const PROGRAMMING_OPTIONS = ['Python', 'TypeScript', 'JavaScript', 'Java', 'Go', 'Rust', 'C++', 'C#', 'SQL', 'React', 'Node.js', 'Next.js', 'Swift', 'Kotlin', 'Ruby', 'GraphQL', 'Bash', 'PyTorch', 'TensorFlow', 'scikit-learn', 'LangChain', 'LLM fine-tuning', 'RAG', 'Transformers', 'MLOps', 'Spark', 'Pandas', 'NumPy', 'OpenAI API', 'Hugging Face', 'Computer Vision', 'NLP']
const DOMAIN_OPTIONS = ['AI / ML', 'Full-stack web', 'DevOps / Infra', 'Data engineering', 'Cloud (AWS)', 'Cloud (GCP)', 'Cloud (Azure)', 'Cybersecurity', 'Mobile (iOS)', 'Mobile (Android)', 'Embedded', 'Robotics', 'Aerospace', 'Product analytics', 'Growth / GTM']
const TOOLS_OPTIONS = ['Git / GitHub', 'Docker', 'Kubernetes', 'Terraform', 'PostgreSQL', 'Supabase', 'MongoDB', 'Redis', 'Figma', 'Jira', 'Linear', 'Datadog', 'Grafana', 'CI/CD', 'VS Code', 'Notion']
const TECH_OPTIONS = [...new Set([...PROGRAMMING_OPTIONS, ...DOMAIN_OPTIONS, ...TOOLS_OPTIONS])]
const SOFT_SKILLS_OPTIONS = ['Communication', 'Teamwork', 'Leadership', 'Problem-solving', 'Adaptability', 'Time management', 'Empathy', 'Critical thinking', 'Creativity', 'Collaboration', 'Attention to detail', 'Initiative', 'Conflict resolution', 'Mentoring', 'Public speaking', 'Written communication', 'Presentation', 'Negotiation']
const PROFILE_TYPE_OPTIONS = ['Self-assessed', 'DISC — Dominance', 'DISC — Influence', 'DISC — Steadiness', 'DISC — Conscientiousness', 'MBTI — INTJ', 'MBTI — INTP', 'MBTI — ENTJ', 'MBTI — ENTP', 'MBTI — INFJ', 'MBTI — ENFJ', 'StrengthsFinder — Strategic', 'StrengthsFinder — Achiever', 'StrengthsFinder — Learner', 'StrengthsFinder — Relator', 'StrengthsFinder — Analytical']
const MANAGEMENT_OPTIONS = ['Autonomy-first', 'Collaborative', 'Structured / process', 'Coaching / mentorship', 'Hands-off', 'Directive', 'Agile / scrum', 'Remote-managed']
const BEHAVIOR_OPTIONS = ['Strategic', 'Achiever', 'Learner', 'Relator', 'Analytical', 'Creative', 'Organized', 'Empathetic', 'Decisive', 'Curious', 'Resilient', 'Detail-oriented', 'Fast-moving', 'Calm under pressure']
const GROWTH_OPTIONS = ['Public speaking', 'Delegation', 'Saying no', 'Deep focus', 'Networking', 'Feedback receptiveness', 'Time management', 'Leadership']
const FIT_KEYWORD_OPTIONS = ['autonomy', 'async-first', 'small team', 'high trust', 'impact', 'ownership', 'learning budget', 'growth', 'transparent', 'product-led']
const FRICTION_KEYWORD_OPTIONS = ['high-pressure', 'always-on', 'rigid hierarchy', 'micromanaged', 'unpaid overtime', 'cubicle', 'legacy code']
const DEALBREAKER_OPTIONS = ['On-call', 'Relocation required', 'Night shifts', '5-day office mandate', 'No remote', 'Below target range', 'No visa support', 'Short-term contract', 'No learning budget']
const CAREER_GOAL_OPTIONS = ['Senior / Staff track', 'People management', 'AI / ML specialization', 'PR (BC PNP) pathway', 'Startup environment', 'Big-tech stability', 'C2C / consulting']
const TASK_OPTIONS = ['Deep technical work', 'Designing systems', 'Debugging', 'Code review', 'Pairing', 'Customer calls', 'Roadmap planning', 'Recruiting / interviews', 'Writing docs', 'Data analysis', 'Meetings', 'On-call rotations']
const CULTURE_OPTIONS = ['Small flat teams', 'Async-first', 'Remote-friendly', 'Strong onboarding', 'Diversity', 'Fast release cycles', 'Open source', 'Wellness focus']
const DEGREE_OPTIONS = ["Bachelor's", "Master's", 'PhD', 'Diploma', 'Certificate', 'Bootcamp', 'Other']
const EMPLOYMENT_OPTIONS = ['Full-time', 'Contract', 'Co-op', 'Internship', 'Part-time', 'Freelance']

// ── Completeness meter — honest: tracks the fields the form actually offers ─
const METER_GROUPS: { key: keyof ProfileState; label: string; fields: string[] }[] = [
  { key: 'identity', label: 'Identity', fields: ['full_name', 'email', 'phone', 'location', 'linkedin', 'portfolio_url'] },
  { key: 'compensation', label: 'Compensation', fields: ['ranges'] },
  { key: 'location', label: 'Location', fields: ['country', 'cities', 'visa_status', 'authorized_in'] },
  { key: 'skills', label: 'Skills', fields: ['programming', 'soft'] },
  { key: 'behavioral', label: 'Behavioral', fields: ['profile_type', 'summary'] },
  { key: 'evaluation_prefs', label: 'Evaluation', fields: ['deal_breakers', 'career_goals', 'culture_screen_require'] },
]

function isFilled(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'string') return value.trim() !== ''
  if (typeof value === 'number') return true
  if (typeof value === 'boolean') return value
  return value != null && Object.keys(value).length > 0
}

function groupStats(profile: ProfileState) {
  let filled = 0
  let total = 0
  const per = METER_GROUPS.map((g) => {
    const section = profile[g.key] as Section
    let groupFilled = 0
    for (const f of g.fields) {
      if (isFilled(section[f])) groupFilled += 1
    }
    filled += groupFilled
    total += g.fields.length
    return { label: g.label, filled: groupFilled, total: g.fields.length }
  })
  const extra: [keyof ProfileState, string][] = [
    ['education', 'Education'],
    ['experience', 'Experience'],
    ['projects', 'Projects'],
  ]
  for (const [key, label] of extra) {
    const arr = profile[key] as unknown[]
    total += 1
    const f = arr.length > 0 ? 1 : 0
    filled += f
    per.push({ label, filled: f, total: 1 })
  }
  return { filled, total, per }
}

// ── field primitives ────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, textarea, type, suffix }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean; type?: string; suffix?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={LABEL_CLS}>{label}</span>
      <div className="relative">
        <input type={type ?? 'text'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className={`${INPUT_CLS} ${suffix ? 'pr-16' : ''}`} />
        {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--chat-text-faint)]">{suffix}</span>}
      </div>
    </label>
  )
}

function SelectField({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={LABEL_CLS}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT_CLS} appearance-none`}>
        {value === '' && <option value="">{placeholder ?? 'Select…'}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}

// Dropdown suggestions + free typing + chips with ✕ — the core picker.
function ChipSelect({ label, options, value, onChange, placeholder }: {
  label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const chosen = value ?? []

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase()
    if (!q) return options.filter((o) => !chosen.includes(o)).slice(0, 8)
    return options.filter((o) => o.toLowerCase().includes(q) && !chosen.includes(o)).slice(0, 8)
  }, [options, text, chosen])

  const add = (v: string) => {
    const clean = v.trim()
    if (!clean || chosen.includes(clean)) return
    onChange([...chosen, clean])
    setText('')
  }

  const remove = (v: string) => onChange(chosen.filter((x) => x !== v))

  return (
    <label className="flex flex-col gap-1">
      <span className={LABEL_CLS}>{label}</span>
      <div className="relative">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(text) }
            if (e.key === 'Backspace' && text === '' && chosen.length > 0) remove(chosen[chosen.length - 1])
          }}
          placeholder={placeholder ?? 'Type or pick from the list…'}
          className={INPUT_CLS}
        />
        {open && filtered.length > 0 && (
          <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded-[10px] border border-[var(--chat-hairline)] bg-white py-1 shadow-lg">
            {filtered.map((o) => (
              <button key={o} type="button" onMouseDown={(e) => { e.preventDefault(); add(o) }}
                className="block w-full px-2.5 py-1.5 text-left text-[12.5px] text-[var(--chat-body)] hover:bg-[var(--chat-surface-strong)]">
                {o}
              </button>
            ))}
          </div>
        )}
      </div>
      {chosen.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {chosen.map((v) => (
            <span key={v} className="flex items-center gap-1 rounded-[200px] bg-[rgba(89,46,255,0.1)] px-2 py-0.5 text-[11.5px] font-medium text-[var(--chat-accent)]">
              {v}
              <button type="button" onClick={() => remove(v)} aria-label={`Remove ${v}`} className="text-[var(--chat-text-faint)] hover:text-[#b91c1c]">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </label>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 py-1">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="accent-[#592eff]" />
      <span className="text-[13px] text-[var(--chat-body)]">{label}</span>
    </label>
  )
}

function Repeatable<T extends Record<string, unknown>>({ label, items, empty, fields, onChange, hint }: {
  label: string
  items: T[]
  empty: T
  fields: { key: keyof T; label: string; textarea?: boolean; options?: string[] }[]
  onChange: (items: T[]) => void
  hint?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={LABEL_CLS}>{label}</span>
        <button onClick={() => onChange([...items, { ...empty }])} className="flex items-center gap-1 text-[11px] text-[var(--chat-text-dim)] hover:text-[var(--chat-accent)]">
          <Plus size={12} /> Add
        </button>
      </div>
      {hint && <p className="-mt-1 text-[11.5px] text-[var(--chat-text-faint)]">{hint}</p>}
      {items.length === 0 && <p className="text-[12px] italic text-[var(--chat-text-faint)]">Nothing added yet.</p>}
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-[12px] border border-[var(--chat-hairline)] bg-white p-2.5">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {fields.map((f) => (
              f.options ? (
                <SelectField key={String(f.key)} label={f.label} options={f.options} value={String(item[f.key] ?? '')}
                  onChange={(v) => {
                    const next = [...items]
                    next[i] = { ...next[i], [f.key]: v }
                    onChange(next)
                  }} />
              ) : (
                <Field key={String(f.key)} label={f.label} textarea={f.textarea} value={String(item[f.key] ?? '')}
                  onChange={(v) => {
                    const next = [...items]
                    next[i] = { ...next[i], [f.key]: v }
                    onChange(next)
                  }} />
              )
            ))}
          </div>
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="self-start flex items-center gap-1 text-[11px] text-[#b91c1c]/80 hover:text-[#b91c1c]">
            <Trash2 size={12} /> Remove
          </button>
        </div>
      ))}
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'identity' | 'experience' | 'skills' | 'eval'
const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'identity', label: 'Identity & Location' },
  { key: 'experience', label: 'Experience' },
  { key: 'skills', label: 'Skills & Behavior' },
  { key: 'eval', label: 'Evaluation & Weights' },
]

export default function JobHuntPage() {
  const [profile, setProfile] = useState<ProfileState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [tab, setTab] = useState<Tab>('overview')

  useEffect(() => {
    fetch('/api/job-hunt/profile')
      .then((r) => r.json())
      .then((data: { profile?: Record<string, unknown> }) => {
        const fetched = data.profile
        if (!fetched) return
        setProfile((prev) => {
          const next: ProfileState = {
            ...prev,
            ...Object.fromEntries(Object.entries(fetched).filter(([k]) => k in prev)),
          }
          // Canada-first defaults (only when unset).
          const loc = next.location as Section
          if (!loc || Object.keys(loc).length === 0) {
            next.location = { country: 'Canada', timezone: 'America/Vancouver', visa_status: 'Work permit (open)', radius_km: 50 }
          } else {
            if (!loc.country) loc.country = 'Canada'
            if (!loc.timezone) loc.timezone = 'America/Vancouver'
            if (!loc.visa_status) loc.visa_status = 'Work permit (open)'
            if (typeof loc.radius_km !== 'number') loc.radius_km = 50
            if (!Array.isArray(loc.cities) && typeof loc.city === 'string' && loc.city) loc.cities = [loc.city]
          }
          const comp = next.compensation as Section
          if (!comp.currency) comp.currency = 'CAD'
          if (!Array.isArray(comp.ranges) || (comp.ranges as unknown[]).length === 0) {
            comp.ranges = [{ min: '', max: '' }]
          }
          // One technical-skills list: merge any legacy domain/tools values in.
          const sk = next.skills as Section
          if (sk) {
            const merged = [...(sk.programming as string[] | undefined) ?? [], ...(sk.domain as string[] | undefined) ?? [], ...(sk.tools as string[] | undefined) ?? []]
            sk.programming = [...new Set(merged)]
          }
          return next
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = useCallback(<K extends keyof ProfileState>(key: K, value: ProfileState[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }))
  }, [])

  const setField = useCallback((section: keyof ProfileState, field: string, value: unknown) => {
    setProfile((prev) => ({ ...prev, [section]: { ...(prev[section] as Section), [field]: value } }))
  }, [])

  const save = useCallback(async () => {
    setSaving(true); setSaveMsg('')
    try {
      const payload = JSON.parse(JSON.stringify(profile)) as ProfileState
      // Removed fields are dropped, never written back.
      delete payload.identity.github
      delete payload.identity.employment_status
      delete payload.identity.constraints
      // Re-derive the legacy display string from the ranges rows.
      const ranges = payload.compensation.ranges as { min?: string; max?: string }[] | undefined
      if (Array.isArray(ranges) && ranges.length > 0) {
        payload.compensation.target_range = ranges
          .filter((r) => (r.min ?? '').trim() !== '' || (r.max ?? '').trim() !== '')
          .map((r) => `${r.min ? `$${r.min}K` : ''}–${r.max ? `$${r.max}K` : ''} ${payload.compensation.currency ?? 'CAD'}`.replace(/^–/, 'up to ').replace(/–$/, 'from '))
          .join(' or ')
      }
      // city = first selected city (downstream reads location.city).
      const cities = payload.location.cities as string[] | undefined
      if (Array.isArray(cities)) payload.location.city = cities[0] ?? ''

      const res = await fetch('/api/job-hunt/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setSaveMsg(res.ok ? 'Saved ✓' : 'Error saving')
    } catch { setSaveMsg('Network error') }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }, [profile])

  const meter = useMemo(() => groupStats(profile), [profile])
  const pct = meter.total === 0 ? 0 : Math.round((meter.filled / meter.total) * 100)

  const [sectors, setSectors] = useState<Record<string, { queries: string[]; enabled: boolean }> | null>(null)

  useEffect(() => {
    fetch('/api/job-hunt/sync-config')
      .then((r) => r.json())
      .then((d) => { if (d.config) setSectors(d.config) })
      .catch(() => {})
  }, [])

  if (loading) {
    return (
      <div className="chat-shell relative flex min-h-screen items-center justify-center overflow-hidden">
        <AtelierBackdrop />
        <Loader2 size={20} className="relative z-10 animate-spin text-[var(--chat-text-faint)]" />
      </div>
    )
  }

  const identity = profile.identity, compensation = profile.compensation
  const location = profile.location, skills = profile.skills, behavioral = profile.behavioral
  const evalPrefs = profile.evaluation_prefs

  return (
    <div className="chat-shell relative min-h-screen overflow-hidden">
      <AtelierBackdrop />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="adora-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--chat-text)] md:text-[34px]">
              <Squiggle>Master Profile</Squiggle>
            </h1>
            <p className="mt-2 max-w-[640px] text-[13.5px] leading-[1.55] text-[var(--chat-text-dim)]">
              Private to you. Drives discovery, fit scoring, and tailored materials — it never auto-applies.
            </p>
          </div>
          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 rounded-[10px] bg-[#592eff] px-4 py-2 text-xs font-semibold text-white hover:bg-[#4520cc] disabled:opacity-50">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={TAB_CLS(tab === t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {saveMsg && <p className={`mb-4 mt-3 text-xs ${saveMsg.startsWith('Saved') ? 'text-[#047857]' : 'text-[#b91c1c]'}`}>{saveMsg}</p>}

        {/* ══ OVERVIEW ══ */}
        {tab === 'overview' && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="chat-glass flex flex-col gap-4 p-5 lg:col-span-2">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] text-[22px] font-bold"
                  style={{
                    background: pct >= 80 ? 'rgba(16,185,129,0.14)' : pct >= 40 ? 'rgba(89,46,255,0.1)' : 'rgba(138,97,20,0.12)',
                    color: pct >= 80 ? '#047857' : pct >= 40 ? 'var(--chat-accent)' : '#8a6114',
                  }}
                >
                  {pct}%
                </div>
                <div className="flex-1">
                  <h2 className="text-[15px] font-semibold text-[var(--chat-body)]">Profile completeness</h2>
                  <p className="mt-0.5 text-[12px] text-[var(--chat-text-dim)]">
                    {meter.filled} of {meter.total} tracked fields filled. Fit scoring reads these — the more complete,
                    the sharper the scores.
                  </p>
                </div>
                {profile.setup_complete && (
                  <span className="flex items-center gap-1 rounded-[200px] bg-[rgba(16,185,129,0.12)] px-2.5 py-1 text-[11px] font-semibold text-[#047857]">
                    <CheckCircle2 size={12} /> Setup complete
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                {meter.per.map((g) => (
                  <div key={g.label} className="flex items-center gap-2">
                    <span className="w-28 shrink-0 text-[11px] text-[var(--chat-text-dim)]">{g.label}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-[200px] bg-[var(--chat-surface-strong)]">
                      <div
                        className="h-full rounded-[200px] transition-all"
                        style={{ width: `${(g.filled / g.total) * 100}%`, background: g.filled === g.total ? '#047857' : 'var(--chat-accent)' }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right text-[10.5px] text-[var(--chat-text-faint)]">
                      {g.filled}/{g.total}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[var(--chat-hairline)] pt-3">
                <Checkbox label="Mark profile setup complete" checked={profile.setup_complete} onChange={(v) => set('setup_complete', v)} />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/job-hunt/sectors" className="chat-glass flex items-start gap-3 p-4 transition hover:border-[var(--chat-accent)]">
                <Settings2 size={16} className="mt-0.5 shrink-0 text-[var(--chat-accent)]" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[var(--chat-body)]">Sector Explorer</p>
                  <p className="mt-0.5 text-[11.5px] leading-[1.45] text-[var(--chat-text-faint)]">
                    Select your sectors with demand, pay, and PR value — one place drives sync, resumes, and PR tagging.
                    {sectors && <> Currently {Object.values(sectors).filter((s) => s.enabled).length} active.</>}
                  </p>
                </div>
              </Link>
              <Link href="/job-hunt/resume" className="chat-glass flex items-start gap-3 p-4 transition hover:border-[var(--chat-accent)]">
                <FileText size={16} className="mt-0.5 shrink-0 text-[var(--chat-accent)]" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[var(--chat-body)]">Upload your resume</p>
                  <p className="mt-0.5 text-[11.5px] leading-[1.45] text-[var(--chat-text-faint)]">
                    AI reads it, scores it, and fills most of this profile for you — you just review and keep.
                  </p>
                </div>
              </Link>
              <Link href="/job-hunt/linkedin" className="chat-glass flex items-start gap-3 p-4 transition hover:border-[var(--chat-accent)]">
                <Linkedin size={16} className="mt-0.5 shrink-0 text-[var(--chat-accent)]" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[var(--chat-body)]">Import from LinkedIn</p>
                  <p className="mt-0.5 text-[11.5px] leading-[1.45] text-[var(--chat-text-faint)]">
                    Upload your own data export — no account risk, no scraping.
                  </p>
                </div>
              </Link>
              <Link href="/job-hunt/pr" className="chat-glass flex items-start gap-3 p-4 transition hover:border-[var(--chat-accent)]">
                <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--chat-accent)]" />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[var(--chat-body)]">PR Insights</p>
                  <p className="mt-0.5 text-[11.5px] leading-[1.45] text-[var(--chat-text-faint)]">
                    IRCC &amp; BC PNP rules (weekly fetch) + the postings with the best PR value.
                  </p>
                </div>
              </Link>
              <div className="chat-glass p-4">
                <p className="flex items-center gap-1.5 text-[12px] font-semibold text-[var(--chat-body)]">
                  <Briefcase size={13} className="text-[var(--chat-accent)]" /> Quick facts
                </p>
                <ul className="mt-2 flex flex-col gap-1.5 text-[11.5px] text-[var(--chat-text-dim)]">
                  <li>{sectors ? Object.values(sectors).filter((s) => s.enabled).length : 0} active sector(s)</li>
                  <li>{(profile.experience as unknown[]).length} experience entr{(profile.experience as unknown[]).length === 1 ? 'y' : 'ies'}</li>
                  <li>{(skills.programming as string[] | undefined)?.length ?? 0} technical skills</li>
                  <li>{(skills.soft as string[] | undefined)?.length ?? 0} soft skills</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ══ IDENTITY & LOCATION ══ */}
        {tab === 'identity' && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="chat-glass flex flex-col gap-3 p-4">
              <div className="flex items-center gap-2"><Briefcase size={15} className="text-[var(--chat-accent)]" /><h3 className="text-sm font-semibold text-[var(--chat-body)]">Identity</h3></div>
              <div className="grid grid-cols-2 gap-2">
                <Field label="Full name" value={String(identity.full_name ?? '')} onChange={(v) => setField('identity', 'full_name', v)} />
                <Field label="Email" value={String(identity.email ?? '')} onChange={(v) => setField('identity', 'email', v)} />
                <Field label="Phone" value={String(identity.phone ?? '')} onChange={(v) => setField('identity', 'phone', v)} />
                <Field label="Current city" value={String(identity.location ?? '')} onChange={(v) => setField('identity', 'location', v)} placeholder="Vancouver" />
                <Field label="LinkedIn" value={String(identity.linkedin ?? '')} onChange={(v) => setField('identity', 'linkedin', v)} placeholder="linkedin.com/in/…" />
                <Field label="Portfolio URL" value={String(identity.portfolio_url ?? '')} onChange={(v) => setField('identity', 'portfolio_url', v)} />
              </div>
              <ChipSelect label="Languages" options={LANGUAGE_OPTIONS} value={(identity.languages as string[]) ?? []}
                onChange={(v) => setField('identity', 'languages', v)} placeholder="English" />
            </div>

            <div className="chat-glass flex flex-col gap-3 p-4">
              <h3 className={SECTION_CLS}>Compensation &amp; Location</h3>
              <Repeatable label="Target comp ranges" items={(compensation.ranges as Section[]) ?? []}
                empty={{ min: '', max: '' }}
                fields={[{ key: 'min', label: 'Min (K)' }, { key: 'max', label: 'Max (K)' }]}
                hint="Add as many ranges as you like — e.g. one for Canada, one for remote-US roles."
                onChange={(v) => setField('compensation', 'ranges', v)} />
              <div className="grid grid-cols-2 gap-2">
                <SelectField label="Currency" value={String(compensation.currency ?? 'CAD')} options={CURRENCY_OPTIONS}
                  onChange={(v) => setField('compensation', 'currency', v)} />
                <Field label="Minimum (walk-away)" value={String(compensation.minimum ?? '')} onChange={(v) => setField('compensation', 'minimum', v)} placeholder="120" suffix="K" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SelectField label="Country" value={String(location.country ?? 'Canada')} options={COUNTRY_OPTIONS}
                  onChange={(v) => setField('location', 'country', v)} />
                <SelectField label="Timezone" value={String(location.timezone ?? 'America/Vancouver')} options={TIMEZONE_OPTIONS}
                  onChange={(v) => setField('location', 'timezone', v)} />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <ChipSelect label="Target cities (pick several)" options={CITY_OPTIONS} value={(location.cities as string[]) ?? []}
                    onChange={(v) => setField('location', 'cities', v)} placeholder="Vancouver" />
                </div>
                <div className="w-36">
                  <Field label="Search radius" type="number" suffix="km"
                    value={String(location.radius_km ?? 50)}
                    onChange={(v) => setField('location', 'radius_km', Number(v) || 0)} />
                </div>
              </div>
              <p className="-mt-1 text-[11.5px] text-[var(--chat-text-faint)]">The radius applies to each selected city — postings within 50 km of any of them count.</p>
              <SelectField label="Visa status" value={String(location.visa_status ?? 'Work permit (open)')} options={VISA_OPTIONS}
                onChange={(v) => setField('location', 'visa_status', v)} />
              <ChipSelect label="Location flexibility" options={FLEX_OPTIONS} value={(compensation.location_flexibility as string[]) ?? []}
                onChange={(v) => setField('compensation', 'location_flexibility', v)} placeholder="Pick all that work" />
              <ChipSelect label="Authorized to work in" options={COUNTRY_OPTIONS} value={(location.authorized_in as string[]) ?? []}
                onChange={(v) => setField('location', 'authorized_in', v)} />
              <Checkbox label="Need visa sponsorship outside those countries (hard-blocks 'no sponsorship' postings)" checked={!!location.needs_sponsorship} onChange={(v) => setField('location', 'needs_sponsorship', v)} />
            </div>
          </div>
        )}

        {/* ══ EXPERIENCE ══ */}
        {tab === 'experience' && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="chat-glass flex flex-col gap-3 p-4 lg:col-span-2">
              <h3 className={SECTION_CLS}>Professional Experience</h3>
              <Repeatable label="Roles" items={profile.experience} empty={{ title: '', company: '', employment_type: '', start: '', end: '', location: '', bullets: '' }}
                fields={[
                  { key: 'title', label: 'Title' }, { key: 'company', label: 'Company' },
                  { key: 'employment_type', label: 'Type', options: EMPLOYMENT_OPTIONS },
                  { key: 'start', label: 'Start' }, { key: 'end', label: 'End' }, { key: 'location', label: 'Location' },
                  { key: 'bullets', label: 'Achievements (one per line)', textarea: true },
                ]}
                onChange={(v) => set('experience', v)} />
            </div>
            <div className="chat-glass flex flex-col gap-3 p-4">
              <h3 className={SECTION_CLS}>Education</h3>
              <Repeatable label="Degrees" items={profile.education} empty={{ degree: '', period: '', institution: '', topics: '' }}
                fields={[
                  { key: 'degree', label: 'Degree', options: DEGREE_OPTIONS },
                  { key: 'period', label: 'Period' }, { key: 'institution', label: 'Institution' }, { key: 'topics', label: 'Key topics' },
                ]}
                onChange={(v) => set('education', v)} />
            </div>
            <div className="chat-glass flex flex-col gap-3 p-4">
              <h3 className={SECTION_CLS}>Independent Projects</h3>
              <Repeatable label="Projects" items={profile.projects} empty={{ name: '', description: '', url: '' }}
                fields={[{ key: 'name', label: 'Name' }, { key: 'url', label: 'URL' }, { key: 'description', label: 'Description', textarea: true }]}
                onChange={(v) => set('projects', v)} />
            </div>
          </div>
        )}

        {/* ══ SKILLS & BEHAVIOR ══ */}
        {tab === 'skills' && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="chat-glass flex flex-col gap-3 p-4">
              <h3 className={SECTION_CLS}>Skills</h3>
              <p className="-mt-1 text-[12px] text-[var(--chat-text-faint)]">One list for all technical skills — pick from the dropdown, selections show below, ✕ removes them. Type anything not listed.</p>
              <ChipSelect label="Technical skills" options={TECH_OPTIONS} value={(skills.programming as string[]) ?? []}
                onChange={(v) => setField('skills', 'programming', v)} placeholder="Python, PyTorch, Docker, …" />
              <ChipSelect label="Soft skills" options={SOFT_SKILLS_OPTIONS} value={(skills.soft as string[]) ?? []}
                onChange={(v) => setField('skills', 'soft', v)} placeholder="Communication, Leadership, …" />
            </div>

            <div className="chat-glass flex flex-col gap-3 p-4">
              <h3 className={SECTION_CLS}>Behavioral Profile</h3>
              <p className="-mt-1 text-[12px] text-[var(--chat-text-faint)]">From a PI/DISC/MBTI/StrengthsFinder result, or your own self-assessment. Used to flag culture-fit friction before you apply, not to filter automatically.</p>
              <div className="grid grid-cols-2 gap-2">
                <SelectField label="Profile type" value={String(behavioral.profile_type ?? '')} options={PROFILE_TYPE_OPTIONS}
                  onChange={(v) => setField('behavioral', 'profile_type', v)} />
                <SelectField label="Management style that works" value={String(behavioral.management_style ?? '')} options={MANAGEMENT_OPTIONS}
                  onChange={(v) => setField('behavioral', 'management_style', v)} />
              </div>
              <Field label="Summary" textarea value={String(behavioral.summary ?? '')} onChange={(v) => setField('behavioral', 'summary', v)} />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <ChipSelect label="Strongest behaviors" options={BEHAVIOR_OPTIONS} value={(behavioral.strongest_behaviors as string[]) ?? []}
                  onChange={(v) => setField('behavioral', 'strongest_behaviors', v)} />
                <ChipSelect label="Growth areas" options={GROWTH_OPTIONS} value={(behavioral.growth_areas as string[]) ?? []}
                  onChange={(v) => setField('behavioral', 'growth_areas', v)} />
                <ChipSelect label="Fit keywords (in a JD = good sign)" options={FIT_KEYWORD_OPTIONS} value={(behavioral.fit_keywords as string[]) ?? []}
                  onChange={(v) => setField('behavioral', 'fit_keywords', v)} />
                <ChipSelect label="Friction keywords (flag, don't auto-reject)" options={FRICTION_KEYWORD_OPTIONS} value={(behavioral.friction_keywords as string[]) ?? []}
                  onChange={(v) => setField('behavioral', 'friction_keywords', v)} />
              </div>
            </div>
          </div>
        )}

        {/* ══ EVALUATION & WEIGHTS ══ */}
        {tab === 'eval' && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="chat-glass flex flex-col gap-3 p-4">
              <h3 className={SECTION_CLS}>Evaluation Preferences</h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <ChipSelect label="Deal-breakers (hard reject)" options={DEALBREAKER_OPTIONS} value={(evalPrefs.deal_breakers as string[]) ?? []}
                  onChange={(v) => setField('evaluation_prefs', 'deal_breakers', v)} />
                <ChipSelect label="Career goals" options={CAREER_GOAL_OPTIONS} value={(evalPrefs.career_goals as string[]) ?? []}
                  onChange={(v) => setField('evaluation_prefs', 'career_goals', v)} />
                <ChipSelect label="Energizing tasks" options={TASK_OPTIONS} value={(evalPrefs.energizing_tasks as string[]) ?? []}
                  onChange={(v) => setField('evaluation_prefs', 'energizing_tasks', v)} />
                <ChipSelect label="Draining tasks" options={TASK_OPTIONS} value={(evalPrefs.draining_tasks as string[]) ?? []}
                  onChange={(v) => setField('evaluation_prefs', 'draining_tasks', v)} />
              </div>
              <ChipSelect label="Culture screen — what you actively look for" options={CULTURE_OPTIONS} value={(evalPrefs.culture_screen_require as string[]) ?? []}
                onChange={(v) => setField('evaluation_prefs', 'culture_screen_require', v)} />
              <Checkbox label="Cap culture fit score if a posting shows no evidence of these" checked={!!evalPrefs.deprioritize_if_absent} onChange={(v) => setField('evaluation_prefs', 'deprioritize_if_absent', v)} />
            </div>

            <div className="chat-glass flex flex-col gap-3 p-4">
              <h3 className={SECTION_CLS}>Fit Scoring Weights</h3>
              <p className="-mt-1 text-[12px] text-[var(--chat-text-faint)]">
                Defaults pulled from ai-job-search&apos;s evaluation framework verbatim (Technical 30% / Experience 25% / Behavioral 15% / Career 30% — location is separately pass/fail, not weighted). Adjust if your priorities differ. These drive the scores on Discover.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {([
                  ['technical_skills', 'Technical Skills'],
                  ['experience_match', 'Experience Match'],
                  ['behavioral_fit', 'Behavioral Fit'],
                  ['career_alignment', 'Career Alignment'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="flex flex-col gap-1">
                    <span className={LABEL_CLS}>{label} %</span>
                    <input type="number" min={0} max={100} value={profile.weights[key]}
                      onChange={(e) => set('weights', { ...profile.weights, [key]: Number(e.target.value) || 0 })}
                      className={INPUT_CLS} />
                  </label>
                ))}
              </div>
              <p className="flex items-center gap-1.5 text-[11.5px] text-[var(--chat-text-faint)]">
                <Sparkles size={12} className="text-[var(--chat-accent)]" /> Deal-breakers and fit/friction keywords are used by the scorer on the Discover page.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
