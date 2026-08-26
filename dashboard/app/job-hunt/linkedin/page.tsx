'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, Sparkles, Trash2, X, Copy, Linkedin, Key, Send, CheckCircle2 } from 'lucide-react'
import LinkedInImportSection from './ImportSection'
import { AtelierBackdrop, Squiggle } from '../../chat/Atelier'
import '../../chat/chat.css'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — LINKEDIN CONTENT LAB (2026-08-15 · Adora restyle 2026-08-25)
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
  draft: 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-faint)]',
  ready: 'bg-[rgba(89,46,255,0.08)] text-[var(--chat-accent)]',
  scheduled: 'bg-[rgba(89,46,255,0.08)] text-[var(--chat-accent)]',
  published: 'bg-[rgba(16,185,129,0.12)] text-[#047857]',
  new: 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-faint)]',
  expanded: 'bg-[rgba(89,46,255,0.08)] text-[var(--chat-accent)]',
}

interface ConnectionStatus {
  app_configured: boolean
  connected: boolean
  expired: boolean
  person_name: string | null
  person_headline: string | null
}

const chip = (active: boolean) =>
  `rounded-[200px] px-3 py-1.5 text-[11.5px] font-medium transition border transition-colors ` +
  (active
    ? 'border-transparent bg-[rgba(89,46,255,0.08)] text-[var(--chat-accent)]'
    : 'border-[var(--chat-hairline)] bg-white text-[var(--chat-text-dim)] hover:border-[var(--chat-text-faint)]')

const INPUT_CLS = 'flex-1 rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2.5 py-1.5 text-[12px] text-[var(--chat-body)] placeholder:text-[var(--chat-text-faint)] focus:border-[var(--chat-accent)] focus:outline-none'

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
    <div className="chat-shell relative min-h-screen overflow-hidden">
      <AtelierBackdrop />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="adora-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--chat-text)] md:text-[34px]">
              <Squiggle>LinkedIn</Squiggle>
            </h1>
            <p className="mt-2 max-w-[640px] text-[13.5px] leading-[1.55] text-[var(--chat-text-dim)]">
              Content Lab — capture post ideas, expand them with AI, keep drafts ready. Nothing publishes automatically
              yet; connecting your account for real posting is a separate step, not built here.
            </p>
          </div>
          <button onClick={() => setAddingIdea((v) => !v)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-[#592eff] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#4520cc]">
            <Plus size={14} /> New idea
          </button>
        </div>

        <div className="chat-glass mt-6 flex flex-col gap-2 p-3.5">
          {status?.connected ? (
            <div className="flex flex-wrap items-center gap-2">
              <CheckCircle2 size={14} className="shrink-0 text-[#047857]" />
              <span className="text-[12.5px] text-[var(--chat-body)]">
                Connected as <span className="font-medium">{status.person_name}</span>
              </span>
              <a href="/api/job-hunt/linkedin/connect" className="ml-auto text-[11px] text-[var(--chat-text-dim)] underline decoration-dotted hover:text-[var(--chat-accent)]">
                Reconnect
              </a>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Linkedin size={14} className="shrink-0 text-[var(--chat-text-faint)]" />
              <span className="text-[12.5px] text-[var(--chat-text-dim)]">
                {status?.expired ? 'LinkedIn connection expired.' : 'Not connected — publishing is disabled until you connect your account.'}
              </span>
              {status?.app_configured ? (
                <a href="/api/job-hunt/linkedin/connect" className="ml-auto flex items-center gap-1 whitespace-nowrap rounded-[10px] bg-[#592eff] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#4520cc]">
                  <Linkedin size={12} /> Connect LinkedIn
                </a>
              ) : (
                <button onClick={() => setAppSetupOpen((v) => !v)} className="ml-auto flex items-center gap-1 whitespace-nowrap text-[11px] text-[var(--chat-text-dim)] underline decoration-dotted hover:text-[var(--chat-accent)]">
                  <Key size={11} /> set up LinkedIn app credentials
                </button>
              )}
            </div>
          )}

          {appSetupOpen && !status?.app_configured && (
            <div className="flex flex-col gap-2 rounded-[12px] border border-[var(--chat-hairline)] bg-white p-2.5">
              <span className="text-[11px] text-[var(--chat-text-faint)]">
                Create an app at developer.linkedin.com (request the &quot;Sign In with LinkedIn using OpenID Connect&quot; and &quot;Share on LinkedIn&quot; products), then paste its credentials here. Nothing is sent to LinkedIn until you click Connect above.
              </span>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Client ID" className={INPUT_CLS} />
                <input value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} placeholder="Client Secret" type="password" className={INPUT_CLS} />
              </div>
              <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                <input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} placeholder="Redirect URI" className={INPUT_CLS} />
                <span className="whitespace-nowrap text-[10.5px] text-[var(--chat-text-faint)]">↑ add this exact URL as an authorized redirect URL on the LinkedIn app</span>
              </div>
              <button onClick={saveAppCredentials} className="self-start rounded-[10px] bg-[#592eff] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#4520cc]">Save</button>
            </div>
          )}
        </div>

        <LinkedInImportSection />

        {addingIdea && (
          <div className="chat-glass mt-4 flex flex-col gap-2 p-3.5">
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic (short)" className={INPUT_CLS} />
            <textarea value={roughIdea} onChange={(e) => setRoughIdea(e.target.value)} placeholder="Rough idea / notes (optional)" rows={2}
              className={`${INPUT_CLS} resize-none`} />
            <div className="flex flex-wrap items-center gap-1.5">
              {INDUSTRIES.map((ind) => (
                <button key={ind} onClick={() => setIndustryTag(industryTag === ind ? '' : ind)} className={chip(industryTag === ind)}>
                  {ind}
                </button>
              ))}
              <button onClick={addIdea} className="ml-auto whitespace-nowrap rounded-[10px] bg-[#592eff] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#4520cc]">Save idea</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--chat-text-faint)]" /></div>
        ) : (
          <>
            <h3 className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--chat-text-faint)]">Idea bank</h3>
            {ideas.length === 0 ? (
              <p className="py-4 text-center text-sm italic text-[var(--chat-text-faint)]">No ideas yet — jot down anything worth posting about.</p>
            ) : (
              <div className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {ideas.map((idea) => (
                  <div key={idea.id} className="chat-glass flex flex-col gap-1.5 p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-semibold text-[var(--chat-body)]">{idea.topic}</span>
                      <button onClick={() => deleteIdea(idea.id)} className="shrink-0 text-[var(--chat-text-faint)] hover:text-[var(--chat-body)]">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {idea.rough_idea && <p className="line-clamp-2 text-[11.5px] text-[var(--chat-text-dim)]">{idea.rough_idea}</p>}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-[200px] px-1.5 py-0.5 text-[10px] capitalize ${STATUS_TONE[idea.status] ?? 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-faint)]'}`}>{idea.status}</span>
                      {idea.industry_tag && <span className="rounded border border-[var(--chat-hairline)] px-1.5 py-0.5 text-[10px] text-[var(--chat-text-faint)]">{idea.industry_tag}</span>}
                      <button onClick={() => openCompose(idea)}
                        className="ml-auto flex items-center gap-1 rounded-[10px] border border-[var(--chat-hairline)] px-2 py-1 text-[11px] text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)] hover:text-[var(--chat-body)]">
                        <Sparkles size={11} /> Compose
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--chat-text-faint)]">Drafts &amp; schedule</h3>
            {posts.length === 0 ? (
              <p className="py-4 text-center text-sm italic text-[var(--chat-text-faint)]">No drafted posts yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {posts.map((p) => (
                  <div key={p.id} className="chat-glass flex items-start justify-between gap-3 p-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className={`rounded-[200px] px-1.5 py-0.5 text-[10px] capitalize ${STATUS_TONE[p.status] ?? 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-faint)]'}`}>{p.status}</span>
                        <span className="rounded border border-[var(--chat-hairline)] px-1.5 py-0.5 text-[10px] text-[var(--chat-text-faint)]">{p.industry_tag}</span>
                        <span className="text-[10px] capitalize text-[var(--chat-text-faint)]">{p.tone}</span>
                      </div>
                      <p className="line-clamp-3 whitespace-pre-wrap text-[12.5px] text-[var(--chat-text-dim)]">{p.content}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button onClick={() => navigator.clipboard.writeText(p.content)}
                        className="rounded-[10px] border border-[var(--chat-hairline)] p-1.5 text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)] hover:text-[var(--chat-body)]">
                        <Copy size={12} />
                      </button>
                      {p.status === 'draft' && (
                        <button onClick={() => setPostStatus(p.id, 'ready')} className="whitespace-nowrap rounded-[10px] border border-[var(--chat-hairline)] px-2 py-1.5 text-[11px] text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)] hover:text-[var(--chat-body)]">
                          Mark ready
                        </button>
                      )}
                      {p.status === 'ready' && (
                        <button onClick={() => publishPost(p.id)} disabled={!status?.connected || publishing === p.id}
                          className="flex items-center gap-1 whitespace-nowrap rounded-[10px] border border-[var(--chat-hairline)] px-2 py-1.5 text-[11px] text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)] hover:text-[var(--chat-body)] disabled:opacity-40">
                          {publishing === p.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Publish
                        </button>
                      )}
                      <button onClick={() => deletePost(p.id)} className="rounded-[10px] border border-[var(--chat-hairline)] p-1.5 text-[var(--chat-text-faint)] hover:text-[var(--chat-body)]">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {composeFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setComposeFor(null)}>
            <div className="chat-glass w-full max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-[var(--chat-body)]"><Linkedin size={14} className="text-[var(--chat-accent)]" /> {composeFor.topic}</h3>
                <button onClick={() => setComposeFor(null)}><X size={16} className="text-[var(--chat-text-faint)]" /></button>
              </div>

              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {TONES.map((t) => (
                  <button key={t} onClick={() => setComposeTone(t)} className={`${chip(composeTone === t)} capitalize`}>
                    {t}
                  </button>
                ))}
                <button onClick={expandIdea} disabled={expanding === composeFor.id}
                  className="ml-auto flex items-center gap-1 whitespace-nowrap rounded-[10px] border border-[var(--chat-hairline)] px-3 py-1.5 text-[11px] text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)] hover:text-[var(--chat-body)]">
                  {expanding === composeFor.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Expand with AI
                </button>
              </div>

              {expanding === composeFor.id ? (
                <div className="flex h-32 items-center justify-center"><Loader2 size={18} className="animate-spin text-[var(--chat-text-faint)]" /></div>
              ) : (
                <textarea value={composeText} onChange={(e) => setComposeText(e.target.value)} rows={8}
                  placeholder="Write, or use Expand with AI to draft from the idea..."
                  className="w-full resize-none whitespace-pre-wrap rounded-[12px] border border-[var(--chat-hairline)] bg-white p-3 text-[13px] text-[var(--chat-body)]" />
              )}

              <div className="mt-3 flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(composeText)}
                  className="flex items-center gap-1 rounded-[10px] border border-[var(--chat-hairline)] px-3 py-1.5 text-[11px] text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)]">
                  <Copy size={12} /> Copy
                </button>
                <button onClick={saveAsDraftPost} disabled={!composeText.trim()}
                  className="rounded-[10px] bg-[#592eff] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#4520cc] disabled:opacity-40">
                  Save as draft
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
