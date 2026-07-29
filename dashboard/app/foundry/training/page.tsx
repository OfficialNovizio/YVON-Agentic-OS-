// /foundry/training — book / document ingestion for agent memory. Stub until
// TS-014 wires the ingestion pipeline UI.
//
// Owner: mia · TS-011 WI-3
'use client'

import { FoundryStub } from '@/components/FoundryStub'

export default function FoundryTrainingPage() {
  return (
    <FoundryStub
      title="Training"
      subtitle="Ingest books, PDFs, and playbooks into agent memory — the way agents 'read' new material."
      description={
        <>
          <p>
            This page will let you drop a PDF, EPUB, or markdown corpus, pick which
            agents should learn from it, and watch the CAOS ingestion pipeline
            chunk → embed → index → push to Hermes memory.
          </p>
          <p>
            Ingested material shows up as citations in agent responses; sources with
            low reliability get downgraded automatically by{' '}
            <code className="font-mono text-on-surface">rag/feedback.py</code>.
          </p>
        </>
      }
      sourceOfTruth="rag/core/retriever.py + store/hermes/MEMORY.md"
      wireSpec="TS-014"
    />
  )
}
