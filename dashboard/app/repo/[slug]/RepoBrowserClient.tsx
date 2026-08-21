'use client'

// Client half of /repo/[slug] — see page.tsx's header comment for the
// feature this belongs to. Deliberately dependency-light: no code editor
// library, no virtualized list — a plain filtered file list + a <pre>
// viewer is enough for "let me see what Hermes is actually working on."
import { useEffect, useMemo, useState } from 'react'

interface TreeEntry {
  path: string
  type: 'file' | 'dir'
  size?: number | null
}

interface TreeResponse {
  workdir?: string
  truncated?: boolean
  entries?: TreeEntry[]
  error?: string
}

interface FileResponse {
  path?: string
  content?: string
  error?: string
}

function formatBytes(n: number | null | undefined): string {
  if (n == null) return ''
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function RepoBrowserClient({ ventureSlug }: { ventureSlug: string }) {
  const [tree, setTree] = useState<TreeResponse | null>(null)
  const [treeError, setTreeError] = useState<string | null>(null)
  const [treeLoading, setTreeLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [fileLoading, setFileLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setTreeLoading(true)
    setTreeError(null)
    fetch(`/api/repo/tree?venture=${encodeURIComponent(ventureSlug)}`)
      .then((r) => r.json())
      .then((body: TreeResponse) => {
        if (cancelled) return
        if (body.error) {
          setTreeError(body.error)
          setTree(null)
        } else {
          setTree(body)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setTreeError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!cancelled) setTreeLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [ventureSlug])

  const files = useMemo(() => {
    const all = (tree?.entries ?? []).filter((e) => e.type === 'file')
    const q = filter.trim().toLowerCase()
    const filtered = q ? all.filter((e) => e.path.toLowerCase().includes(q)) : all
    return filtered.sort((a, b) => a.path.localeCompare(b.path))
  }, [tree, filter])

  function openFile(path: string): void {
    setSelectedPath(path)
    setFileContent(null)
    setFileError(null)
    setFileLoading(true)
    fetch(`/api/repo/file?venture=${encodeURIComponent(ventureSlug)}&path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((body: FileResponse) => {
        if (body.error) {
          setFileError(body.error)
        } else {
          setFileContent(body.content ?? '')
        }
      })
      .catch((err: unknown) => setFileError(err instanceof Error ? err.message : String(err)))
      .finally(() => setFileLoading(false))
  }

  return (
    <div className="flex h-screen min-h-0 flex-col bg-white text-[14px] text-gray-900">
      <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-3">
        <h1 className="text-[15px] font-semibold">Repo files · {ventureSlug}</h1>
        {tree?.workdir && (
          <span className="truncate text-[12px] text-gray-400">{tree.workdir}</span>
        )}
        {tree?.truncated && (
          <span className="rounded bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
            list truncated — showing the first batch of files
          </span>
        )}
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-72 shrink-0 flex-col border-r border-gray-200">
          <div className="border-b border-gray-200 p-2">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter files…"
              className="w-full rounded border border-gray-200 px-2 py-1 text-[13px] outline-none focus:border-gray-400"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {treeLoading && <p className="p-3 text-[13px] text-gray-400">Loading…</p>}
            {treeError && (
              <p className="p-3 text-[13px] text-red-600">
                {treeError}
                {treeError.includes('no repo cloned') && (
                  <>
                    {' '}— link a repo in Settings → Venture → Technical, or send a chat message first
                    so Hermes clones it.
                  </>
                )}
              </p>
            )}
            {!treeLoading && !treeError && files.length === 0 && (
              <p className="p-3 text-[13px] text-gray-400">No files match.</p>
            )}
            <ul>
              {files.map((f) => (
                <li key={f.path}>
                  <button
                    onClick={() => openFile(f.path)}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-gray-50 ${
                      selectedPath === f.path ? 'bg-gray-100 font-medium' : ''
                    }`}
                    title={f.path}
                  >
                    <span className="truncate">{f.path}</span>
                    <span className="shrink-0 text-[11px] text-gray-400">{formatBytes(f.size)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-auto">
          {!selectedPath && (
            <p className="p-6 text-[13px] text-gray-400">Pick a file on the left to view it.</p>
          )}
          {selectedPath && (
            <div className="flex h-full min-h-0 flex-col">
              <div className="shrink-0 border-b border-gray-200 px-4 py-2 text-[13px] font-medium">
                {selectedPath}
              </div>
              <div className="min-h-0 flex-1 overflow-auto">
                {fileLoading && <p className="p-4 text-[13px] text-gray-400">Loading…</p>}
                {fileError && <p className="p-4 text-[13px] text-red-600">{fileError}</p>}
                {!fileLoading && !fileError && fileContent != null && (
                  <pre className="whitespace-pre-wrap break-words p-4 font-mono text-[12.5px] leading-5">
                    {fileContent}
                  </pre>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
