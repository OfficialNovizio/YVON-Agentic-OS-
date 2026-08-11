'use client'

// Real AI Provider settings — replaces the old static "DeepSeek v4 Pro" label.
// Backed by the pre-existing /api/ai-keys CRUD (dashboard/app/api/ai-keys/route.ts),
// which was fully built but never wired to a UI or to Hermes. This card is the UI
// half; main.py's _agent_for() is the Hermes half (reads the is_active=true row
// per new session — see vps-scripts/yvon-hermes-http/main.py).
//
// Only one provider can be is_active at a time — the API enforces this
// server-side (unsets the others), this UI just reflects that as a radio,
// not independent toggles.

import { useState, useEffect, useCallback } from 'react'
import { Card, StatusBadge } from '@/components/ui'
import { Cpu, Plus, Trash2, Pencil, X, Check, Loader2, PlugZap, CircleX } from 'lucide-react'
import { detectProviderFromUrl, PROVIDER_MODELS, PROVIDER_DISPLAY_ORDER } from '@/lib/providers'

interface ProviderRow {
  id: string
  provider: string
  fast_model: string
  synthesis_model: string
  tertiary_model: string
  is_active: boolean
  updated_at: string
  apiKeyMasked: string
  base_url: string
}

const inputCls =
  'w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[13px] text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-white/25'

type FormMode = 'anthropic' | 'custom'

function emptyForm() {
  return {
    mode: 'anthropic' as FormMode,
    provider: 'anthropic',
    label: 'Anthropic',
    apiKey: '',
    baseUrl: '',
    fastModel: '',
    synthesisModel: '',
    tertiaryModel: '',
  }
}

export default function AIProviderCard() {
  const [rows, setRows] = useState<ProviderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [editing, setEditing] = useState<string | null>(null) // provider id being edited, or 'new'
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [busyProvider, setBusyProvider] = useState<string | null>(null)

  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; error?: string } | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/ai-keys')
      .then((r) => r.json())
      .then((d) => { setRows(d.providers ?? []); setError(d.error ?? null) })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  function startAdd() {
    setForm(emptyForm())
    setSaveError(null)
    setTestResult(null)
    setEditing('new')
  }

  function startEdit(row: ProviderRow) {
    const known = PROVIDER_MODELS[row.provider as keyof typeof PROVIDER_MODELS]
    setForm({
      mode: known ? 'anthropic' : 'custom',
      provider: row.provider,
      label: row.provider,
      apiKey: '', // never prefilled — leaving blank on save keeps the existing key
      baseUrl: row.base_url ?? '',
      fastModel: row.fast_model ?? '',
      synthesisModel: row.synthesis_model ?? '',
      tertiaryModel: row.tertiary_model ?? '',
    })
    setSaveError(null)
    setTestResult(null)
    setEditing(row.provider)
  }

  async function testConnection() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch('/api/ai-keys/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: form.provider,
          apiKey: form.apiKey.trim(),
          baseUrl: form.mode === 'custom' ? form.baseUrl.trim() : undefined,
          fastModel: form.fastModel.trim(),
        }),
      })
      const d = await res.json()
      setTestResult({ ok: !!d.ok, error: d.error })
    } catch (e) {
      setTestResult({ ok: false, error: e instanceof Error ? e.message : String(e) })
    } finally {
      setTesting(false)
    }
  }

  function onBaseUrlChange(url: string) {
    setTestResult(null)
    const detected = detectProviderFromUrl(url)
    // Strip parenthetical asides like "Anthropic (use native tab)" before
    // slugifying — otherwise the stored provider id is garbage and won't
    // match hermes-agent's plugin names (main.py's _PROVIDER_STRING_MAP).
    const slug = detected
      ? detected.label.replace(/\s*\(.*?\)\s*/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-+|-+$)/g, '')
      : null
    setForm((f) => ({
      ...f,
      baseUrl: url,
      provider: slug ?? (f.provider === 'anthropic' ? 'custom' : f.provider),
      label: detected?.label ?? f.label,
      fastModel: f.fastModel || detected?.primary || '',
      synthesisModel: f.synthesisModel || detected?.secondary || '',
      tertiaryModel: f.tertiaryModel || detected?.tertiary || '',
    }))
  }

  async function save() {
    setSaving(true)
    setSaveError(null)
    try {
      const isNewOrRekey = editing === 'new' || form.apiKey.trim().length > 0
      const res = await fetch('/api/ai-keys', {
        method: isNewOrRekey ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: form.provider,
          apiKey: form.apiKey.trim() || undefined,
          baseUrl: form.mode === 'anthropic' ? undefined : form.baseUrl.trim(),
          fastModel: form.fastModel.trim(),
          synthesisModel: form.synthesisModel.trim(),
          tertiaryModel: form.tertiaryModel.trim(),
          isActive: editing === 'new' ? rows.length === 0 : undefined, // first provider added defaults active
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error ?? `HTTP ${res.status}`)
      setEditing(null)
      load()
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  async function setActive(provider: string) {
    setBusyProvider(provider)
    try {
      await fetch('/api/ai-keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, isActive: true }),
      })
      load()
    } finally {
      setBusyProvider(null)
    }
  }

  async function remove(provider: string) {
    setBusyProvider(provider)
    try {
      await fetch('/api/ai-keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      })
      load()
    } finally {
      setBusyProvider(null)
    }
  }

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu size={16} style={{ color: 'var(--ws-accent)' }} />
          <h3 className="text-sm font-semibold text-on-surface">AI Provider</h3>
        </div>
        {editing === null && (
          <button
            onClick={startAdd}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--ws-accent)] px-3 py-1.5 text-[12px] font-medium text-[#06121f] hover:opacity-90"
          >
            <Plus size={14} /> Add Provider
          </button>
        )}
      </div>

      <p className="mb-3 text-[12px] text-on-surface-variant/60">
        System-wide model provider for Hermes — not per-venture. Whichever provider is
        active here is what new chat sessions use. Configure more than one and switch
        the active one any time; changing it applies to new sessions, not ones already
        in progress.
      </p>

      {error && <p className="mb-3 text-[12px] text-red-400">{error}</p>}

      {loading && (
        <div className="flex items-center gap-2 py-4 text-[12px] text-on-surface-variant/60">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      )}

      {!loading && rows.length === 0 && editing === null && (
        <p className="py-3 text-[12px] text-on-surface-variant/60">No providers configured yet. Add one above.</p>
      )}

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.provider}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
              row.is_active ? 'border-[var(--ws-accent)] bg-white/[0.06]' : 'border-white/[0.08] bg-white/[0.02]'
            }`}
          >
            <button
              onClick={() => !row.is_active && setActive(row.provider)}
              disabled={row.is_active || busyProvider === row.provider}
              title={row.is_active ? 'Active' : 'Set active'}
              className="shrink-0"
            >
              {row.is_active ? (
                <span className="flex h-4 w-4 items-center justify-center rounded-full" style={{ background: 'var(--ws-accent)' }}>
                  <Check size={11} className="text-[#06121f]" />
                </span>
              ) : (
                <span className="h-4 w-4 rounded-full border border-white/25 hover:border-white/50" />
              )}
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[13px] font-medium capitalize text-on-surface">{row.provider}</span>
                {row.is_active && <StatusBadge tone="green">active</StatusBadge>}
              </div>
              <div className="truncate text-[11px] text-on-surface-variant/60">
                {row.apiKeyMasked} · {row.synthesis_model || row.fast_model || 'default model'}
                {row.base_url ? ` · ${row.base_url}` : ''}
              </div>
            </div>

            <button onClick={() => startEdit(row)} className="shrink-0 rounded-md p-1.5 text-on-surface-variant hover:bg-white/10 hover:text-on-surface">
              <Pencil size={13} />
            </button>
            <button
              onClick={() => remove(row.provider)}
              disabled={busyProvider === row.provider}
              className="shrink-0 rounded-md p-1.5 text-on-surface-variant hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {editing !== null && (
        <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-medium text-on-surface">{editing === 'new' ? 'Add Provider' : `Edit ${editing}`}</div>
            <button onClick={() => setEditing(null)} className="text-on-surface-variant hover:text-on-surface"><X size={15} /></button>
          </div>

          {editing === 'new' && (
            <div className="flex gap-2">
              {PROVIDER_DISPLAY_ORDER.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setForm((f) => ({ ...f, mode, provider: mode, label: PROVIDER_MODELS[mode].label, baseUrl: mode === 'anthropic' ? PROVIDER_MODELS.anthropic.baseUrl : '' }))}
                  className={`rounded-lg px-3 py-1.5 text-[12px] font-medium ${
                    form.mode === mode ? 'bg-[var(--ws-accent)] text-[#06121f]' : 'bg-white/[0.06] text-on-surface-variant hover:bg-white/10'
                  }`}
                >
                  {PROVIDER_MODELS[mode].label}
                </button>
              ))}
            </div>
          )}

          {form.mode === 'custom' && (
            <div>
              <label className="mb-1 block text-[11px] text-on-surface-variant/60">Base URL</label>
              <input
                value={form.baseUrl}
                onChange={(e) => onBaseUrlChange(e.target.value)}
                placeholder="https://api.deepseek.com/v1"
                className={inputCls}
              />
              {form.provider !== 'custom' && form.baseUrl && (
                <p className="mt-1 text-[11px] text-on-surface-variant/60">Detected: {form.label}</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-[11px] text-on-surface-variant/60">
              API Key {editing !== 'new' && '(leave blank to keep the existing key)'}
            </label>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => { setTestResult(null); setForm((f) => ({ ...f, apiKey: e.target.value })) }}
              placeholder={editing === 'new' ? 'sk-…' : '••••••••'}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] text-on-surface-variant/60">Fast model</label>
              <input value={form.fastModel} onChange={(e) => setForm((f) => ({ ...f, fastModel: e.target.value }))} placeholder="haiku / mini" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-on-surface-variant/60">Synthesis model</label>
              <input value={form.synthesisModel} onChange={(e) => setForm((f) => ({ ...f, synthesisModel: e.target.value }))} placeholder="sonnet / chat" className={inputCls} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-on-surface-variant/60">Tertiary model (optional)</label>
              <input value={form.tertiaryModel} onChange={(e) => setForm((f) => ({ ...f, tertiaryModel: e.target.value }))} placeholder="opus / reasoner" className={inputCls} />
            </div>
          </div>

          {testResult && (
            <p className={`flex items-center gap-1.5 text-[12px] ${testResult.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {testResult.ok ? <Check size={13} /> : <CircleX size={13} />}
              {testResult.ok ? 'Connected — key and model both work.' : testResult.error}
            </p>
          )}

          {saveError && <p className="text-[12px] text-red-400">{saveError}</p>}

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving || (editing === 'new' && !form.apiKey.trim())}
              className="rounded-lg bg-[var(--ws-accent)] px-4 py-1.5 text-[12px] font-medium text-[#06121f] hover:opacity-90 disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditing(null)} className="rounded-lg bg-white/10 px-3 py-1.5 text-[12px] text-on-surface-variant hover:bg-white/20">
              Cancel
            </button>
            <button
              onClick={testConnection}
              disabled={testing || !form.apiKey.trim()}
              title={!form.apiKey.trim() ? 'Enter a key to test' : undefined}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] text-on-surface-variant hover:bg-white/10 hover:text-on-surface disabled:opacity-40"
            >
              {testing ? <Loader2 size={13} className="animate-spin" /> : <PlugZap size={13} />}
              {testing ? 'Testing…' : 'Test Connection'}
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
