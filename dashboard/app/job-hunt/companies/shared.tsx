'use client'

// Shared bits between /job-hunt/companies (curated watchlist) and
// /job-hunt/companies/leads (raw OrgBook BC leads review) — extracted
// 2026-08-15 so both pages use the same Add/Promote form instead of two
// copies drifting apart. Adora restyle 2026-08-25 (light gallery tokens).

import { useState, useEffect, useMemo, useRef } from 'react'
import { Modal } from '@/components/Modal'
import { ChevronDown, X, Search } from 'lucide-react'
import { PROVINCES, citiesFor } from '@/lib/job-hunt/canada-geo'

export const INDUSTRIES = ['Aerospace', 'IT', 'Trucking', 'Drone', 'Business']

// Generic multi-select popover — pill trigger + checkbox list, optional
// search box for the city picker (1080 possible entries, province picker
// (13 entries) doesn't need one). Closes on outside click.
export function MultiSelect({
  label, allLabel, options, selected, onChange, searchable,
}: {
  label: string
  allLabel: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (next: string[]) => void
  searchable?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query, searchable])

  const toggle = (value: string) => {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value])
  }

  const triggerText = selected.length === 0 ? allLabel
    : selected.length === 1 ? (options.find((o) => o.value === selected[0])?.label ?? selected[0])
    : `${label}: ${selected.length} selected`

  const triggerCls = selected.length > 0
    ? 'border-transparent bg-[rgba(89,46,255,0.08)] text-[var(--chat-accent)]'
    : 'border-[var(--chat-hairline)] bg-white text-[var(--chat-text-dim)] hover:border-[var(--chat-text-faint)]'

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 rounded-[200px] border px-3 py-1.5 text-[11.5px] font-medium transition ${triggerCls}`}>
        {triggerText} <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 max-h-72 w-56 overflow-y-auto rounded-[16px] border border-[var(--chat-hairline)] bg-white p-1.5 shadow-[0_18px_44px_-32px_rgba(33,22,76,0.4)]">
          {selected.length > 0 && (
            <button onClick={() => onChange([])}
              className="mb-1 flex w-full items-center gap-1 rounded-[8px] px-2 py-1 text-[10.5px] text-[var(--chat-text-faint)] hover:bg-[rgba(89,46,255,0.05)] hover:text-[var(--chat-body)]">
              <X size={10} /> Clear ({selected.length})
            </button>
          )}
          {searchable && (
            <div className="mb-1 flex items-center gap-1.5 rounded-[8px] border border-[var(--chat-hairline)] bg-white px-2 py-1">
              <Search size={11} className="shrink-0 text-[var(--chat-text-faint)]" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cities…" autoFocus
                className="w-full bg-transparent text-[11px] text-[var(--chat-body)] outline-none placeholder:text-[var(--chat-text-faint)]" />
            </div>
          )}
          {filtered.length === 0 ? (
            <p className="px-2 py-2 text-[10.5px] italic text-[var(--chat-text-faint)]">No matches.</p>
          ) : (
            filtered.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-1 text-[11.5px] text-[var(--chat-text-dim)] hover:bg-[rgba(89,46,255,0.05)]">
                <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)}
                  className="accent-[#592eff]" />
                {o.label}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export interface AddForm {
  name: string
  industry: string
  province: string
  city: string
  size: string
  description: string
  domain: string
  careers_url: string
}

export const EMPTY_FORM: AddForm = { name: '', industry: '', province: '', city: '', size: 'medium', description: '', domain: '', careers_url: '' }

// Add / confirm-a-suggestion / promote-a-lead modal. Three callers: a fully
// blank manual add (any real company, hiring or not), confirming a
// suggestion pulled from real Discover postings (name + city prefilled),
// and promoting a raw OrgBook BC lead (name + province=BC + industry_guess
// prefilled) — all just fill in AddForm differently and POST the same way.
export function AddCompanyModal({
  open, prefill, onClose, onSaved,
}: {
  open: boolean
  prefill?: Partial<AddForm>
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<AddForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) { setForm({ ...EMPTY_FORM, ...prefill }); setError(null) }
  }, [open, prefill])

  const cityOptions = useMemo(() => (form.province ? citiesFor([form.province]) : []), [form.province])

  const submit = async () => {
    if (!form.name.trim() || !form.industry || !form.province) {
      setError('Name, industry, and province are required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/job-hunt/companies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          industry: form.industry,
          province: form.province,
          city: form.city.trim() || null,
          size: form.size,
          description: form.description.trim() || null,
          domain: form.domain.trim() || null,
          careers_url: form.careers_url.trim() || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? `HTTP ${res.status}`)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(String(err instanceof Error ? err.message : err))
    }
    setSaving(false)
  }

  const labelCls = 'mb-1 block text-[10.5px] uppercase tracking-wide text-[var(--chat-text-faint)]'
  const inputCls = 'w-full rounded-[10px] border border-[var(--chat-hairline)] bg-white px-2.5 py-1.5 text-[12.5px] text-[var(--chat-body)] outline-none placeholder:text-[var(--chat-text-faint)] focus:border-[var(--chat-accent)]'

  return (
    <Modal open={open} onClose={onClose} title="Add company" subtitle="Any real company you want to track — doesn't need an active posting."
      footer={(
        <>
          <button onClick={onClose} className="chat-ghost-btn rounded-[10px] px-3 py-1.5 text-[12px]">Cancel</button>
          <button onClick={submit} disabled={saving}
            className="rounded-[10px] bg-[#592eff] px-3.5 py-1.5 text-[12px] font-semibold text-white hover:bg-[#4520cc] disabled:opacity-50">
            {saving ? 'Adding…' : 'Add company'}
          </button>
        </>
      )}>
      <div className="flex flex-col gap-3">
        {error && <p className="text-[11.5px] text-[#b91c1c]">{error}</p>}
        <div>
          <label className={labelCls}>Name *</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Company name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Industry *</label>
            <select value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} className={inputCls}>
              <option value="">Select…</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Size</label>
            <select value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} className={inputCls}>
              {['startup', 'small', 'medium', 'large', 'enterprise'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Province *</label>
            <select value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value, city: '' }))} className={inputCls}>
              <option value="">Select…</option>
              {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputCls}
              placeholder={form.province ? 'Type or pick below' : 'Pick a province first'} list="city-datalist" />
            <datalist id="city-datalist">{cityOptions.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} rows={2} placeholder="What do they do?" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Domain</label>
            <input value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} className={inputCls} placeholder="company.com" />
          </div>
          <div>
            <label className={labelCls}>Careers URL</label>
            <input value={form.careers_url} onChange={(e) => setForm((f) => ({ ...f, careers_url: e.target.value }))} className={inputCls} placeholder="https://…" />
          </div>
        </div>
      </div>
    </Modal>
  )
}
