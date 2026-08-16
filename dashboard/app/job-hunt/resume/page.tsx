'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card } from '@/components/ui'
import { Loader2, Upload, FileText, Trash2, Sparkles, CheckCircle2, AlertTriangle, PlusCircle } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — RESUME (2026-08-15)
// ═══════════════════════════════════════════════════════════════════════════
// Fifth Job Hunt artifact — replaces "type everything into the Master
// Profile form" with "upload a resume, let AI read it, pick what to keep."
// Analysis logic ported from the operator's own YVON-OS
// app/api/jobs/analyze-resume/route.ts (also, unused, already sitting in
// this repo's app/api/jobs/ — same source, adapted to run through this
// project's swappable AI provider instead of Anthropic-only PDF vision; see
// app/api/job-hunt/resume/analyze/route.ts for the deviation note).
// One current resume by design (not a versioned vault) per operator choice.

type SkillCategory = 'programming' | 'domain' | 'tools'

interface Resume {
  id: string
  name: string
  industry_tag: string
  file_type: string
  analysis_json: Analysis | null
  analyzed_at: string | null
  created_at: string
}

interface EducationItem { degree?: string; institution?: string; period?: string; topics?: string }
interface ExperienceItem { title?: string; company?: string; start?: string; end?: string; location?: string; bullets?: string }

interface Analysis {
  name?: string
  skills?: Partial<Record<SkillCategory, string[]>>
  experience_years?: number
  industries?: string[]
  education?: EducationItem[]
  experience?: ExperienceItem[]
  ats_score?: number
  ats_issues?: string[]
  strengths?: string[]
  weaknesses?: string[]
  suggestions?: string[]
  summary?: string
}

const SKILL_LABELS: Record<SkillCategory, string> = { programming: 'Programming / ML', domain: 'Domain expertise', tools: 'Software & tools' }

function scoreTone(score: number): string {
  if (score >= 80) return 'text-emerald-300'
  if (score >= 60) return 'text-tertiary'
  return 'text-red-300'
}

export default function JobHuntResumePage() {
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [selectedEdu, setSelectedEdu] = useState<Set<number>>(new Set())
  const [selectedExp, setSelectedExp] = useState<Set<number>>(new Set())
  const [selectedSkills, setSelectedSkills] = useState<Record<SkillCategory, Set<number>>>({ programming: new Set(), domain: new Set(), tools: new Set() })
  const [applying, setApplying] = useState(false)
  const [appliedMsg, setAppliedMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/job-hunt/resume')
      const data = await res.json()
      setResume(data.resume ?? null)
      if (data.resume?.analysis_json) {
        const a = data.resume.analysis_json as Analysis
        setAnalysis(a)
        selectAllByDefault(a)
      }
    } catch {
      setResume(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function selectAllByDefault(a: Analysis) {
    setSelectedEdu(new Set((a.education ?? []).map((_, i) => i)))
    setSelectedExp(new Set((a.experience ?? []).map((_, i) => i)))
    setSelectedSkills({
      programming: new Set((a.skills?.programming ?? []).map((_, i) => i)),
      domain: new Set((a.skills?.domain ?? []).map((_, i) => i)),
      tools: new Set((a.skills?.tools ?? []).map((_, i) => i)),
    })
  }

  const upload = useCallback(async (file: File) => {
    setUploading(true)
    setAnalysis(null)
    setAppliedMsg(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/job-hunt/resume', { method: 'POST', body: form })
      const data = await res.json()
      if (data.error) { alert(data.error) } else { await load() }
    } catch {
      alert('Upload failed.')
    }
    setUploading(false)
  }, [load])

  const removeResume = useCallback(async () => {
    await fetch('/api/job-hunt/resume', { method: 'DELETE' })
    setResume(null)
    setAnalysis(null)
    setAppliedMsg(null)
  }, [])

  const analyze = useCallback(async () => {
    setAnalyzing(true)
    setAppliedMsg(null)
    try {
      const res = await fetch('/api/job-hunt/resume/analyze', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.error) {
        alert(data.error)
      } else {
        setAnalysis(data.analysis)
        selectAllByDefault(data.analysis)
      }
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
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Resume</h1>
        <p className="mt-1 text-sm text-on-surface-variant max-w-2xl">
          Upload your resume, let AI score it and pull out the details — then pick what to add to your profile instead of typing it all in by hand.
        </p>
      </div>

      <Card className="p-4 mb-4">
        {loading ? (
          <div className="flex items-center justify-center h-16"><Loader2 size={18} className="animate-spin text-on-surface-variant" /></div>
        ) : resume ? (
          <div className="flex items-center gap-3 flex-wrap">
            <FileText size={18} className="text-on-surface-variant/70 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-on-surface font-medium truncate">{resume.name}</div>
              <div className="text-[11px] text-on-surface-variant/60">
                Uploaded {new Date(resume.created_at).toLocaleDateString()}
                {resume.analyzed_at && ` — analyzed ${new Date(resume.analyzed_at).toLocaleDateString()}`}
              </div>
            </div>
            <button onClick={analyze} disabled={analyzing}
              className="flex items-center gap-1.5 text-xs btn-accent px-3 py-2 whitespace-nowrap disabled:opacity-50">
              {analyzing ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {resume.analysis_json ? 'Re-analyze' : 'Analyze'}
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 text-[11px] px-2.5 py-2 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant hover:text-on-surface whitespace-nowrap">
              <Upload size={12} /> Replace
            </button>
            <button onClick={removeResume} className="p-2 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant/50 hover:text-on-surface-variant">
              <Trash2 size={13} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Upload size={22} className="text-on-surface-variant/40" />
            <p className="text-[13px] text-on-surface-variant">No resume uploaded yet — PDF or DOCX, up to 10MB.</p>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
              className="btn-accent text-xs px-3 py-2 mt-1 flex items-center gap-1.5">
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Upload resume
            </button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
      </Card>

      {analysis && (
        <>
          <Card className="p-4 mb-4 flex flex-col gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              {typeof analysis.ats_score === 'number' && (
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-2xl font-bold ${scoreTone(analysis.ats_score)}`}>{analysis.ats_score}</span>
                  <span className="text-[11px] text-on-surface-variant/60">/ 100 ATS score</span>
                </div>
              )}
              {analysis.experience_years !== undefined && (
                <span className="text-[11px] px-2 py-1 rounded-full border border-white/10 text-on-surface-variant/70">{analysis.experience_years} yrs experience</span>
              )}
              {(analysis.industries ?? []).map((ind) => (
                <span key={ind} className="text-[11px] px-2 py-1 rounded-full border border-white/10 text-on-surface-variant/70">{ind}</span>
              ))}
            </div>
            {analysis.summary && <p className="text-[13px] text-on-surface-variant/80">{analysis.summary}</p>}
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {(analysis.strengths?.length ?? 0) > 0 && (
              <Card className="p-3.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-300/80 mb-2 flex items-center gap-1"><CheckCircle2 size={12} /> Strengths</h3>
                <ul className="flex flex-col gap-1.5">
                  {analysis.strengths!.map((s, i) => <li key={i} className="text-[12px] text-on-surface-variant/80">• {s}</li>)}
                </ul>
              </Card>
            )}
            {(analysis.weaknesses?.length ?? 0) > 0 && (
              <Card className="p-3.5">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-tertiary/90 mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Gaps</h3>
                <ul className="flex flex-col gap-1.5">
                  {analysis.weaknesses!.map((s, i) => <li key={i} className="text-[12px] text-on-surface-variant/80">• {s}</li>)}
                </ul>
              </Card>
            )}
          </div>

          {(analysis.suggestions?.length ?? 0) > 0 && (
            <Card className="p-3.5 mb-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60 mb-2">Improve it</h3>
              <ul className="flex flex-col gap-1.5">
                {analysis.suggestions!.map((s, i) => <li key={i} className="text-[12px] text-on-surface-variant/80">• {s}</li>)}
              </ul>
            </Card>
          )}

          {(analysis.ats_issues?.length ?? 0) > 0 && (
            <Card className="p-3.5 mb-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60 mb-2">ATS issues</h3>
              <ul className="flex flex-col gap-1.5">
                {analysis.ats_issues!.map((s, i) => <li key={i} className="text-[12px] text-on-surface-variant/80">• {s}</li>)}
              </ul>
            </Card>
          )}

          <Card className="p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-semibold text-on-surface">Pick what to add to your profile</h3>
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
          </Card>
        </>
      )}
    </div>
  )
}
