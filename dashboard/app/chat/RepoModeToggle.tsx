// RepoModeToggle — Local / GitHub working-repo toggle, sits beside
// VentureSelector in the /chat top bar (2026-08-11 feature, discovery via
// AskUserQuestion: one repo per venture, allowlist = whatever's set in
// Settings → Venture → Technical, no arbitrary URL entry here).
//
// GitHub is only selectable when the ACTIVE venture has a repoUrl — no
// fetch of its own, reads the same shared `ventures` list VentureSelector
// uses (WorkspaceContext), and the same yvon_active_venture cookie
// VentureSelector validates against, so "current venture" never disagrees
// between the two controls.
//
// Writes yvon_repo_mode ('local' | 'github') via /api/set-repo-mode.
// Lighter than VentureSelector's reload — repo mode only affects the next
// /api/chat/stream call, which reads the cookie fresh per-request
// (artifact 2), so no page reload is needed here.
//
// Owner: mia · repo-mode toggle, 2026-08-11
'use client'

import { useEffect, useState } from 'react'
import { FolderGit2, Github } from 'lucide-react'
import { useWorkspace } from '@/lib/WorkspaceContext'

type RepoMode = 'local' | 'github'

function readVentureCookie(): string {
  const match = document.cookie.match(/(?:^|;\s*)yvon_active_venture=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : 'yvon-os'
}

function readModeCookie(): RepoMode {
  const match = document.cookie.match(/(?:^|;\s*)yvon_repo_mode=([^;]+)/)
  return match && match[1] === 'github' ? 'github' : 'local'
}

async function postMode(mode: RepoMode) {
  await fetch('/api/set-repo-mode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  })
}

export function RepoModeToggle() {
  const { ventures } = useWorkspace()
  const [mode, setMode] = useState<RepoMode>('local')
  const [busy, setBusy] = useState(false)

  const activeSlug = typeof document !== 'undefined' ? readVentureCookie() : 'yvon-os'
  const activeVenture = ventures.find((v) => v.slug === activeSlug)
  const canGithub = !!activeVenture?.repoUrl

  useEffect(() => {
    setMode(readModeCookie())
  }, [])

  // If the active venture changes to one with no linked repo while GitHub
  // mode was selected, fall back to local rather than silently sending a
  // stale/mismatched repo URL on the next message.
  useEffect(() => {
    if (mode === 'github' && !canGithub) {
      setMode('local')
      void postMode('local')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlug, canGithub])

  const select = async (next: RepoMode) => {
    if (next === mode || busy) return
    if (next === 'github' && !canGithub) return
    setBusy(true)
    try {
      await postMode(next)
      setMode(next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="flex items-center overflow-hidden rounded-[200px] border border-[var(--chat-hairline)] bg-white p-0.5 text-[11.5px] font-medium"
      role="group"
      aria-label="Working repo"
    >
      <button
        onClick={() => select('local')}
        disabled={busy}
        aria-pressed={mode === 'local'}
        title="Work in the VPS agent's default local directory"
        className={`flex items-center gap-1 px-2 py-1 transition disabled:opacity-50 ${
          mode === 'local' ? 'rounded-[200px] bg-[var(--chat-accent)] text-white' : 'rounded-[200px] text-[var(--chat-text-dim)] hover:bg-[var(--chat-surface-strong)]'
        }`}
      >
        <FolderGit2 className="h-3 w-3" />
        Local
      </button>
      <div className="h-4 w-px bg-[var(--chat-hairline-soft)]" />
      <button
        onClick={() => select('github')}
        disabled={busy || !canGithub}
        aria-pressed={mode === 'github'}
        title={
          canGithub
            ? `Clone/pull ${activeVenture?.repoUrl} and work in it`
            : 'No repo linked to this venture — set one in Settings → Venture → Technical'
        }
        className={`flex items-center gap-1 px-2 py-1 transition disabled:opacity-40 disabled:cursor-not-allowed ${
          mode === 'github' ? 'rounded-[200px] bg-[var(--chat-accent)] text-white' : 'rounded-[200px] text-[var(--chat-text-dim)] hover:bg-[var(--chat-surface-strong)]'
        }`}
      >
        <Github className="h-3 w-3" />
        GitHub
      </button>
    </div>
  )
}
