'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui'
import { Loader2, Plus, MessageSquareText, Linkedin, Copy, X } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
//  JOB HUNT — NETWORK CRM (2026-08-15)
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
  strong: 'bg-emerald-400/10 text-emerald-300',
  medium: 'bg-tertiary/15 text-tertiary',
  weak: 'bg-white/5 text-on-surface-variant',
}

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
    <div>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Network</h1>
          <p className="mt-1 text-sm text-on-surface-variant max-w-2xl">
            Relationship tracker + AI-drafted re-engagement messages. Nothing is ever sent automatically — you copy, you send.
          </p>
        </div>
        <button onClick={() => setAdding((v) => !v)} className="btn-accent flex items-center gap-1.5 text-xs px-3 py-2 whitespace-nowrap">
          <Plus size={14} /> Add contact
        </button>
      </div>

      {adding && (
        <Card className="p-3.5 mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Name"
            className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-on-surface flex-1" />
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Title"
            className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-on-surface flex-1" />
          <input value={newCompany} onChange={(e) => setNewCompany(e.target.value)} placeholder="Company"
            className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[13px] text-on-surface flex-1" />
          <button onClick={addContact} className="btn-accent text-[11px] px-3 py-1.5 whitespace-nowrap">Save</button>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><Loader2 size={20} className="animate-spin text-on-surface-variant" /></div>
      ) : contacts.length === 0 ? (
        <p className="text-sm text-on-surface-variant/60 italic py-8 text-center">No contacts yet — add the people worth staying warm with.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {contacts.map((c) => (
            <Card key={c.id} className="p-3.5 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-medium text-on-surface">{c.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize ${STRENGTH_TONE[c.relationship_strength] ?? 'bg-white/5 text-on-surface-variant'}`}>{c.relationship_strength}</span>
                  {c.industry_tag && <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-on-surface-variant/60">{c.industry_tag}</span>}
                </div>
                <div className="mt-1 text-[11px] text-on-surface-variant/70">
                  {[c.title, c.company].filter(Boolean).join(' at ')}{c.title || c.company ? ' — ' : ''}last contacted {daysAgo(c.last_contacted)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {c.linkedin_url && (
                  <a href={c.linkedin_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant hover:text-on-surface">
                    <Linkedin size={13} />
                  </a>
                )}
                <button onClick={() => draftMessage(c)} disabled={drafting === c.id}
                  className="flex items-center gap-1 text-[11px] px-2 py-1.5 rounded-md border border-white/10 hover:bg-white/[0.05] text-on-surface-variant hover:text-on-surface">
                  {drafting === c.id ? <Loader2 size={12} className="animate-spin" /> : <MessageSquareText size={12} />} Draft message
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {draftFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDraftFor(null)}>
          <div className="glass-card p-4 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold">Message for {draftFor.name}</h3>
              <button onClick={() => setDraftFor(null)}><X size={16} className="text-on-surface-variant" /></button>
            </div>
            {drafting ? (
              <div className="flex items-center justify-center h-24"><Loader2 size={18} className="animate-spin text-on-surface-variant" /></div>
            ) : (
              <>
                <p className="text-[13px] text-on-surface whitespace-pre-wrap border border-white/10 rounded-md p-3 bg-white/[0.02]">{draftText}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => navigator.clipboard.writeText(draftText)} className="flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-md border border-white/10 hover:bg-white/[0.05]">
                    <Copy size={12} /> Copy
                  </button>
                  <button onClick={() => { logInteraction(draftFor.id); setDraftFor(null) }} className="btn-accent text-[11px] px-3 py-1.5">
                    Mark as sent
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
