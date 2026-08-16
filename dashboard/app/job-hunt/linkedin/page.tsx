'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui'
import { Loader2, Plus, Sparkles, Trash2, X, Copy, Linkedin, Key, Send, CheckCircle2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — LINKEDIN CONTENT LAB (2026-08-15)
// ═══════════════════════════════════════════════════════════════════════════
// Fourth Job Hunt artifact. Schema pulled verbatim from the operator's own
// prior YVON-OS design (025_content_lab.sql: linkedin_posts + post_ideas).
// This page covers idea capture + AI-assisted drafting + a draft/schedule
// list. Actually connecting a LinkedIn account and publishing is a separate,
// not-yet-built piece (OAuth connect/callback/publish) — everything here is
// draft-only until that lands.

interface Idea {
  id: string
  topic: string
  industry_tag: string | null
  rough_idea: string | null
  expanded_draft: string | null
  status: string
}

interface Post {
  id: string
  content: string
  industry_tag: string
  tone: string
  format: string
  status: string
  scheduled_date: string | null
  created_at: string
}

const INDUSTRIES = ['Aerospace', 'IT', 'Trucking', 'Drone', 'Business']
const TONES = ['story', 'insight', 'announcement', 'opinion']
const STATUS_TONE: Record<string, string> = {
  draft: 'bg-white/5 text-on-surface-variant',
  ready: 'bg-tertiary/15 text-tertiary',
  scheduled: 'bg-primary/10 text-primary',
  published: 'bg-emerald-400/10 text-emerald-300',
  new: 'bg-white/5 text-on-surface-variant',
  expanded: 'bg-tertiary/15 text-tertiary',
}

interface ConnectionStatus {
  app_configured: boolean
  connected: boolean
  expired: boolean
  person_name: string | null
  person_headline: string | null
}

export default function JobHuntLinkedInPage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [addingIdea, setAddingIdea] = useState(false)
  const [topic, setTopic] = useState('')
  const [roughIdea, setRoughIdea] = useState('')
  const [industryTag, setIndustryTag] = useState('')
  const [expanding, setExpanding] = useState<string | null>(null)
  const [composeFor, setComposeFor] = useState<Idea | null>(null)
  const [composeTone, setComposeTone] = useState('story')
  const [composeText, setComposeText] = useState('')
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [appSetupOpen, setAppSetupOpen] = useState(false)
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [redirectUri, setRedirectUri] = useState('')
  const [publishing, setPublishing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [ideasRes, postsRes, statusRes] = await Promise.all([
        fetch('/api/job-hunt/linkedin/ideas'),
        fetch('/api/job-hunt/linkedin/posts'),
        fetch('/api/job-hunt/linkedin/me'),
      ])
      const ideasData = await ideasRes.json()
      const postsData = await postsRes.json()
      const statusData = await statusRes.json()
      setIdeas(ideasData.ideas ?? [])
      setPosts(postsData.posts ?? [])
      setStatus(statusData)
    } catch {
      setIdeas([]); setPosts([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    if (typeof window !== 'undefined') setRedirectUri(`${window.location.origin}/api/job-hunt/linkedin/callback`)
  }, [load])

  const saveAppCredentials = useCallback(async () => {
    if (!clientId.trim() || !clientSecret.trim()) return
    await fetch('/api/job-hunt/source-keys', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'linkedin', config: { client_id: clientId.trim(), client_secret: clientSecret.trim(), redirect_uri: redirectUri.trim() } }),
    })
    setClientSecret('')
    setAppSetupOpen(false)
    load()
  }, [clientId, clientSecret, redirectUri, load])

  const publishPost = useCallback(async (id: string) => {
    setPublishing(id)
    try {
      const res = await fetch('/api/job-hunt/linkedin/publish', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: id }),
      })
      const data = await res.json()
      if (data.error) alert(data.error)
    } catch {
      alert('Publish failed.')
    }
    setPublishing(null)
    load()
  }, [load])

  const addIdea = useCallback(async () => {
    if (!topic.trim()) return
    await fetch('/api/job-hunt/linkedin/ideas', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic.trim(), rough_idea: roughIdea.trim() || null, industry_tag: industryTag || null }),
    })
    setTopic(''); setRoughIdea(''); setIndustryTag(''); setAddingIdea(false)
    load()
  }, [topic, roughIdea, industryTag, load])

  const deleteIdea = useCallback(async (id: string) => {
    await fetch(`/api/job-hunt/linkedin/ideas?id=${id}`, { method: 'DELETE' })
    load()
  }, [load])

  const openCompose = useCallback((idea: Idea) => {
    setComposeFor(idea)
    setComposeText(idea.expanded_draft ?? '')
    setComposeTone('story')
  }, [])

  const expandIdea = useCallback(async () => {
    if (!composeFor) return
    setExpanding(composeFor.id)
    try {
      const res = await fetch('/api/job-hunt/linkedin/expand', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rough_idea: composeFor.rough_idea || composeFor.topic,
          industry_tag: composeFor.industry_tag,
          tone: composeTone,
        }),
      })
      const data = await res.json()
      setComposeText(data.draft ?? data.error ?? '')
    } catch {
      setComposeText('Could not generate a draft.')
    }
    setExpanding(null)
  }, [composeFor, composeTone])

  const saveAsDraftPost = useCallback(async () => {
    if (!composeFor || !composeText.trim()) return
    await fetch('/api/job-hunt/linkedin/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: composeText.trim(),
        industry_tag: composeFor.industry_tag || 'Business',
        tone: composeTone,
        status: 'draft',
      }),
    })
    await fetch('/api/job-hunt/linkedin/ideas', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: composeFor.id, expanded_draft: composeText.trim(), status: 'expanded' }),
    })
    setComposeFor(null)
    load()
  }, [composeFor, composeText, composeTone, load])

  const setPostStatus = useCallback(async (id: string, status: string) => {
    await fetch('/api/job-hunt/linkedin/posts', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    load()
  }, [load])

  const deletePost = useCallback(async (id: string) => {
    await fetch(`/api/job-hunt/linkedin/posts?id=${id}`, { method: 'DELETE' })
    load()
  }, [load])

  return (
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">LinkedIn</h1>
          <p className="mt-1 text-sm text-on-surface-variant max-w-2xl">
            Content Lab — capture post ideas, expand them with AI, keep drafts ready. Nothing publishes automatically yet;
            connecting your account for real posting is a separate step, not built here.
          </p>
        </div>
        <button onClick={() => setAddingIdea((v) => !v)} className="btn-accent flex items-center gap-1.5 text-xs px-3 py-2 whitespace-nowrap">
          <Plus size={14} /> New idea
        </button>
      </div>

      <Card className="p-3.5 mb-4 flex flex-col gap-2">
        {status?.connected ? (
          <div className="flex items-center gap-2 flex-wrap">
            <CheckCircle2 size={14} className="text-emerald-300 shrink-0" />
            <span className="text-[12.5px] text-on-surface">
              Connected as <span className="font-medium">{status.person_name}</span>
            </span>
            <a href="/api/job-hunt/linkedin/connect" className="ml-auto text-[11px] text-on-surface-variant hover:text-on-surface underline decoration-dotted">
              Reconnect
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <Linkedin size={14} className="text-on-surface-variant/60 shrink-0" />
            <span className="text-[12.5px] text-on-surface-variant">
              {status?.expired ? 'LinkedIn connection expired.' : 'Not connected — publishing is disabled until you connect your account.'}
            </span>
            {status?.app_configured ? (
              <a href="/api/job-hunt/linkedin/connect" className="ml-auto flex items-center gap-1 text-[11px] btn-accent px-3 py-1.5 whitespace-nowrap">
                <Linkedin size={12} /> Connect LinkedIn
              </a>
            ) : (
              <button onClick={() => setAppSetupOpen((v) => !v)} className="ml-auto flex items-center gap-1 text-[11px] text-on-surface-variant hover:text-on-surface underline decoration-dotted whitespace-nowrap">
                <Key size={11} /> set up LinkedIn app credentials
              </button>
            )}
          </div>
        )}

        {appSetupOpen && !status?.app_configured && (
          <div className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/[0.02] p-2.5">
            <span className="text-[11px] text-on-surface-variant/70">
              Create an app at developer.linkedin.com (request the &quot;Sign In with LinkedIn using OpenID Connect&quot; and &quot;Share on LinkedIn&quot; products), then paste its credentials here. Nothing is sent to LinkedIn until you click Connect above.
            </span>
            <div className="flex flex-col sm:flex-row gap-2">
              <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Client ID"
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[12px] text-on-surface flex-1" />
              <input value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} placeholder="Client Secret" type="password"
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[12px] text-on-surface flex-1" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} placeholder="Redirect URI"
                className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[12px] text-on-surface flex-1" />
              <span className="text-[10.5px] text-on-surface-variant/50 whitespace-nowrap">↑ add this exact URL as an authorized redirect URL on the LinkedIn app</span>
            </div>
            <button onClick={saveAppCredentials} className="btn-accent text-[11px] px-3 py-1.5 self-start">Save</button>
          </div>
        )}
      </Card>

      {addingIdea && (
        <Card className="p-3.5 mb-4 flex flex-col gap-2">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (short)"
            className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-on-surface" />
          <textarea value={roughIdea} onChange={(e) => setRoughIdea(e.target.value)} placeholder="Rough idea / notes (optional)" rows={2}
            className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-on-surface resize-none" />
          <div className="flex flex-wrap items-center gap-1.5">
            {INDUSTRIES.map((ind) => (
              <button key={ind} onClick={() => setIndustryTag(industryTag === ind ? '' : ind)}
                className={`text-[11px] px-2.5 py-1 rounded-full border transition ${industryTag === ind ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
                {ind}
              </button>
            ))}
            <button onClick={addIdea} className="btn-accent text-[11px] px-3 py-1.5 ml-auto whitespace-nowrap">Save idea</button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 size={20} className="animate-spin text-on-surface-variant" /></div>
      ) : (
        <>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60 mb-2">Idea bank</h3>
          {ideas.length === 0 ? (
            <p className="text-sm text-on-surface-variant/60 italic py-4 text-center">No ideas yet — jot down anything worth posting about.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mb-6">
              {ideas.map((idea) => (
                <Card key={idea.id} className="p-3.5 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-medium text-on-surface">{idea.topic}</span>
                    <button onClick={() => deleteIdea(idea.id)} className="shrink-0 text-on-surface-variant/40 hover:text-on-surface-variant">
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {idea.rough_idea && <p className="text-[11.5px] text-on-surface-variant/70 line-clamp-2">{idea.rough_idea}</p>}
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${STATUS_TONE[idea.status] ?? 'bg-white/5 text-on-surface-variant'}`}>{idea.status}</span>
                    {idea.industry_tag && <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-on-surface-variant/60">{idea.industry_tag}</span>}
                    <button onClick={() => openCompose(idea)} className="ml-auto flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant hover:text-on-surface">
                      <Sparkles size={11} /> Compose
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant/60 mb-2">Drafts &amp; schedule</h3>
          {posts.length === 0 ? (
            <p className="text-sm text-on-surface-variant/60 italic py-4 text-center">No drafted posts yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {posts.map((p) => (
                <Card key={p.id} className="p-3.5 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${STATUS_TONE[p.status] ?? 'bg-white/5 text-on-surface-variant'}`}>{p.status}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-on-surface-variant/60">{p.industry_tag}</span>
                      <span className="text-[10px] text-on-surface-variant/50 capitalize">{p.tone}</span>
                    </div>
                    <p className="text-[12.5px] text-on-surface-variant/80 line-clamp-3 whitespace-pre-wrap">{p.content}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => navigator.clipboard.writeText(p.content)}
                      className="p-1.5 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant hover:text-on-surface">
                      <Copy size={12} />
                    </button>
                    {p.status === 'draft' && (
                      <button onClick={() => setPostStatus(p.id, 'ready')} className="text-[11px] px-2 py-1.5 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant hover:text-on-surface whitespace-nowrap">
                        Mark ready
                      </button>
                    )}
                    {p.status === 'ready' && (
                      <button onClick={() => publishPost(p.id)} disabled={!status?.connected || publishing === p.id}
                        className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant hover:text-on-surface whitespace-nowrap disabled:opacity-40">
                        {publishing === p.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Publish
                      </button>
                    )}
                    <button onClick={() => deletePost(p.id)} className="p-1.5 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant/40 hover:text-on-surface-variant">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {composeFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setComposeFor(null)}>
          <div className="glass-card p-4 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold flex items-center gap-1.5"><Linkedin size={14} /> {composeFor.topic}</h3>
              <button onClick={() => setComposeFor(null)}><X size={16} className="text-on-surface-variant" /></button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {TONES.map((t) => (
                <button key={t} onClick={() => setComposeTone(t)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border capitalize transition ${composeTone === t ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
                  {t}
                </button>
              ))}
              <button onClick={expandIdea} disabled={expanding === composeFor.id}
                className="ml-auto flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant hover:text-on-surface whitespace-nowrap">
                {expanding === composeFor.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Expand with AI
              </button>
            </div>

            {expanding === composeFor.id ? (
              <div className="flex items-center justify-center h-32"><Loader2 size={18} className="animate-spin text-on-surface-variant" /></div>
            ) : (
              <textarea value={composeText} onChange={(e) => setComposeText(e.target.value)} rows={8}
                placeholder="Write, or use Expand with AI to draft from the idea..."
                className="w-full text-[13px] text-on-surface whitespace-pre-wrap border border-white/10 rounded-md p-3 bg-white/[0.02] resize-none" />
            )}

            <div className="flex gap-2 mt-3">
              <button onClick={() => navigator.clipboard.writeText(composeText)} className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/[0.05]">
                <Copy size={12} /> Copy
              </button>
              <button onClick={saveAsDraftPost} disabled={!composeText.trim()} className="btn-accent text-[11px] px-3 py-1.5 disabled:opacity-40">
                Save as draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
