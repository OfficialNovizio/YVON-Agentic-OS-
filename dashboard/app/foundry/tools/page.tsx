// /foundry/tools — Live tool registry from Hermes API.
// Owner: mia · TS-018 WI-3
'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader, StatusBadge, Card } from '@/components/ui'
import { listToolsets, hermesGet } from '@/lib/hermes-api'
import { Wrench, Loader2, ChevronDown, ChevronRight, FileText } from 'lucide-react'

interface Toolset {
  name: string
  description?: string
  tools?: string[]
  enabled?: boolean
}

export default function FoundryToolsPage() {
  const [toolsets, setToolsets] = useState<Toolset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const fetchToolsets = useCallback(async () => {
    try {
      setError(null)
      const data = await listToolsets()
      setToolsets(Array.isArray(data) ? data as Toolset[] : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tools')
      setToolsets([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchToolsets() }, [fetchToolsets])

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <PageHeader title="Tools" subtitle="Loading..." />
        <div className="flex items-center justify-center h-48 text-on-surface-variant">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading toolsets…
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Tools"
        subtitle="Shared tool registry — toolsets, CLIs, and libraries available to agents."
        actions={
          <StatusBadge tone={toolsets.length > 0 ? 'green' : 'muted'}>
            {toolsets.length} toolsets
          </StatusBadge>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-[12px] text-red-400">
          {error}
          <button onClick={fetchToolsets} className="ml-2 underline hover:no-underline">Retry</button>
        </div>
      )}

      {toolsets.length === 0 && !error && (
        <Card className="p-8 text-center">
          <Wrench size={32} className="text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant">No toolsets registered.</p>
          <p className="text-[12px] text-on-surface-variant/50 mt-1">
            Toolsets appear here once configured in Hermes.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {toolsets.map(toolset => (
          <Card key={toolset.name} className="overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Wrench size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-on-surface">{toolset.name}</h3>
                    {toolset.enabled !== undefined && (
                      <StatusBadge tone={toolset.enabled ? 'green' : 'muted'}>
                        {toolset.enabled ? 'Enabled' : 'Disabled'}
                      </StatusBadge>
                    )}
                    {toolset.tools && (
                      <StatusBadge tone="muted">{toolset.tools.length} tools</StatusBadge>
                    )}
                  </div>
                  {toolset.description && (
                    <p className="text-xs text-on-surface-variant mt-1">{toolset.description}</p>
                  )}
                  {toolset.tools && toolset.tools.length > 0 && (
                    <>
                      <button
                        onClick={() => setExpanded(prev => ({ ...prev, [toolset.name]: !prev[toolset.name] }))}
                        className="flex items-center gap-1 mt-2 text-[11px] text-primary/80 hover:text-primary transition"
                      >
                        {expanded[toolset.name] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        {expanded[toolset.name] ? 'Hide tools' : `Show ${toolset.tools.length} tools`}
                      </button>
                      {expanded[toolset.name] && (
                        <div className="mt-2 space-y-1">
                          {toolset.tools.map(tool => (
                            <div key={tool} className="flex items-center gap-2 rounded-lg bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-on-surface-variant">
                              <FileText size={11} />
                              {tool}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
