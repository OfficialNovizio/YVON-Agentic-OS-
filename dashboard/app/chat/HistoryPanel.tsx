// HistoryPanel — previous chats, living in chat's sidebar slot (2026-08-21).
//
// A DockRail destination, the same slot TasksPanel and TeamsPanel occupy.
// Lists the caller's own thread rooms (GET /api/chat/threads), newest
// activity first; clicking one reopens that room in the main column.
//
// Real data only: every row is a chat_rooms row with kind='thread' plus its
// real chat_messages. Nothing here is synthesised, and nothing here deletes
// — the archive control sets archived_at, so the messages stay in the
// database for the usage and graph views that read them.
'use client'

import { useCallback, useEffect, useState } from 'react'
import { History, RefreshCw, Plus, MessageSquare } from 'lucide-react'
import type { ChatThread } from '@/app/api/chat/threads/route'

interface HistoryPanelProps {
  activeRoomId: string | null
  /** Passes the whole thread, not just the id: the page needs the title to
   *  register the room locally (thread rooms are absent from /api/chat/rooms). */
  onOpen: (thread: ChatThread) => void
  onNewChat: () => void
  /** Bumped by the page whenever a thread is created, to force a reload. */
  refreshToken?: number
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

export function HistoryPanel({ activeRoomId, onOpen, onNewChat, refreshToken }: HistoryPanelProps) {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/chat/threads', { credentials: 'same-origin' })
      const data = (await res.json()) as { threads?: ChatThread[]; error?: string }
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      setThreads(data.threads ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  // Reload on mount, whenever a new thread is created, and on a slow poll so
  // a title that only materialises after the first message shows up without
  // the user having to do anything.
  useEffect(() => {
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [load, refreshToken])

  return (
    <div className="chat-glass flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--chat-hairline)] px-4 py-3.5">
        <History className="h-4 w-4 text-[var(--chat-accent)]" strokeWidth={1.75} />
        <span className="adora-display text-[14px] font-semibold">History</span>
        <button onClick={load} aria-label="Refresh" className="chat-ghost-btn ml-auto h-6 w-6">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
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
            <button
              key={t.id}
              onClick={() => onOpen(t)}
              className={`w-full rounded-[12px] px-3 py-2.5 text-left transition ${
                active
                  ? 'bg-[var(--chat-surface-strong)] text-[var(--chat-text)]'
                  : 'text-[var(--chat-text-dim)] hover:bg-[var(--chat-surface-strong)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageSquare
                  className={`h-3.5 w-3.5 shrink-0 ${active ? 'text-[var(--chat-accent)]' : 'text-[var(--chat-text-faint)]'}`}
                  strokeWidth={1.75}
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{t.title}</span>
                <span className="shrink-0 text-[10.5px] text-[var(--chat-text-faint)]">
                  {relativeTime(t.lastMessageAt ?? t.createdAt)}
                </span>
              </div>
              {t.preview && (
                <div className="mt-1 truncate pl-[22px] text-[11.5px] text-[var(--chat-text-faint)]">
                  {t.preview}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
