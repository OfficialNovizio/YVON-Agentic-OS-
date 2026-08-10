// lib/cie/retrieval-shape.ts — CLASSIFY Layer 4 / RETRIEVE: archetype-specific retrieval variants
//
// system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §14.1 describes each archetype's retrieval shape as narrow/wide/distant
// in the abstract. The real, already-wired mechanism rag/core/bridge.py exposes for shaping
// retrieval is two params: `top_k` (breadth) and `retrieval_mode` — verified in
// rag/core/retriever.py: 'standard' = single-pass with the given query; 'agentic' = rewrites the
// query into 3-5 variants exploring different angles, merges unique results (genuinely wider, not
// a rename); 'graph' also exists but its behavior wasn't traced here. There is no literal
// "distant recall" or "ambiguous-edge" mode in retriever.py — 'agentic' is the closest real
// mechanism to archetypes described as "wide," used here as a documented approximation, not
// invented behavior.

import type { Archetype } from './archetype'
import type { RagRetrieveParams } from './rag-bridge'

export interface RetrievalShape {
  topK: number
  retrievalMode: NonNullable<RagRetrieveParams['retrievalMode']>
  note: string
}

const RETRIEVAL_SHAPES: Record<Archetype, RetrievalShape> = {
  SHALLOW_LOOKUP: {
    topK: 5,
    retrievalMode: 'standard',
    note: 'narrow, scoped, single query per §14.1',
  },
  PRECISION_CRITICAL: {
    topK: 40,
    retrievalMode: 'standard',
    note: 'standard §8 retrieval — matches rag/core/bridge.py\'s own default top_k',
  },
  DEEP_EXPLORATION: {
    topK: 80,
    retrievalMode: 'agentic',
    note: '"wide, AMBIGUOUS edges + MemPalace distant recall" per §14.1 — agentic mode\'s '
      + 'multi-angle query rewrite is the closest real equivalent; MemPalace distant recall '
      + 'itself is not wired into retriever.py, tracked separately',
  },
  SYNTHESIS_REPORTING: {
    topK: 60,
    retrievalMode: 'agentic',
    note: 'cross-graph aggregation, wide gather per §14.1',
  },
  CREATIVE_PRODUCTION: {
    topK: 60,
    retrievalMode: 'agentic',
    note: 'approximates §13 Creative Retrieval Mode — no dedicated creative mode exists in '
      + 'retriever.py; the real Creative Gate Chain (§13.2) is separate and not built here',
  },
  CONTINUOUS_MONITORING: {
    topK: 20,
    retrievalMode: 'standard',
    note: 'recurring-scan shaped, not exploration-shaped, per §14.1',
  },
  ADVERSARIAL_TESTING: {
    topK: 40,
    retrievalMode: 'standard',
    note: 'same rigor as precision-critical, inverted goal, per §14.1',
  },
}

export function resolveRetrievalShape(archetype: Archetype): RetrievalShape {
  return RETRIEVAL_SHAPES[archetype]
}
