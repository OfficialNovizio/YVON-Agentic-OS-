'use client'

// VPS Server tab (2026-09-04) — live telemetry for the Contabo box
// (hermes.yvon.in), built on the read-only /v1/vps/status + /v1/vps/backup
// endpoints added to yvon-hermes-http main.py the same day.
//
// No mock data on this page, on purpose: a telemetry surface showing invented
// numbers is a lie in the DOM. When the VPS is unreachable the page shows a
// plain error card with a retry button instead.

import { useState } from 'react'
import {
  Cpu, MemoryStick, HardDrive, Container, Clock, Wrench, ShieldCheck,
  ExternalLink, RefreshCw,
} from 'lucide-react'
import { PageHeader, Card, StatusBadge, SectionLabel } from '@/components/ui'
import { useLiveData } from '@/lib/use-live-data'

type Backup = { name: string; size_mb: number; created_at: string }

type VpsStatus = {
  host: string
  os: string | null
  kernel: string | null
  uptime_s: number | null
  cpu: { cores: number | null; usage_pct: number | null; load: number[] | null }
  memory: {
    total_mb: number | null
    available_mb: number | null
    used_mb: number | null
    used_pct: number | null
    swap_total_mb?: number | null
    swap_used_mb?: number | null
  }
  disk: { total_gb: number | null; used_gb: number | null; free_gb: number | null; used_pct: number | null }
  containers: { name: string; image: string; state: string; status: string }[]
  services: { unit: string; state: string; sub: string }[]
  tools: { venvs: string[]; versions: Record<string, string | null> }
  cron_jobs: string[]
  backups: Backup[]
  backup_dir: string
}

const fmtUptime = (s: number | null | undefined): string => {
  if (s === null || s === undefined) return '—'
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  return d > 0 ? `${d}d ${h}h` : `${h}h ${Math.floor((s % 3600) / 60)}m`
}

const fmtPct = (v: number | null | undefined): string =>
  v === null || v === undefined ? '—' : `${v}%`

const fmtMb = (v: number | null | undefined): string =>
  v === null || v === undefined ? '—' : `${(v / 1024).toFixed(1)} GB`

const fmtWhen = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function VpsPage() {
  const { data, loading, error, refetch, source } = useLiveData<VpsStatus>({
    url: '/api/vps/status',
  })
  const [backingUp, setBackingUp] = useState(false)
  const [backupMsg, setBackupMsg] = useState<string | null>(null)

  const runBackup = async () => {
    setBackingUp(true)
    setBackupMsg(null)
    try {
      const res = await fetch('/api/vps/backup', { method: 'POST' })
      const body = await res.json()
      if (body.ok) {
        setBackupMsg(`Backup created: ${body.file} (${body.size_mb} MB)`)
        refetch()
      } else {
        setBackupMsg(`Backup failed: ${body.error ?? 'HTTP ' + res.status}`)
      }
    } catch (err) {
      setBackupMsg(`Backup failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setBackingUp(false)
    }
  }

  const cpuPct = data?.cpu?.usage_pct ?? null
  const mem = data?.memory
  const disk = data?.disk
  const vaultContainer = data?.containers?.find((c) => c.name === 'yvon-vaultwarden')
  const backups = data?.backups ?? []

  return (
    <div>
      <PageHeader
        title="VPS Server"
        subtitle="hermes.yvon.in — live host telemetry, tool inventory, and vault backups. Fetched fresh on open; the refresh button re-probes the box."
      />

      {error && !data?.host ? (
        <Card className="mb-5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-on-surface">VPS unreachable</p>
              <p className="mt-1 text-[12px] text-on-surface-variant">{error}</p>
            </div>
            <button className="btn-ghost !py-1.5 !text-xs" onClick={() => refetch()}>Retry</button>
          </div>
        </Card>
      ) : null}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-on-surface-variant">
            <Clock size={15} style={{ color: 'var(--ws-accent)' }} />
            <span className="text-[12px]">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{fmtUptime(data?.uptime_s)}</p>
          {data?.os ? <p className="mt-1 text-[11px] text-on-surface-variant">{data.os}</p> : null}
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-on-surface-variant">
            <Cpu size={15} style={{ color: 'var(--ws-accent)' }} />
            <span className="text-[12px]">CPU</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">{fmtPct(cpuPct)}</p>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            {data?.cpu?.load
              ? 'load ' + data.cpu.load.map((l) => l.toFixed(2)).join(' / ') + ' / ' + (data?.cpu?.cores ?? '—') + ' cores'
              : (data?.cpu?.cores ?? '—') + ' cores'}
          </p>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-on-surface-variant">
            <MemoryStick size={15} style={{ color: 'var(--ws-accent)' }} />
            <span className="text-[12px]">Memory</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {mem?.used_mb != null && mem?.total_mb != null
              ? fmtMb(mem.used_mb) + ' / ' + fmtMb(mem.total_mb)
              : '—'}
          </p>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            {mem?.used_pct != null ? fmtPct(mem.used_pct) + ' used' : '—'}
            {mem?.swap_total_mb ? ' / swap ' + fmtMb(mem.swap_used_mb ?? 0) + ' / ' + fmtMb(mem.swap_total_mb) : ''}
          </p>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-on-surface-variant">
            <HardDrive size={15} style={{ color: 'var(--ws-accent)' }} />
            <span className="text-[12px]">Storage</span>
          </div>
          <p className="text-2xl font-bold text-on-surface">
            {disk?.used_gb != null && disk?.total_gb != null
              ? disk.used_gb + ' / ' + disk.total_gb + ' GB'
              : '—'}
          </p>
          <p className="mt-1 text-[11px] text-on-surface-variant">
            {disk?.used_pct != null ? fmtPct(disk.used_pct) + ' used / ' + disk.free_gb + ' GB free' : '—'}
          </p>
        </Card>
      </div>

      <SectionLabel>Backups</SectionLabel>
      <div className="mb-5 grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-on-surface">Vault backups</p>
              <p className="mt-1 text-[12px] text-on-surface-variant">
                Weekly cron Mondays 05:00 / manual runs are timestamped
              </p>
              <p className="mt-1 text-[11px] text-on-surface-variant/70">dir: {data?.backup_dir}</p>
            </div>
            <button
              className="btn-ghost !py-1.5 !text-xs"
              onClick={runBackup}
              disabled={backingUp}
            >
              <RefreshCw size={13} className={backingUp ? 'animate-spin' : ''} />
              {backingUp ? 'Backing up…' : 'Backup now'}
            </button>
          </div>
          {backupMsg ? <p className="mt-2 text-[12px] text-on-surface-variant">{backupMsg}</p> : null}
          <div className="mt-3 border-t border-white/6 pt-3">
            {backups.length === 0 ? (
              <p className="text-[12px] italic text-on-surface-variant/60">No backups found</p>
            ) : (
              <ul className="space-y-1.5">
                {backups.slice(0, 5).map((b) => (
                  <li key={b.name} className="flex items-center justify-between text-[12px]">
                    <span className="font-mono text-[11px] text-on-surface">{b.name}</span>
                    <span className="text-on-surface-variant">{b.size_mb} MB / {fmtWhen(b.created_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-on-surface">Secrets vault</p>
              <p className="mt-1 text-[12px] text-on-surface-variant">
                Bitwarden-compatible vault at vault.yvon.in — status mirrored from the containers list.
              </p>
            </div>
            <ShieldCheck size={16} style={{ color: 'var(--ws-accent)' }} />
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-white/6 pt-3">
            <StatusBadge tone={vaultContainer?.state === 'running' ? 'green' : 'red'}>
              {vaultContainer ? vaultContainer.state : 'not found'}
            </StatusBadge>
            <a href="https://vault.yvon.in" target="_blank" rel="noreferrer" className="btn-ghost !py-1.5 !text-xs">
              <ExternalLink size={13} /> Open vault
            </a>
          </div>
          <p className="mt-2 text-[11px] text-on-surface-variant/70">
            Last backup: {backups[0] ? backups[0].name + ' / ' + fmtWhen(backups[0].created_at) : 'none yet'}
          </p>
          <p className="mt-1 text-[11px] text-on-surface-variant/70">
            Guide: Teams/Shared OS/tools/vaultwarden/USING-THE-VAULT.md
          </p>
        </Card>
      </div>
      <SectionLabel>Containers and services</SectionLabel>
      <div className="mb-5 grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-on-surface-variant">
            <Container size={15} style={{ color: 'var(--ws-accent)' }} />
            <span className="text-[12px]">Docker containers</span>
          </div>
          <div className="space-y-1.5">
            {(data?.containers ?? []).length === 0 ? (
              <p className="text-[12px] italic text-on-surface-variant/60">No containers found</p>
            ) : (
              data?.containers.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-[12px]">
                  <span className="font-mono text-[11px] text-on-surface">
                    {c.name} <span className="ml-1 text-on-surface-variant/60">({c.image})</span>
                  </span>
                  <StatusBadge tone={c.state === 'running' ? 'green' : 'muted'}>{c.state}</StatusBadge>
                </div>
              ))
            )}
          </div>
        </Card>
        <Card className="p-4">
          <div className="mb-2 flex items-center gap-2 text-on-surface-variant">
            <Wrench size={15} style={{ color: 'var(--ws-accent)' }} />
            <span className="text-[12px]">yvon-* services</span>
          </div>
          <div className="space-y-1.5">
            {(data?.services ?? []).length === 0 ? (
              <p className="text-[12px] italic text-on-surface-variant/60">No services found</p>
            ) : (
              data?.services.map((s) => {
                const ok = s.state === 'active' && s.sub === 'running'
                return (
                  <div key={s.unit} className="flex items-center justify-between text-[12px]">
                    <span className="font-mono text-[11px] text-on-surface">{s.unit.replace(/\.service$/, '')}</span>
                    <StatusBadge tone={ok ? 'green' : 'red'}>{s.state} / {s.sub}</StatusBadge>
                  </div>
                )
              })
            )}
          </div>
        </Card>
      </div>
      <SectionLabel>Installed tools</SectionLabel>
      <div className="mb-5 grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <p className="mb-2 text-[12px] text-on-surface-variant">Python venvs (/opt/yvon-tools/venvs)</p>
          <div className="flex flex-wrap gap-1.5">
            {(data?.tools?.venvs ?? []).map((v) => (
              <span key={v} className="rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-on-surface">
                {v}
              </span>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <p className="mb-2 text-[12px] text-on-surface-variant">CLI versions</p>
          <div className="space-y-1.5">
            {Object.entries(data?.tools?.versions ?? {}).map(([cli, ver]) => (
              <div key={cli} className="flex items-center justify-between text-[12px]">
                <span className="font-mono text-[11px] text-on-surface">{cli}</span>
                <span className={ver ? 'text-on-surface-variant' : 'italic text-on-surface-variant/60'}>
                  {ver ?? 'not on PATH'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <SectionLabel>Cron jobs (root)</SectionLabel>
      <Card className="p-4">
        {(data?.cron_jobs ?? []).length === 0 ? (
          <p className="text-[12px] italic text-on-surface-variant/60">No cron jobs found</p>
        ) : (
          <ul className="space-y-1">
            {data?.cron_jobs.map((j, i) => (
              <li key={i} className="font-mono text-[11px] text-on-surface-variant">{j}</li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
