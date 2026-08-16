'use client'

// Shared bits between /job-hunt/companies (curated watchlist) and
// /job-hunt/companies/leads (raw OrgBook BC leads review) — extracted
// 2026-08-15 so both pages use the same Add/Promote form instead of two
// copies drifting apart.

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

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full border transition ${selected.length ? 'border-white/25 bg-white/[0.06] text-on-surface' : 'border-white/10 text-on-surface-variant/60'}`}>
        {triggerText} <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-56 max-h-72 overflow-y-auto rounded-lg border border-white/10 bg-surface-container-high shadow-xl p-1.5">
          {selected.length > 0 && (
            <button onClick={() => onChange([])}
              className="w-full flex items-center gap-1 text-[10.5px] px-2 py-1 rounded text-on-surface-variant/60 hover:text-on-surface hover:bg-white/[0.04] mb-1">
              <X size={10} /> Clear ({selected.length})
            </button>
          )}
          {searchable && (
            <div className="flex items-center gap-1.5 px-2 py-1 mb-1 rounded border border-white/10 bg-white/[0.02]">
              <Search size={11} className="text-on-surface-variant/50 shrink-0" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cities…" autoFocus
                className="w-full bg-transparent text-[11px] text-on-surface outline-none placeholder:text-on-surface-variant/40" />
            </div>
          )}
          {filtered.length === 0 ? (
            <p className="text-[10.5px] text-on-surface-variant/50 italic px-2 py-2">No matches.</p>
          ) : (
            filtered.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-[11.5px] px-2 py-1 rounded hover:bg-white/[0.04] cursor-pointer text-on-surface-variant">
                <input type="checkbox" checked={selected.includes(o.value)} onChange={() => toggle(o.value)}
                  className="accent-primary" />
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

  const inputCls = 'w-full text-[12.5px] px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.02] text-on-surface placeholder:text-on-surface-variant/40 outline-none focus:border-white/25'

  return (
    <Modal open={open} onClose={onClose} title="Add company" subtitle="Any real company you want to track — doesn't need an active posting."
      footer={(
        <>
          <button onClick={onClose} className="text-[12px] px-3 py-1.5 rounded-lg border border-white/10 text-on-surface-variant">Cancel</button>
          <button onClick={submit} disabled={saving}
            className="text-[12px] px-3 py-1.5 rounded-lg bg-primary text-on-primary disabled:opacity-50">
            {saving ? 'Adding…' : 'Add company'}
          </button>
        </>
      )}>
      <div className="flex flex-col gap-3">
        {error && <p className="text-[11.5px] text-red-400">{error}</p>}
        <div>
          <label className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/60 mb-1 block">Name *</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="Company name" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/60 mb-1 block">Industry *</label>
            <select value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} className={inputCls}>
              <option value="">Select…</option>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/60 mb-1 block">Size</label>
            <select value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} className={inputCls}>
              {['startup', 'small', 'medium', 'large', 'enterprise'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/60 mb-1 block">Province *</label>
            <select value={form.province} onChange={(e) => setForm((f) => ({ ...f, province: e.target.value, city: '' }))} className={inputCls}>
              <option value="">Select…</option>
              {PROVINCES.map((p) => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/60 mb-1 block">City</label>
            <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputCls}
              placeholder={form.province ? 'Type or pick below' : 'Pick a province first'} list="city-datalist" />
            <datalist id="city-datalist">{cityOptions.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
        </div>
        <div>
          <label className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/60 mb-1 block">Description</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={inputCls} rows={2} placeholder="What do they do?" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/60 mb-1 block">Domain</label>
            <input value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} className={inputCls} placeholder="company.com" />
          </div>
          <div>
            <label className="text-[10.5px] uppercase tracking-wide text-on-surface-variant/60 mb-1 block">Careers URL</label>
            <input value={form.careers_url} onChange={(e) => setForm((f) => ({ ...f, careers_url: e.target.value }))} className={inputCls} placeholder="https://…" />
          </div>
        </div>
      </div>
    </Modal>
  )
}
