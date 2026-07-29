// /foundry/rag — CAOS pipeline health + retrieval tuning. Stub until TS-015
// wires the retrieval telemetry UI.
//
// Owner: mia · TS-011 WI-3
'use client'

import { FoundryStub } from '@/components/FoundryStub'

export default function FoundryRagPage() {
  return (
    <FoundryStub
      title="RAG"
      subtitle="CAOS pipeline — CLASSIFY → RESOLVE → RETRIEVE → GATE. The context each agent sees before it answers."
      description={
        <>
          <p>
            This page will show pipeline health per gate: source authentication,
            reliability scores, conflict detection, budget usage, quarantine hits.
            Live counters + histograms; drill down to see which chunks got selected
            for the last N queries.
          </p>
          <p>
            End-to-end verifier:{' '}
            <code className="font-mono text-on-surface">python3 cli/verify-caos.py --quick</code>.
          </p>
        </>
      }
      sourceOfTruth="rag/core/retriever.py + rag/harness.py"
      wireSpec="TS-015"
    />
  )
}
