// /foundry/mcp — MCP servers list + connect surface. Stub until TS-013 wires
// the live MCP registry.
//
// Owner: mia · TS-011 WI-3
'use client'

import { FoundryStub } from '@/components/FoundryStub'

export default function FoundryMcpPage() {
  return (
    <FoundryStub
      title="MCPs"
      subtitle="Model Context Protocol servers — install, connect, inspect. The agents' external senses."
      description={
        <>
          <p>
            This page will list every registered MCP server (Supabase, Vercel, Chrome,
            Slack, GitHub, Figma, custom), show connection status, allow one-click
            connect / disconnect, and expose the tool surface each server offers.
          </p>
          <p>
            Live status pulls from{' '}
            <code className="font-mono text-on-surface">mcp__mcp-registry__list_connectors</code>{' '}
            and per-agent MCP allowlists.
          </p>
        </>
      }
      sourceOfTruth="Teams/AI & Agents/relay/custom/mcp-tool-registry/assets/tool-registry.md"
      wireSpec="TS-013"
    />
  )
}
