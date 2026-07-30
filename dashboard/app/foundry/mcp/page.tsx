// /foundry/mcp — Live MCP server management from Hermes API.
// Owner: mia · TS-018 WI-3
'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageHeader, StatusBadge, Card } from '@/components/ui'
import { listMcpServers, removeMcpServer, toggleMcpServer, testMcpServer, hermesGet } from '@/lib/hermes-api'
import { Plug, Trash2, Play, Power, PowerOff, Loader2, Server, CheckCircle2, XCircle } from 'lucide-react'

interface McpServer {
  name: string
  enabled: boolean
  status?: string
  description?: string
}

export default function FoundryMcpPage() {
  const [servers, setServers] = useState<McpServer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testing, setTesting] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({})

  const fetchServers = useCallback(async () => {
    try {
      setError(null)
      const data = await listMcpServers()
      setServers(Array.isArray(data) ? data as McpServer[] : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load MCP servers')
      setServers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServers() }, [fetchServers])

  const handleToggle = async (name: string, current: boolean) => {
    try {
      await toggleMcpServer(name, !current)
      setServers(prev => prev.map(s => s.name === name ? { ...s, enabled: !current } : s))
    } catch (e) {
      setError(`Failed to toggle ${name}`)
    }
  }

  const handleRemove = async (name: string) => {
    try {
      await removeMcpServer(name)
      setServers(prev => prev.filter(s => s.name !== name))
    } catch (e) {
      setError(`Failed to remove ${name}`)
    }
  }

  const handleTest = async (name: string) => {
    setTesting(name)
    try {
      await testMcpServer(name)
      setTestResults(prev => ({ ...prev, [name]: true }))
    } catch {
      setTestResults(prev => ({ ...prev, [name]: false }))
    } finally {
      setTesting(null)
      setTimeout(() => setTestResults(prev => ({ ...prev, [name]: null })), 3000)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <PageHeader title="MCP Servers" subtitle="Loading..." />
        <div className="flex items-center justify-center h-48 text-on-surface-variant">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading MCP servers…
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="MCP Servers"
        subtitle="Model Context Protocol servers — install, connect, inspect. The agents' external senses."
        actions={
          <StatusBadge tone={servers.length > 0 ? 'green' : 'muted'}>
            {servers.length} server{servers.length !== 1 ? 's' : ''}
          </StatusBadge>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-[12px] text-red-400">
          {error}
          <button onClick={fetchServers} className="ml-2 underline hover:no-underline">Retry</button>
        </div>
      )}

      {servers.length === 0 && !error && (
        <Card className="p-8 text-center">
          <Plug size={32} className="text-on-surface-variant/30 mx-auto mb-3" />
          <p className="text-on-surface-variant">No MCP servers registered.</p>
          <p className="text-[12px] text-on-surface-variant/50 mt-1">
            Install a server from the catalog or add one manually in Hermes.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {servers.map(server => (
          <Card key={server.name} className="overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Server size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-semibold text-on-surface">{server.name}</h3>
                    <StatusBadge tone={server.enabled ? 'green' : 'muted'}>
                      {server.enabled ? 'Enabled' : 'Disabled'}
                    </StatusBadge>
                    {testResults[server.name] === true && (
                      <StatusBadge tone="green">✓ Test passed</StatusBadge>
                    )}
                    {testResults[server.name] === false && (
                      <StatusBadge tone="red">✗ Test failed</StatusBadge>
                    )}
                  </div>
                  {server.description && (
                    <p className="text-xs text-on-surface-variant mt-1">{server.description}</p>
                  )}
                  {server.status && (
                    <p className="text-[11px] text-on-surface-variant/60 mt-1 font-mono">{server.status}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTest(server.name)}
                    disabled={testing === server.name}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] hover:bg-white/[0.05] transition disabled:opacity-40"
                    title="Test connection"
                  >
                    {testing === server.name ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={() => handleToggle(server.name, server.enabled)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] hover:bg-white/[0.05] transition"
                    title={server.enabled ? 'Disable' : 'Enable'}
                  >
                    {server.enabled ? <PowerOff size={14} /> : <Power size={14} />}
                  </button>
                  <button
                    onClick={() => handleRemove(server.name)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition"
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
