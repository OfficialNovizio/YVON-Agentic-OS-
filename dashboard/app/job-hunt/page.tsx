'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { PageHeader, Card, SectionLabel } from '@/components/ui'
import { Briefcase, Save, Loader2, Plus, Trash2, Sparkles } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — MASTER PROFILE (2026-08-15)
// ═══════════════════════════════════════════════════════════════════════════
// Operator-only personal module — not a Teams/ agent-fleet feature. Field set
// is a direct adaptation of two real, MIT-licensed open-source job-search
// systems (pulled and modified per operator instruction, not designed from
// scratch): santifer/career-ops (config/profile.example.yml) for
// identity/target_roles/narrative/compensation/location, and
// MadsLorentzen/ai-job-search (job-application-assistant skill files) for
// education/experience/skills/behavioral/evaluation weights. See
// migrations/121_job_hunt_profile.sql for the section-by-section source map.
//
// This is the first of several Job Hunt artifacts (discovery, tailoring,
// application queue, tracker come next) — everything downstream reads this
// profile as its single source of truth for keywords and fit scoring.

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

// ── small field primitives ──────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-on-surface-variant/70">{label}</span>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-on-surface placeholder:text-on-surface-variant/40 focus:border-white/25 focus:outline-none resize-y" />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
          className="w-full rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-on-surface placeholder:text-on-surface-variant/40 focus:border-white/25 focus:outline-none" />
      )}
    </label>
  )
}

function ListField({ label, value, onChange, placeholder }: {
  label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  return (
    <Field label={`${label} (comma-separated)`} value={(value ?? []).join(', ')}
      onChange={(v) => onChange(v.split(',').map((s) => s.trim()).filter(Boolean))} placeholder={placeholder} />
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 py-1 cursor-pointer">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} className="accent-current" style={{ color: 'var(--ws-accent)' }} />
      <span className="text-[13px] text-on-surface">{label}</span>
    </label>
  )
}

function Repeatable<T extends Record<string, unknown>>({ label, items, empty, fields, onChange }: {
  label: string
  items: T[]
  empty: T
  fields: { key: keyof T; label: string; textarea?: boolean }[]
  onChange: (items: T[]) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-on-surface-variant/70">{label}</span>
        <button onClick={() => onChange([...items, { ...empty }])} className="flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-surface">
          <Plus size={12} /> Add
        </button>
      </div>
      {items.length === 0 && <p className="text-[12px] text-on-surface-variant/50 italic">Nothing added yet.</p>}
      {items.map((item, i) => (
        <div key={i} className="rounded-md border border-white/10 bg-white/[0.02] p-2.5 flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {fields.map((f) => (
              <Field key={String(f.key)} label={f.label} textarea={f.textarea}
                value={String(item[f.key] ?? '')}
                onChange={(v) => {
                  const next = [...items]
                  next[i] = { ...next[i], [f.key]: v }
                  onChange(next)
                }} />
            ))}
          </div>
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="self-start flex items-center gap-1 text-[11px] text-red-400/70 hover:text-red-400">
            <Trash2 size={12} /> Remove
          </button>
        </div>
      ))}
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function JobHuntPage() {
  const [profile, setProfile] = useState<ProfileState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  useEffect(() => {
    fetch('/api/job-hunt/profile')
      .then((r) => r.json())
      .then((data: { profile?: Record<string, unknown> }) => {
        const fetched = data.profile
        if (!fetched) return
        setProfile((prev) => ({
          ...prev,
          ...Object.fromEntries(Object.entries(fetched).filter(([k]) => k in prev)),
        }))
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
      const res = await fetch('/api/job-hunt/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      setSaveMsg(res.ok ? 'Saved ✓' : 'Error saving')
    } catch { setSaveMsg('Network error') }
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }, [profile])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 size={20} className="animate-spin text-on-surface-variant" /></div>
  }

  const identity = profile.identity, narrative = profile.narrative, compensation = profile.compensation
  const location = profile.location, skills = profile.skills, behavioral = profile.behavioral
  const evalPrefs = profile.evaluation_prefs, targetRoles = profile.target_roles

  return (
    <div>
      <PageHeader
        title="Job Hunt — Master Profile"
        subtitle="Private to you. This profile drives job discovery, fit scoring, and tailored resume/cover-letter generation — it never auto-applies. Schema adapted from santifer/career-ops and MadsLorentzen/ai-job-search."
        actions={
          <button onClick={save} disabled={saving} className="btn-accent flex items-center gap-1.5 text-xs px-4 py-2">
            <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
          </button>
        }
      />

      <Card className="p-3 mb-4 flex items-center gap-2.5">
        <Sparkles size={15} className="text-tertiary shrink-0" />
        <p className="text-[12.5px] text-on-surface-variant flex-1">
          Rather not type all of this? Upload your resume and let AI pull most of it in — you just review and pick what to keep.
        </p>
        <Link href="/job-hunt/resume" className="text-[11px] btn-accent px-3 py-1.5 whitespace-nowrap">Upload resume</Link>
      </Card>

      {saveMsg && <p className={`mb-4 text-xs ${saveMsg.startsWith('Saved') ? 'text-emerald-400' : 'text-red-400'}`}>{saveMsg}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Identity */}
        <Card className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2"><Briefcase size={15} style={{ color: 'var(--ws-accent)' }} /><h3 className="text-sm font-semibold">Identity</h3></div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Full name" value={String(identity.full_name ?? '')} onChange={(v) => setField('identity', 'full_name', v)} />
            <Field label="Email" value={String(identity.email ?? '')} onChange={(v) => setField('identity', 'email', v)} />
            <Field label="Phone" value={String(identity.phone ?? '')} onChange={(v) => setField('identity', 'phone', v)} />
            <Field label="Location" value={String(identity.location ?? '')} onChange={(v) => setField('identity', 'location', v)} />
            <Field label="LinkedIn" value={String(identity.linkedin ?? '')} onChange={(v) => setField('identity', 'linkedin', v)} />
            <Field label="GitHub" value={String(identity.github ?? '')} onChange={(v) => setField('identity', 'github', v)} />
            <Field label="Portfolio URL" value={String(identity.portfolio_url ?? '')} onChange={(v) => setField('identity', 'portfolio_url', v)} />
            <Field label="Employment status" value={String(identity.employment_status ?? '')} onChange={(v) => setField('identity', 'employment_status', v)} placeholder="e.g. actively looking, employed / open" />
          </div>
          <ListField label="Languages" value={(identity.languages as string[]) ?? []} onChange={(v) => setField('identity', 'languages', v)} placeholder="English (native), Spanish (B1)" />
          <Field label="Constraints" value={String(identity.constraints ?? '')} onChange={(v) => setField('identity', 'constraints', v)} placeholder="commute range, location constraints" />
        </Card>

        {/* Target Roles */}
        <Card className="p-4 flex flex-col gap-3">
          <SectionLabel>Target Roles</SectionLabel>
          <ListField label="Primary roles" value={(targetRoles.primary as string[]) ?? []} onChange={(v) => setField('target_roles', 'primary', v)} placeholder="Senior AI Engineer, Staff ML Engineer" />
          <Repeatable label="Archetypes" items={(targetRoles.archetypes as Section[]) ?? []} empty={{ name: '', level: '', fit: 'secondary' }}
            fields={[{ key: 'name', label: 'Name' }, { key: 'level', label: 'Level' }, { key: 'fit', label: 'Fit (primary/secondary/adjacent)' }]}
            onChange={(v) => setField('target_roles', 'archetypes', v)} />
        </Card>

        {/* Narrative */}
        <Card className="p-4 flex flex-col gap-3">
          <SectionLabel>Narrative</SectionLabel>
          <Field label="Headline" value={String(narrative.headline ?? '')} onChange={(v) => setField('narrative', 'headline', v)} />
          <Field label="Your story" textarea value={String(narrative.exit_story ?? '')} onChange={(v) => setField('narrative', 'exit_story', v)} placeholder="What makes you unique — your career narrative in a few sentences" />
          <ListField label="Superpowers" value={(narrative.superpowers as string[]) ?? []} onChange={(v) => setField('narrative', 'superpowers', v)} />
          <Repeatable label="Proof points" items={(narrative.proof_points as Section[]) ?? []} empty={{ name: '', url: '', hero_metric: '' }}
            fields={[{ key: 'name', label: 'Name' }, { key: 'url', label: 'URL' }, { key: 'hero_metric', label: 'Headline metric' }]}
            onChange={(v) => setField('narrative', 'proof_points', v)} />
        </Card>

        {/* Compensation & Location */}
        <Card className="p-4 flex flex-col gap-3">
          <SectionLabel>Compensation &amp; Location</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Target comp range" value={String(compensation.target_range ?? '')} onChange={(v) => setField('compensation', 'target_range', v)} placeholder="$150K-200K" />
            <Field label="Minimum (walk-away)" value={String(compensation.minimum ?? '')} onChange={(v) => setField('compensation', 'minimum', v)} />
            <Field label="Currency" value={String(compensation.currency ?? '')} onChange={(v) => setField('compensation', 'currency', v)} />
            <Field label="Country" value={String(location.country ?? '')} onChange={(v) => setField('location', 'country', v)} />
            <Field label="City" value={String(location.city ?? '')} onChange={(v) => setField('location', 'city', v)} />
            <Field label="Timezone" value={String(location.timezone ?? '')} onChange={(v) => setField('location', 'timezone', v)} />
            <Field label="Visa status" value={String(location.visa_status ?? '')} onChange={(v) => setField('location', 'visa_status', v)} />
          </div>
          <Field label="Location flexibility" value={String(compensation.location_flexibility ?? '')} onChange={(v) => setField('compensation', 'location_flexibility', v)} placeholder="Remote preferred, 1 week/month on-site possible" />
          <ListField label="Authorized to work in" value={(location.authorized_in as string[]) ?? []} onChange={(v) => setField('location', 'authorized_in', v)} />
          <Checkbox label="Need visa sponsorship outside those countries (hard-blocks 'no sponsorship' postings)" checked={!!location.needs_sponsorship} onChange={(v) => setField('location', 'needs_sponsorship', v)} />
        </Card>

        {/* Experience */}
        <Card className="p-4 flex flex-col gap-3 lg:col-span-2">
          <SectionLabel>Professional Experience</SectionLabel>
          <Repeatable label="Roles" items={profile.experience} empty={{ title: '', company: '', start: '', end: '', location: '', bullets: '' }}
            fields={[
              { key: 'title', label: 'Title' }, { key: 'company', label: 'Company' },
              { key: 'start', label: 'Start' }, { key: 'end', label: 'End' }, { key: 'location', label: 'Location' },
              { key: 'bullets', label: 'Achievements (one per line)', textarea: true },
            ]}
            onChange={(v) => set('experience', v)} />
        </Card>

        {/* Education */}
        <Card className="p-4 flex flex-col gap-3">
          <SectionLabel>Education</SectionLabel>
          <Repeatable label="Degrees" items={profile.education} empty={{ degree: '', period: '', institution: '', topics: '' }}
            fields={[{ key: 'degree', label: 'Degree' }, { key: 'period', label: 'Period' }, { key: 'institution', label: 'Institution' }, { key: 'topics', label: 'Key topics' }]}
            onChange={(v) => set('education', v)} />
        </Card>

        {/* Skills */}
        <Card className="p-4 flex flex-col gap-3">
          <SectionLabel>Technical Skills</SectionLabel>
          <ListField label="Programming / ML" value={(skills.programming as string[]) ?? []} onChange={(v) => setField('skills', 'programming', v)} placeholder="Python, PyTorch, ..." />
          <ListField label="Domain expertise" value={(skills.domain as string[]) ?? []} onChange={(v) => setField('skills', 'domain', v)} />
          <ListField label="Software & tools" value={(skills.tools as string[]) ?? []} onChange={(v) => setField('skills', 'tools', v)} />
        </Card>

        {/* Projects */}
        <Card className="p-4 flex flex-col gap-3 lg:col-span-2">
          <SectionLabel>Independent Projects</SectionLabel>
          <Repeatable label="Projects" items={profile.projects} empty={{ name: '', description: '', url: '' }}
            fields={[{ key: 'name', label: 'Name' }, { key: 'url', label: 'URL' }, { key: 'description', label: 'Description', textarea: true }]}
            onChange={(v) => set('projects', v)} />
        </Card>

        {/* Behavioral */}
        <Card className="p-4 flex flex-col gap-3 lg:col-span-2">
          <SectionLabel>Behavioral Profile</SectionLabel>
          <p className="text-[12px] text-on-surface-variant/60 -mt-1">From a PI/DISC/Myers-Briggs/StrengthsFinder result, or your own self-assessment. Used to flag culture-fit friction before you apply, not to filter automatically.</p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Profile type" value={String(behavioral.profile_type ?? '')} onChange={(v) => setField('behavioral', 'profile_type', v)} placeholder="e.g. High-D, INTJ, Achiever" />
            <Field label="Management style that works for you" value={String(behavioral.management_style ?? '')} onChange={(v) => setField('behavioral', 'management_style', v)} />
          </div>
          <Field label="Summary" textarea value={String(behavioral.summary ?? '')} onChange={(v) => setField('behavioral', 'summary', v)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ListField label="Strongest behaviors" value={(behavioral.strongest_behaviors as string[]) ?? []} onChange={(v) => setField('behavioral', 'strongest_behaviors', v)} />
            <ListField label="Growth areas" value={(behavioral.growth_areas as string[]) ?? []} onChange={(v) => setField('behavioral', 'growth_areas', v)} />
            <ListField label="Fit keywords (in a JD = good sign)" value={(behavioral.fit_keywords as string[]) ?? []} onChange={(v) => setField('behavioral', 'fit_keywords', v)} placeholder="autonomy, async-first, small team" />
            <ListField label="Friction keywords (flag, don't auto-reject)" value={(behavioral.friction_keywords as string[]) ?? []} onChange={(v) => setField('behavioral', 'friction_keywords', v)} placeholder="high-pressure, always-on, rigid hierarchy" />
          </div>
        </Card>

        {/* Evaluation preferences */}
        <Card className="p-4 flex flex-col gap-3 lg:col-span-2">
          <SectionLabel>Evaluation Preferences</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ListField label="Deal-breakers (hard reject)" value={(evalPrefs.deal_breakers as string[]) ?? []} onChange={(v) => setField('evaluation_prefs', 'deal_breakers', v)} placeholder="no on-call, relocation required" />
            <ListField label="Career goals" value={(evalPrefs.career_goals as string[]) ?? []} onChange={(v) => setField('evaluation_prefs', 'career_goals', v)} />
            <ListField label="Energizing tasks" value={(evalPrefs.energizing_tasks as string[]) ?? []} onChange={(v) => setField('evaluation_prefs', 'energizing_tasks', v)} />
            <ListField label="Draining tasks" value={(evalPrefs.draining_tasks as string[]) ?? []} onChange={(v) => setField('evaluation_prefs', 'draining_tasks', v)} />
          </div>
          <ListField label="Culture screen — what you actively look for" value={(evalPrefs.culture_screen_require as string[]) ?? []} onChange={(v) => setField('evaluation_prefs', 'culture_screen_require', v)} placeholder="Small flat teams, async-first" />
          <Checkbox label="Cap culture fit score if a posting shows no evidence of these" checked={!!evalPrefs.deprioritize_if_absent} onChange={(v) => setField('evaluation_prefs', 'deprioritize_if_absent', v)} />
        </Card>

        {/* Weights */}
        <Card className="p-4 flex flex-col gap-3 lg:col-span-2">
          <SectionLabel>Fit Scoring Weights</SectionLabel>
          <p className="text-[12px] text-on-surface-variant/60 -mt-1">
            Defaults pulled from ai-job-search&apos;s evaluation framework verbatim (Technical 30% / Experience 25% / Behavioral 15% / Career 30% — location is separately pass/fail, not weighted). Adjust if your priorities differ.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {([
              ['technical_skills', 'Technical Skills'],
              ['experience_match', 'Experience Match'],
              ['behavioral_fit', 'Behavioral Fit'],
              ['career_alignment', 'Career Alignment'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wide text-on-surface-variant/70">{label} %</span>
                <input type="number" min={0} max={100} value={profile.weights[key]}
                  onChange={(e) => set('weights', { ...profile.weights, [key]: Number(e.target.value) || 0 })}
                  className="w-full rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-on-surface focus:border-white/25 focus:outline-none" />
              </label>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 pb-8">
        <Checkbox label="Mark profile setup complete" checked={profile.setup_complete} onChange={(v) => set('setup_complete', v)} />
      </div>
    </div>
  )
}
