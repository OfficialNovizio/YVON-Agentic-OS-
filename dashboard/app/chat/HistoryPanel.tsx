// HistoryPanel — previous chats, living in chat's sidebar slot (2026-08-21).
//
// A DockRail destination, the same slot TasksPanel and TeamsPanel occupy.
// Lists the caller's own thread rooms (GET /api/chat/threads), newest
// activity first; clicking one reopens that room in the main column.
//
// Real data only: every row is a real chat_rooms row plus its real
// chat_messages. Nothing here is synthesised, and nothing here deletes — the
// X writes a row to chat_room_hidden (per-user, reversible), so the room and
// every message stay exactly where they are for the usage and graph views
// that read them.
'use client'

import { useCallback, useEffect, useState } from 'react'
import { History, RefreshCw, Plus, MessageSquare, Users, Hash, X, ChevronsLeft, ChevronsRight } from 'lucide-react'
import type { ChatThread } from '@/app/api/chat/threads/route'

interface HistoryPanelProps {
  activeRoomId: string | null
  /** Passes the whole thread, not just the id: the page needs the title to
   *  register the room locally (thread rooms are absent from /api/chat/rooms). */
  onOpen: (thread: ChatThread) => void
  onNewChat: () => void
  /** Bumped by the page whenever a thread is created, to force a reload. */
  refreshToken?: number
  /** Collapse the sidebar. Every panel in this slot gets the same control —
   *  previously only TeamsPanel had one, so collapsing from Workforce left no
   *  way to collapse (or notice the collapse) from Tasks or History. */
  onCollapse?: () => void
  /** True when the page has shrunk this slot to a rail. The panel MUST render
   *  its own rail in that case — the container is 64px wide and clips
   *  anything else mid-word ("Hist…", "Ne cha…"), which is what a collapse
   *  button without a collapsed state produced. */
  collapsed?: boolean
  onExpand?: () => void
}

/** "3m ago" / "2h ago" / "Yesterday" / "12 Aug" — compact, never a raw ISO. */
function relativeTime(iso: string | null): string {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.floor((Date.now() - then) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  if (hours < 48) return 'yesterday'
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

/** Icon per room kind, so a past Workforce conversation is recognisable. */
function KindIcon({ kind, active }: { kind: ChatThread['kind']; active: boolean }) {
  const cls = `h-3.5 w-3.5 shrink-0 ${active ? 'text-[var(--chat-accent)]' : 'text-[var(--chat-text-faint)]'}`
  if (kind === 'whole_team' || kind === 'assigned_scope') return <Users className={cls} strokeWidth={1.75} />
  if (kind === 'department') return <Hash className={cls} strokeWidth={1.75} />
  return <MessageSquare className={cls} strokeWidth={1.75} />
}

export function HistoryPanel({ activeRoomId, onOpen, onNewChat, refreshToken, onCollapse, collapsed, onExpand }: HistoryPanelProps) {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [archiving, setArchiving] = useState<string | null>(null)
  // Hiding must be reversible — an accidental X on a ten-hour room should not
  // be permanent. hiddenCount comes from the server so the toggle only shows
  // when there is actually something to restore.
  const [hiddenCount, setHiddenCount] = useState(0)
  const [showHidden, setShowHidden] = useState(false)

  const load = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch(`/api/chat/threads${showHidden ? '?includeHidden=1' : ''}`, {
        credentials: 'same-origin',
      })
      const data = (await res.json()) as {
        threads?: ChatThread[]
        hiddenCount?: number
        error?: string
      }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setThreads(data.threads ?? [])
      setHiddenCount(data.hiddenCount ?? 0)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [showHidden])

  // Reload on mount, whenever a new thread is created, and on a slow poll so
  // a title that only materialises after the first message shows up without
  // the user having to do anything.
  useEffect(() => {
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [load, refreshToken])

  const archive = useCallback(
    async (thread: ChatThread) => {
      if (archiving) return
      setArchiving(thread.id)
      // Optimistic: the row disappears immediately, and `load()` below puts it
      // back if the server disagreed.
      setThreads((prev) => prev.filter((t) => t.id !== thread.id))
      try {
        const restore = thread.hidden ? '&restore=1' : ''
        const res = await fetch(
          `/api/chat/threads?roomId=${encodeURIComponent(thread.id)}${restore}`,
          { method: 'DELETE', credentials: 'same-origin' },
        )
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          throw new Error(body?.error ?? `HTTP ${res.status}`)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setArchiving(null)
        load()
      }
    },
    [archiving, load],
  )

  if (collapsed) {
    return (
      <div className="flex h-full w-full flex-col items-center rounded-[200px] border border-[var(--chat-hairline)] bg-white py-3">
        <button
          onClick={onExpand}
          title="Expand History"
          aria-label="Expand History"
          className="chat-ghost-btn h-9 w-9"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
        <History className="mt-2 h-4 w-4 text-[var(--chat-text-faint)]" strokeWidth={1.75} />
      </div>
    )
  }

  return (
    <div className="chat-glass flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--chat-hairline)] px-4 py-3.5">
        <History className="h-4 w-4 text-[var(--chat-accent)]" strokeWidth={1.75} />
        <span className="adora-display text-[14px] font-semibold">History</span>
        <button onClick={load} aria-label="Refresh" className="chat-ghost-btn ml-auto h-6 w-6">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
        {onCollapse && (
          <button onClick={onCollapse} aria-label="Collapse sidebar" title="Collapse sidebar" className="chat-ghost-btn h-6 w-6">
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-3 pt-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-[12px] border border-dashed border-[var(--chat-hairline)] px-3 py-2 text-[13px] text-[var(--chat-text-dim)] transition hover:border-[var(--chat-accent)] hover:text-[var(--chat-accent)]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          New chat
        </button>
      </div>

      <div className="chat-scroll flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {loading && threads.length === 0 && (
          <div className="px-2 py-8 text-center text-[12.5px] text-[var(--chat-text-faint)]">Loading…</div>
        )}

        {error && (
          <div className="rounded-[12px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] px-3 py-2 text-[12px] text-[#b91c1c]">
            {error}
          </div>
        )}

        {!loading && !error && threads.length === 0 && (
          <div className="px-2 py-8 text-center text-[12.5px] leading-relaxed text-[var(--chat-text-faint)]">
            No previous chats yet.
            <br />
            Start one and it will appear here.
          </div>
        )}

        {threads.map((t) => {
          const active = t.id === activeRoomId
          return (
            <div
              key={t.id}
              className={`group relative rounded-[12px] transition ${
                active
                  ? 'bg-[var(--chat-surface-strong)] text-[var(--chat-text)]'
                  : 'text-[var(--chat-text-dim)] hover:bg-[var(--chat-surface-strong)]'
              }`}
            >
              <button onClick={() => onOpen(t)} className="w-full px-3 py-2.5 text-left">
                <div className="flex items-center gap-2">
                  <KindIcon kind={t.kind} active={active} />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{t.title}</span>
                  <span className="shrink-0 text-[10.5px] text-[var(--chat-text-faint)] group-hover:opacity-0">
                    {relativeTime(t.lastMessageAt ?? t.createdAt)}
                  </span>
                </div>
                {t.preview && (
                  <div className="mt-1 truncate pl-[22px] text-[11.5px] text-[var(--chat-text-faint)]">
                    {t.preview}
                  </div>
                )}
              </button>

              {/* Archive, threads only — the fixed rooms are recreated on every
                  load, so offering to remove one would be a lie. */}
              {t.canArchive && (
                <button
                  onClick={() => archive(t)}
                  disabled={archiving === t.id}
                  aria-label={`Remove "${t.title}" from History`}
                  title={
                    t.kind === 'thread'
                      ? 'Remove from History — messages are kept in the database'
                      : 'Hide from History — the room stays on the dock rail and keeps working'
                  }
                  className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center rounded-full text-[var(--chat-text-faint)] transition hover:bg-[rgba(239,68,68,0.1)] hover:text-[#b91c1c] disabled:opacity-40 group-hover:flex"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
          )
        })}
        {hiddenCount > 0 && (
          <button
            onClick={() => setShowHidden((v) => !v)}
            className="mt-2 w-full rounded-[10px] px-3 py-2 text-left text-[11.5px] text-[var(--chat-text-faint)] transition hover:text-[var(--chat-text-dim)]"
          >
            {showHidden
              ? 'Hide removed chats'
              : `${hiddenCount} removed chat${hiddenCount === 1 ? '' : 's'} — show`}
          </button>
        )}
      </div>
    </div>
  )
}
