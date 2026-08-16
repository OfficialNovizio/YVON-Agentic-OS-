'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/components/ui'
import { Loader2, Upload, FileArchive, Trash2, Sparkles, PlusCircle } from 'lucide-react'

// LinkedIn profile import — NOT scraping. The operator downloads their own
// data export from LinkedIn Settings & Privacy ("Get a copy of your data")
// and uploads that ZIP here. Mirrors app/job-hunt/resume/page.tsx's
// upload -> analyze -> pick-what-to-add-to-profile pattern exactly, since
// the analyze route returns the same shape (skills/education/experience).

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

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <FileArchive size={16} className="text-on-surface-variant/70 shrink-0" />
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold text-on-surface">Import from LinkedIn</h3>
          <p className="text-[11.5px] text-on-surface-variant/70">
            Not scraping — upload your own data export (LinkedIn Settings &amp; Privacy → &quot;Get a copy of your data&quot;) for your full profile history, no account risk.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-12"><Loader2 size={16} className="animate-spin text-on-surface-variant" /></div>
      ) : imp ? (
        <div className="flex items-center gap-3 flex-wrap mt-2">
          <div className="min-w-0 flex-1 text-[11.5px] text-on-surface-variant/70">
            {imp.files_found.length} file{imp.files_found.length === 1 ? '' : 's'} found ({imp.files_found.join(', ')}) — uploaded {new Date(imp.created_at).toLocaleDateString()}
            {imp.analyzed_at && ` — analyzed ${new Date(imp.analyzed_at).toLocaleDateString()}`}
          </div>
          <button onClick={analyze} disabled={analyzing}
            className="flex items-center gap-1.5 text-xs btn-accent px-3 py-2 whitespace-nowrap disabled:opacity-50">
            {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {imp.analysis_json ? 'Re-analyze' : 'Analyze'}
          </button>
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1.5 text-[11px] px-2.5 py-2 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant hover:text-on-surface whitespace-nowrap">
            <Upload size={12} /> Replace
          </button>
          <button onClick={removeImport} className="p-2 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant/50 hover:text-on-surface-variant">
            <Trash2 size={13} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="btn-accent text-xs px-3 py-2 flex items-center gap-1.5">
            {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Upload LinkedIn export (.zip)
          </button>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept=".zip,application/zip" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />

      {analysis && expanded && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          {analysis.summary && <p className="text-[12.5px] text-on-surface-variant/80 mb-3">{analysis.summary}</p>}

          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[12px] font-semibold text-on-surface">Pick what to add to your profile</h4>
            <button onClick={addToProfile} disabled={applying}
              className="flex items-center gap-1.5 text-xs btn-accent px-3 py-1.5 disabled:opacity-50 whitespace-nowrap">
              {applying ? <Loader2 size={13} className="animate-spin" /> : <PlusCircle size={13} />} Add selected to profile
            </button>
          </div>
          {appliedMsg && <p className="text-[12px] text-emerald-300 mb-2">{appliedMsg}</p>}

          {(analysis.education?.length ?? 0) > 0 && (
            <div className="mb-3">
              <p className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/50 mb-1.5">Education</p>
              <div className="flex flex-col gap-1">
                {analysis.education!.map((e, i) => (
                  <label key={i} className="flex items-start gap-2 text-[12.5px] text-on-surface-variant/80 cursor-pointer">
                    <input type="checkbox" checked={selectedEdu.has(i)}
                      onChange={() => setSelectedEdu((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })}
                      className="mt-0.5" />
                    <span>{e.degree}{e.institution ? ` — ${e.institution}` : ''}{e.period ? ` (${e.period})` : ''}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(analysis.experience?.length ?? 0) > 0 && (
            <div className="mb-3">
              <p className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/50 mb-1.5">Experience</p>
              <div className="flex flex-col gap-1">
                {analysis.experience!.map((e, i) => (
                  <label key={i} className="flex items-start gap-2 text-[12.5px] text-on-surface-variant/80 cursor-pointer">
                    <input type="checkbox" checked={selectedExp.has(i)}
                      onChange={() => setSelectedExp((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })}
                      className="mt-0.5" />
                    <span>{e.title}{e.company ? ` at ${e.company}` : ''}{e.bullets ? ` — ${e.bullets}` : ''}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(['programming', 'domain', 'tools'] as SkillCategory[]).map((cat) => (
            (analysis.skills?.[cat]?.length ?? 0) > 0 && (
              <div key={cat} className="mb-3">
                <p className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/50 mb-1.5">{SKILL_LABELS[cat]}</p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills![cat]!.map((s, i) => (
                    <button key={s} onClick={() => toggleSkill(cat, i)}
                      className={`text-[11px] px-2 py-1 rounded-full border transition ${selectedSkills[cat].has(i) ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/40 line-through'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </Card>
  )
}
