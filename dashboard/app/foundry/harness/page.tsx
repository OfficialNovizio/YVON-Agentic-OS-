// /foundry/harness — 5-gate verifier + telemetry. Stub until TS-016 wires
// the harness dashboard.
//
// Owner: mia · TS-011 WI-3
'use client'

import { FoundryStub } from '@/components/FoundryStub'

export default function FoundryHarnessPage() {
  return (
    <FoundryStub
      title="Harness"
      subtitle="5-gate verifier — grounded citations, self-consistency, conflict, budget, quarantine. The safety rail every response passes through."
      description={
        <>
          <p>
            This page will surface harness telemetry: pass/fail rate per gate, which
            agents fail which gates most, which sources cause the most conflicts,
            budget overshoots, and quarantine events (rejected chunks, sandbox
            escalations).
          </p>
          <p>
            Ties into the pre-push deploy gate too:{' '}
            <code className="font-mono text-on-surface">cli/verify-deploy.sh</code> is a
            harness at the build layer.
          </p>
        </>
      }
      sourceOfTruth="rag/harness.py + cli/verify-deploy.sh"
      wireSpec="TS-016"
    />
  )
}
