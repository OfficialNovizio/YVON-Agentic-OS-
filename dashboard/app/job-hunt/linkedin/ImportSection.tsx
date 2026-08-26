'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, Upload, FileArchive, Trash2, Sparkles, PlusCircle } from 'lucide-react'

// LinkedIn profile import — NOT scraping. The operator downloads their own
// data export from LinkedIn Settings & Privacy ("Get a copy of your data")
// and uploads that ZIP here. Mirrors app/job-hunt/resume/page.tsx's
// upload -> analyze -> pick-what-to-add-to-profile pattern exactly, since
// the analyze route returns the same shape (skills/education/experience).
// Adora restyle 2026-08-25 — embedded in the already-shelled LinkedIn page.

type SkillCategory = 'programming' | 'domain' | 'tools'

interface Imp {
  id: string
  files_found: string[]
  analysis_json: Analysis | null
  analyzed_at: string | null
  created_at: string
}

interface EducationItem { degree?: string; institution?: string; period?: string; topics?: string }
interface ExperienceItem { title?: string; company?: string; start?: string; end?: string; location?: string; bullets?: string }

interface Analysis {
  name?: string
  headline?: string
  skills?: Partial<Record<SkillCategory, string[]>>
  industries?: string[]
  education?: EducationItem[]
  experience?: ExperienceItem[]
  summary?: string
}

const SKILL_LABELS: Record<SkillCategory, string> = { programming: 'Programming / ML', domain: 'Domain expertise', tools: 'Software & tools' }
const LABEL_CLS = 'mb-1.5 text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]'

export default function LinkedInImportSection() {
  const [imp, setImp] = useState<Imp | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [selectedEdu, setSelectedEdu] = useState<Set<number>>(new Set())
  const [selectedExp, setSelectedExp] = useState<Set<number>>(new Set())
  const [selectedSkills, setSelectedSkills] = useState<Record<SkillCategory, Set<number>>>({ programming: new Set(), domain: new Set(), tools: new Set() })
  const [applying, setApplying] = useState(false)
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectAllByDefault = (a: Analysis) => {
    setSelectedEdu(new Set((a.education ?? []).map((_, i) => i)))
    setSelectedExp(new Set((a.experience ?? []).map((_, i) => i)))
    setSelectedSkills({
      programming: new Set((a.skills?.programming ?? []).map((_, i) => i)),
      domain: new Set((a.skills?.domain ?? []).map((_, i) => i)),
      tools: new Set((a.skills?.tools ?? []).map((_, i) => i)),
    })
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/job-hunt/linkedin/import')
      const data = await res.json()
      setImp(data.import ?? null)
      if (data.import?.analysis_json) {
        setAnalysis(data.import.analysis_json)
        selectAllByDefault(data.import.analysis_json)
        setExpanded(true)
      }
    } catch {
      setImp(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const upload = useCallback(async (file: File) => {
    setUploading(true)
    setAnalysis(null)
    setAppliedMsg(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/job-hunt/linkedin/import', { method: 'POST', body: form })
      const data = await res.json()
      if (data.error) { alert(data.error) } else { await load(); setExpanded(true) }
    } catch {
      alert('Upload failed.')
    }
    setUploading(false)
  }, [load])

  const removeImport = useCallback(async () => {
    await fetch('/api/job-hunt/linkedin/import', { method: 'DELETE' })
    setImp(null); setAnalysis(null); setAppliedMsg(null)
  }, [])

  const analyze = useCallback(async () => {
    setAnalyzing(true)
    setAppliedMsg(null)
    try {
      const res = await fetch('/api/job-hunt/linkedin/import/analyze', { method: 'POST' })
      const data = await res.json()
      if (data.error) { alert(data.error) } else { setAnalysis(data.analysis); selectAllByDefault(data.analysis) }
    } catch {
      alert('Analysis failed.')
    }
    setAnalyzing(false)
  }, [])

  const toggleSkill = (cat: SkillCategory, i: number) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev[cat])
      next.has(i) ? next.delete(i) : next.add(i)
      return { ...prev, [cat]: next }
    })
  }

  const addToProfile = useCallback(async () => {
    if (!analysis) return
    setApplying(true)
    try {
      const profRes = await fetch('/api/job-hunt/profile')
      const profData = await profRes.json()
      const profile = profData.profile ?? {}

      const existingEducation: EducationItem[] = profile.education ?? []
      const existingExperience: ExperienceItem[] = profile.experience ?? []
      const existingSkills: Partial<Record<SkillCategory, string[]>> = profile.skills ?? {}

      const newEducation = (analysis.education ?? []).filter((_, i) => selectedEdu.has(i))
        .filter((e) => !existingEducation.some((x) => x.degree === e.degree))
      const newExperience = (analysis.experience ?? []).filter((_, i) => selectedExp.has(i))
        .filter((e) => !existingExperience.some((x) => x.title === e.title && x.company === e.company))

      const mergedSkills: Record<SkillCategory, string[]> = {
        programming: [...new Set([...(existingSkills.programming ?? []), ...((analysis.skills?.programming ?? []).filter((_, i) => selectedSkills.programming.has(i)))])],
        domain: [...new Set([...(existingSkills.domain ?? []), ...((analysis.skills?.domain ?? []).filter((_, i) => selectedSkills.domain.has(i)))])],
        tools: [...new Set([...(existingSkills.tools ?? []), ...((analysis.skills?.tools ?? []).filter((_, i) => selectedSkills.tools.has(i)))])],
      }

      const count = newEducation.length + newExperience.length +
        (mergedSkills.programming.length - (existingSkills.programming ?? []).length) +
        (mergedSkills.domain.length - (existingSkills.domain ?? []).length) +
        (mergedSkills.tools.length - (existingSkills.tools ?? []).length)

      await fetch('/api/job-hunt/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          education: [...existingEducation, ...newEducation],
          experience: [...existingExperience, ...newExperience],
          skills: mergedSkills,
        }),
      })
      setAppliedMsg(count > 0 ? `Added ${count} item${count === 1 ? '' : 's'} to your profile.` : 'Nothing new to add — already in your profile.')
    } catch {
      alert('Could not update profile.')
    }
    setApplying(false)
  }, [analysis, selectedEdu, selectedExp, selectedSkills])

  const ghostBtn = 'flex items-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[var(--chat-hairline)] px-2.5 py-2 text-[11px] text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)] hover:text-[var(--chat-body)]'

  return (
    <div className="chat-glass mt-4 p-4">
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <FileArchive size={16} className="shrink-0 text-[var(--chat-text-faint)]" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold text-[var(--chat-body)]">Import from LinkedIn</h3>
          <p className="text-[11.5px] text-[var(--chat-text-faint)]">
            Not scraping — upload your own data export (LinkedIn Settings &amp; Privacy → &quot;Get a copy of your data&quot;) for your full profile history, no account risk.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-12 items-center justify-center"><Loader2 size={16} className="animate-spin text-[var(--chat-text-faint)]" /></div>
      ) : imp ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1 text-[11.5px] text-[var(--chat-text-faint)]">
            {imp.files_found.length} file{imp.files_found.length === 1 ? '' : 's'} found ({imp.files_found.join(', ')}) — uploaded {new Date(imp.created_at).toLocaleDateString()}
            {imp.analyzed_at && ` — analyzed ${new Date(imp.analyzed_at).toLocaleDateString()}`}
          </div>
          <button onClick={analyze} disabled={analyzing}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-[#592eff] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4520cc] disabled:opacity-50">
            {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {imp.analysis_json ? 'Re-analyze' : 'Analyze'}
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className={ghostBtn}>
            <Upload size={12} /> Replace
          </button>
          <button onClick={removeImport} className="rounded-[10px] border border-[var(--chat-hairline)] p-2 text-[var(--chat-text-faint)] hover:text-[var(--chat-body)]">
            <Trash2 size={13} />
          </button>
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-2">
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1.5 rounded-[10px] bg-[#592eff] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4520cc]">
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Upload LinkedIn export (.zip)
          </button>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept=".zip,application/zip" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />

      {analysis && expanded && (
        <div className="mt-3 border-t border-[var(--chat-hairline)] pt-3">
          {analysis.summary && <p className="mb-3 text-[12.5px] text-[var(--chat-text-dim)]">{analysis.summary}</p>}

          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-[12px] font-semibold text-[var(--chat-body)]">Pick what to add to your profile</h4>
            <button onClick={addToProfile} disabled={applying}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-[#592eff] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4520cc] disabled:opacity-50">
              {applying ? <Loader2 size={13} className="animate-spin" /> : <PlusCircle size={13} />} Add selected to profile
            </button>
          </div>
          {appliedMsg && <p className="mb-2 text-[12px] text-[#047857]">{appliedMsg}</p>}

          {(analysis.education?.length ?? 0) > 0 && (
            <div className="mb-3">
              <p className={LABEL_CLS}>Education</p>
              <div className="flex flex-col gap-1">
                {analysis.education!.map((e, i) => (
                  <label key={i} className="flex cursor-pointer items-start gap-2 text-[12.5px] text-[var(--chat-text-dim)]">
                    <input type="checkbox" checked={selectedEdu.has(i)} className="mt-0.5 accent-[#592eff]"
                      onChange={() => setSelectedEdu((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })} />
                    <span>{e.degree}{e.institution ? ` — ${e.institution}` : ''}{e.period ? ` (${e.period})` : ''}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(analysis.experience?.length ?? 0) > 0 && (
            <div className="mb-3">
              <p className={LABEL_CLS}>Experience</p>
              <div className="flex flex-col gap-1">
                {analysis.experience!.map((e, i) => (
                  <label key={i} className="flex cursor-pointer items-start gap-2 text-[12.5px] text-[var(--chat-text-dim)]">
                    <input type="checkbox" checked={selectedExp.has(i)} className="mt-0.5 accent-[#592eff]"
                      onChange={() => setSelectedExp((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })} />
                    <span>{e.title}{e.company ? ` at ${e.company}` : ''}{e.bullets ? ` — ${e.bullets}` : ''}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(['programming', 'domain', 'tools'] as SkillCategory[]).map((cat) => (
            (analysis.skills?.[cat]?.length ?? 0) > 0 && (
              <div key={cat} className="mb-3">
                <p className={LABEL_CLS}>{SKILL_LABELS[cat]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills![cat]!.map((s, i) => (
                    <button key={s} onClick={() => toggleSkill(cat, i)}
                      className={`rounded-[200px] border px-2 py-1 text-[11px] transition ${selectedSkills[cat].has(i) ? 'border-transparent bg-[rgba(89,46,255,0.08)] text-[var(--chat-accent)]' : 'border-[var(--chat-hairline)] text-[var(--chat-text-faint)] line-through'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  )
}
