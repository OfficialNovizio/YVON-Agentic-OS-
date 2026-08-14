'use client'

import { Card, StatusBadge } from '@/components/ui'
import { GitBranch, ExternalLink, Database, Cpu, Server, Shield, Monitor, Smartphone, Save, FolderGit2, KeyRound, Rocket } from 'lucide-react'
import { LocalRepoPathPicker } from './LocalRepoPathPicker'

// ═══════════════════════════════════════════════════════════════════════════
//  PROPS
// ═══════════════════════════════════════════════════════════════════════════
interface SystemHealth {
  supabaseConnected: boolean; agentsLive: number; tokenSpentToday: number
  deepseekBalance: number | null; status: string
}

interface TechnicalTabProps {
  repoUrl: string; setRepoUrl: (v: string) => void
  /** local_repo_path column (migration 038) — existed in the schema with no
   * UI field until now (2026-08-11). Used by the /chat repo-mode toggle's
   * "Local" side and by War Room's local repo mode (hermes-spawn.ts) so
   * agents work directly on this machine's checkout instead of GitHub. */
  localRepoPath: string; setLocalRepoPath: (v: string) => void
  notionUrl: string; setNotionUrl: (v: string) => void
  websiteUrl: string
  iosAppUrl: string
  androidAppUrl: string
  sysHealth: SystemHealth | null
  /** Bug fix (2026-08-11): this tab had no Save control of its own — edits
   * here only landed in shared parent state, so unless you switched to
   * General (the only tab with a Save button) and clicked it, nothing was
   * ever sent to the server. Wired to the same saveAll() General/Deployment
   * use, so this tab now saves independently too. */
  saveAll: () => void
  saving: boolean
  saveMsg: string
  /** Write-scoped GitHub PAT for the graphify + MemPalace onboarding
   * pipeline (2026-08-14). Write-only by design — never populated from the
   * server (GET /api/ventures never returns it, see
   * lib/db/venture-graphify.ts) — so this field always starts empty and
   * clears itself after a successful send, same UX as any "rotate secret"
   * field: you can set it, you can't read it back. */
  githubPat: string; setGithubPat: (v: string) => void
  triggerGraphify: () => void
  triggering: boolean
  triggerMsg: string
}

// ═══════════════════════════════════════════════════════════════════════════
//  TECHNICAL TAB
// ═══════════════════════════════════════════════════════════════════════════
export default function TechnicalTab({
  repoUrl, setRepoUrl, localRepoPath, setLocalRepoPath, notionUrl, setNotionUrl,
  websiteUrl, iosAppUrl, androidAppUrl, sysHealth, saveAll, saving, saveMsg,
  githubPat, setGithubPat, triggerGraphify, triggering, triggerMsg,
}: TechnicalTabProps) {
  const s = sysHealth

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2"><GitBranch size={15} style={{ color: 'var(--ws-accent)' }} /><h3 className="text-sm font-semibold">Repository</h3></div>
        <div className="flex flex-col gap-1 mb-3">
          <label className="text-[11px] text-on-surface-variant/60 uppercase tracking-wider">Repo URL (GitHub)</label>
          <input value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo.git"
            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-white/20" />
          {repoUrl && <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1 mt-0.5"><ExternalLink size={11} /> Open</a>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] text-on-surface-variant/60 uppercase tracking-wider flex items-center gap-1">
            <FolderGit2 size={11} /> Local Repo Path
          </label>
          <input value={localRepoPath} onChange={e => setLocalRepoPath(e.target.value)} placeholder="/Users/you/path/to/repo"
            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-white/20" />
          <LocalRepoPathPicker value={localRepoPath} onSelect={setLocalRepoPath} />
          <p className="text-[11px] text-on-surface-variant/50 mt-0.5">
            Absolute path on the machine running the dashboard. Used by /chat&apos;s Local repo-mode and War Room&apos;s local mode to work directly on this checkout instead of GitHub.
          </p>
        </div>

        {/* Graphify + MemPalace onboarding (2026-08-14) — building this
            repo's structural graph + semantic knowledge is automatic on
            every future repoUrl save IF a PAT is already on file; this is
            where that PAT gets set the first time (or rotated later). */}
        <div className="flex flex-col gap-1 mt-3 pt-3 border-t border-white/[0.06]">
          <label className="text-[11px] text-on-surface-variant/60 uppercase tracking-wider flex items-center gap-1">
            <KeyRound size={11} /> GitHub PAT (write access, for graph + memory build)
          </label>
          <input
            type="password"
            value={githubPat}
            onChange={e => setGithubPat(e.target.value)}
            placeholder={repoUrl ? 'github_pat_… (Contents: Read and write)' : 'Set a Repo URL above first'}
            disabled={!repoUrl}
            autoComplete="off"
            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-white/20 disabled:opacity-40"
          />
          <p className="text-[11px] text-on-surface-variant/50 mt-0.5">
            Fine-grained token scoped to this repo only, with Contents: Read and write — different
            from (and more powerful than) chat&apos;s read-only repo-mode token. Write-only: never
            shown back once saved, only whether it&apos;s connected.
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <button
              onClick={triggerGraphify}
              disabled={triggering || !repoUrl}
              className="btn-accent flex items-center gap-1.5 text-xs px-3 py-1.5 disabled:opacity-40"
            >
              <Rocket size={13} /> {triggering ? 'Starting…' : githubPat ? 'Save PAT & Build' : 'Rebuild Now'}
            </button>
            {triggerMsg && (
              <span className={`text-xs ${triggerMsg.startsWith('Build started') ? 'text-emerald-400' : 'text-red-400'}`}>
                {triggerMsg}
              </span>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2"><Database size={15} style={{ color: 'var(--ws-accent)' }} /><h3 className="text-sm font-semibold">Database</h3></div>
        <div className="space-y-1.5 text-[13px]">
          <div className="flex justify-between"><span className="text-on-surface-variant">Supabase</span><StatusBadge tone={s?.supabaseConnected ? 'green' : 'red'}>{s?.supabaseConnected ? 'Connected' : 'Offline'}</StatusBadge></div>
          <div className="flex justify-between"><span className="text-on-surface-variant">Tokens today</span><span className="text-on-surface">{s?.tokenSpentToday ? (s.tokenSpentToday / 1000).toFixed(1) + 'K' : '...'}</span></div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2"><Cpu size={15} style={{ color: 'var(--ws-accent)' }} /><h3 className="text-sm font-semibold">AI Provider</h3></div>
        <div className="space-y-1.5 text-[13px]">
          <div className="flex justify-between"><span className="text-on-surface-variant">Provider</span><span className="text-on-surface">DeepSeek</span></div>
          <div className="flex justify-between"><span className="text-on-surface-variant">Balance</span><span className={s?.deepseekBalance && s.deepseekBalance > 1 ? 'text-emerald-400' : 'text-on-surface'}>{s?.deepseekBalance != null ? `$${s.deepseekBalance.toFixed(2)}` : '—'}</span></div>
          <div className="flex justify-between"><span className="text-on-surface-variant">Status</span><StatusBadge tone="green">Active</StatusBadge></div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2"><Server size={15} style={{ color: 'var(--ws-accent)' }} /><h3 className="text-sm font-semibold">Software Status</h3></div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px]"><Monitor size={13} className="text-on-surface-variant" /><span className="text-on-surface-variant">Website</span></div>
            {websiteUrl ? <StatusBadge tone="green">Deployed</StatusBadge> : <span className="text-xs text-on-surface-variant/40">Not linked</span>}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px]"><Smartphone size={13} className="text-on-surface-variant" /><span className="text-on-surface-variant">iOS App</span></div>
            {iosAppUrl ? <StatusBadge tone="green">Live</StatusBadge> : <span className="text-xs text-on-surface-variant/40">Not configured</span>}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px]"><Smartphone size={13} className="text-on-surface-variant" /><span className="text-on-surface-variant">Android App</span></div>
            {androidAppUrl ? <StatusBadge tone="green">Live</StatusBadge> : <span className="text-xs text-on-surface-variant/40">Not configured</span>}
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2"><Shield size={15} style={{ color: 'var(--ws-accent)' }} /><h3 className="text-sm font-semibold">Security</h3></div>
        <div className="space-y-1.5 text-[13px]">
          <div className="flex justify-between"><span className="text-on-surface-variant">CSP</span><StatusBadge tone="green">Enabled</StatusBadge></div>
          <div className="flex justify-between"><span className="text-on-surface-variant">HTTPS</span><StatusBadge tone="green">Enforced</StatusBadge></div>
          <div className="flex justify-between"><span className="text-on-surface-variant">Rate Limit</span><StatusBadge tone="green">Active</StatusBadge></div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col gap-1 mb-2">
          <label className="text-[11px] text-on-surface-variant/60 uppercase tracking-wider">Notion Workspace</label>
          <input value={notionUrl} onChange={e => setNotionUrl(e.target.value)} placeholder="notion.so/workspace"
            className="bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-white/20" />
        </div>
        {notionUrl && <a href={notionUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1"><ExternalLink size={11} /> Open</a>}
      </Card>

      {/* Save (2026-08-11 fix — this tab previously had no save control of its own) */}
      <div className="flex items-center gap-3 pb-4 sm:col-span-2">
        <button onClick={saveAll} disabled={saving}
          className="btn-accent flex items-center gap-1.5 text-xs px-4 py-2">
          <Save size={14} /> {saving ? 'Saving...' : 'Save All Changes'}
        </button>
        {saveMsg && <span className={`text-xs ${saveMsg.startsWith('Saved') ? 'text-emerald-400' : 'text-red-400'}`}>{saveMsg}</span>}
      </div>
    </div>
  )
}
