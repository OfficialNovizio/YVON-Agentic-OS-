// /foundry/tools — Shared OS tool registry. Stub until TS-012 wires the
// live registry into the UI. Source of truth: Shared OS/tools/shared-tool-registry.md.
//
// Owner: mia · TS-011 WI-3
'use client'

import { FoundryStub } from '@/components/FoundryStub'

export default function FoundryToolsPage() {
  return (
    <FoundryStub
      title="Tools"
      subtitle="Shared tools installed under the Shared OS umbrella — impeccable, Playwright, agentation, browser-use, OpenSandbox, Crawl4AI, Ponytail."
      description={
        <>
          <p>
            This page will render the live tool registry: what&rsquo;s installed, which agents
            can use each tool, install/uninstall actions, and per-tool health checks
            (invocation counts, error rates, last used).
          </p>
          <p>
            Every install passes the sandbox-first quarantine flow (MASTER §7.7) via{' '}
            <code className="font-mono text-on-surface">cli/quarantine.sh</code> before it
            can be promoted into the registry.
          </p>
        </>
      }
      sourceOfTruth="Teams/Shared OS/tools/shared-tool-registry.md"
      wireSpec="TS-012"
    />
  )
}
