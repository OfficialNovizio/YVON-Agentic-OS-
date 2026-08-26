'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, MessageSquareText, Linkedin, Copy, X } from 'lucide-react'
import { AtelierBackdrop, Squiggle } from '../../chat/Atelier'
import '../../chat/chat.css'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — NETWORK CRM (2026-08-15 · Adora restyle 2026-08-25)
// ═══════════════════════════════════════════════════════════════════════════
// Third Job Hunt artifact, folded in per operator instruction. Schema +
// AI message-drafter pulled from the operator's own prior YVON-OS design
// (network_contacts + contact_interactions). Drafts only — nothing is ever
// sent automatically, matches the rest of Job Hunt's human-in-the-loop model.

interface Contact {
  id: string
  name: string
  title: string | null
  company: string | null
  industry_tag: string | null
  linkedin_url: string | null
  how_met: string | null
  relationship_type: string
  relationship_strength: string
  last_contacted: string | null
  next_action: string | null
  notes: string | null
}

const STRENGTH_TONE: Record<string, string> = {
  strong: 'bg-[rgba(16,185,129,0.12)] text-[#047857]',
  medium: 'bg-[rgba(89,46,255,0.08)] text-[var(--chat-accent)]',
  weak: 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-faint)]',
}

const INPUT_CLS = 'flex-1 rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2.5 py-1.5 text-[13px] text-[var(--chat-body)] placeholder:text-[var(--chat-text-faint)] focus:border-[var(--chat-accent)] focus:outline-none'

function daysAgo(iso: string | null): string {
  if (!iso) return 'never'
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (d === 0) return 'today'
  return `${d}d ago`
}

export default function JobHuntNetworkPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [drafting, setDrafting] = useState<string | null>(null)
  const [draftFor, setDraftFor] = useState<Contact | null>(null)
  const [draftText, setDraftText] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/job-hunt/network/contacts')
      const data = await res.json()
      setContacts(data.contacts ?? [])
    } catch {
      setContacts([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const addContact = useCallback(async () => {
    if (!newName.trim()) return
    await fetch('/api/job-hunt/network/contacts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), company: newCompany.trim() || null, title: newTitle.trim() || null }),
    })
    setNewName(''); setNewCompany(''); setNewTitle(''); setAdding(false)
    load()
  }, [newName, newCompany, newTitle, load])

  const draftMessage = useCallback(async (c: Contact) => {
    setDrafting(c.id); setDraftFor(c); setDraftText('')
    try {
      const res = await fetch('/api/job-hunt/network/message', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: c }),
      })
      const data = await res.json()
      setDraftText(data.message ?? data.error ?? '')
    } catch {
      setDraftText('Could not generate a message.')
    }
    setDrafting(null)
  }, [])

  const logInteraction = useCallback(async (contactId: string) => {
    await fetch('/api/job-hunt/network/interactions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contact_id: contactId, type: 'linkedin_message' }),
    })
    load()
  }, [load])

  return (
    <div className="chat-shell relative min-h-screen overflow-hidden">
      <AtelierBackdrop />

      <div className="relative z-10 mx-auto max-w-[1240px] px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="adora-display text-[30px] font-bold leading-[1.1] tracking-[-0.02em] text-[var(--chat-text)] md:text-[34px]">
              <Squiggle>Network</Squiggle>
            </h1>
            <p className="mt-2 max-w-[640px] text-[13.5px] leading-[1.55] text-[var(--chat-text-dim)]">
              Relationship tracker + AI-drafted re-engagement messages. Nothing is ever sent automatically — you copy, you send.
            </p>
          </div>
          <button onClick={() => setAdding((v) => !v)}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-[#592eff] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#4520cc]">
            <Plus size={14} /> Add contact
          </button>
        </div>

        {adding && (
          <div className="chat-glass mt-4 flex flex-col items-start gap-2 p-3.5 sm:flex-row sm:items-center">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name" className={INPUT_CLS} />
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title" className={INPUT_CLS} />
            <input value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="Company" className={INPUT_CLS} />
            <button onClick={addContact} className="whitespace-nowrap rounded-[10px] bg-[#592eff] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#4520cc]">Save</button>
          </div>
        )}

        {loading ? (
          <div className="flex h-32 items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--chat-text-faint)]" /></div>
        ) : contacts.length === 0 ? (
          <p className="py-8 text-center text-sm italic text-[var(--chat-text-faint)]">No contacts yet — add the people worth staying warm with.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {contacts.map((c) => (
              <div key={c.id} className="chat-glass flex items-start justify-between gap-3 p-3.5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold text-[var(--chat-body)]">{c.name}</span>
                    <span className={`rounded-[200px] px-1.5 py-0.5 text-[10px] capitalize ${STRENGTH_TONE[c.relationship_strength] ?? 'bg-[var(--chat-surface-strong)] text-[var(--chat-text-faint)]'}`}>{c.relationship_strength}</span>
                    {c.industry_tag && <span className="rounded border border-[var(--chat-hairline)] px-1.5 py-0.5 text-[10px] text-[var(--chat-text-faint)]">{c.industry_tag}</span>}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--chat-text-faint)]">
                    {[c.title, c.company].filter(Boolean).join(' at ')}{c.title || c.company ? ' — ' : ''}last contacted {daysAgo(c.last_contacted)}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {c.linkedin_url && (
                    <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer"
                      className="rounded-[10px] border border-[var(--chat-hairline)] p-1.5 text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)] hover:text-[var(--chat-body)]">
                      <Linkedin size={13} />
                    </a>
                  )}
                  <button onClick={() => draftMessage(c)} disabled={drafting === c.id}
                    className="flex items-center gap-1 rounded-[10px] border border-[var(--chat-hairline)] px-2 py-1.5 text-[11px] text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)] hover:text-[var(--chat-body)]">
                    {drafting === c.id ? <Loader2 size={12} className="animate-spin" /> : <MessageSquareText size={12} />} Draft message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {draftFor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDraftFor(null)}>
            <div className="chat-glass w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--chat-body)]">Message for {draftFor.name}</h3>
                <button onClick={() => setDraftFor(null)}><X size={16} className="text-[var(--chat-text-faint)]" /></button>
              </div>
              {drafting ? (
                <div className="flex h-24 items-center justify-center"><Loader2 size={18} className="animate-spin text-[var(--chat-text-faint)]" /></div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap rounded-[12px] border border-[var(--chat-hairline)] bg-white p-3 text-[13px] text-[var(--chat-body)]">{draftText}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(draftText)}
                      className="flex items-center gap-1 rounded-[10px] border border-[var(--chat-hairline)] px-3 py-1.5 text-[11px] text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)]">
                      <Copy size={12} /> Copy
                    </button>
                    <button onClick={() => { logInteraction(draftFor.id); setDraftFor(null) }}
                      className="rounded-[10px] bg-[#592eff] px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-[#4520cc]">
                      Mark as sent
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
