// Input Analysis pipeline — types (the solid skeleton).
// The fixed shape every message produces; never changes shape silently.
export type InputTier = 'generic' | 'info' | 'build'
export type MessageRelation = 'venture' | 'general'

export interface InputAnalysis {
  tier: InputTier
  /** venture → context injection + CAOS + RAG · general → skip to answer */
  relation: MessageRelation
  // Shared
  what: string
  // Info-tier (dynamic)
  type?: string
  subject?: string
  scope?: string
  expected?: string
  format?: string
  // Build-tier (dynamic)
  why?: string
  how?: string
  endResult?: string
  desiredOutput?: string
  /** The MUST-HAVE checklist — defines "done". Verification checks each item. */
  mustHaves?: string[]
  /** The agent routing plan — primary agent + team (by name). */
  targetAgents?: { primary: string; team: string[]; reason: string }
  /** Implicit requirements (preservation/propagation/connecting) — F2. */
  implicit?: { preservation: string[]; propagation: string[]; connecting: string[] }
  analyzed: boolean
}
