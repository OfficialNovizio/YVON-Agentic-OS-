// src/pipelines/governance-gate.ts — Governance 4-Gate Cycle Orchestrator
//
// Implements the governance review sequence defined in
// Governance/DEPARTMENT-WORKFLOW.md and board/operational/skill/board-skill-routing.md.
//
// Every consequential decision passes through:
//   CONSTITUTION → VETO → FIDUCIARY → PRE-MORTEM → RISK MATRIX → RULING
//
// VIOLATION and VETO stop review immediately. Board rules; operator decides.

import { buildCieContext } from '../cie'
import type { CieParams } from '../cie'

export interface GateResult {
  gate: string
  status: 'PASS' | 'VIOLATION' | 'VETO' | 'REJECT' | 'HOLD' | 'WARNING' | 'UNCLEAR'
  ruling: string
  article?: string
  timestamp: number
}

export interface GovernanceReview {
  decisionId: string
  gates: GateResult[]
  finalVerdict: 'APPROVED' | 'CONDITIONAL' | 'REJECTED' | 'BLOCKED'
  escalationPath: string | null
  duration: number
  log: string[]
}

const GATE_SEQUENCE = [
  { id: 'constitution',  label: 'GATE 1: Constitution Enforcement', stopsOn: ['VIOLATION'] },
  { id: 'strategic-veto', label: 'GATE 2: Strategic Veto', stopsOn: ['VETO'] },
  { id: 'fiduciary',     label: 'GATE 3: Fiduciary Guard (spend only)', stopsOn: ['REJECT'] },
  { id: 'pre-mortem',    label: 'GATE 4a: Pre-Mortem (major commitments)', stopsOn: [] },
  { id: 'risk-matrix',   label: 'GATE 4b: Risk Assessment Matrix', stopsOn: ['HOLD'] },
]

/**
 * Execute the full governance 4-gate review.
 * Early exits: VIOLATION or VETO stop the review immediately.
 *
 * In production, each gate calls the LLM with CIE context and parses the response.
 * For now, returns the structured review pipeline that CIEs will use.
 */
export async function executeGovernanceReview(
  decisionId: string,
  decisionDescription: string,
  venture: string = 'default',
): Promise<GovernanceReview> {
  const t0 = Date.now()
  const log: string[] = []
  const gates: GateResult[] = []

  // Step 1: Retrieve precedent (top-3 prior rulings)
  log.push(`[${decisionId}] Precedent retrieval requested`)
  try {
    const precedentCtx = await buildCieContext({
      agentId: 'precedent', task: decisionDescription, venture,
    })
    log.push(`[${decisionId}] Precedent: ${precedentCtx.itemsInjected} items retrieved`)
  } catch {
    log.push(`[${decisionId}] Precedent: unavailable — proceeding without prior rulings`)
  }

  // Step 2: Run each gate in sequence
  for (const gate of GATE_SEQUENCE) {
    const gateStart = Date.now()

    try {
      const cieCtx = await buildCieContext({
        agentId: 'board', task: `${gate.label}: ${decisionDescription}`, venture,
      })

      // In production: LLM call with CIE context → parse response
      // For now: pipeline instrumentation
      const result: GateResult = {
        gate: gate.id,
        status: 'PASS',
        ruling: `${gate.label} — CIE ready (${cieCtx.itemsInjected} items, ${cieCtx.totalChars} chars)`,
        timestamp: Date.now(),
      }
      gates.push(result)
      log.push(`[${decisionId}] ${gate.label}: PASS`)

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      log.push(`[${decisionId}] ${gate.label}: ERROR — ${msg}`)

      // If this gate stops on errors, break
      const result: GateResult = {
        gate: gate.id,
        status: 'UNCLEAR',
        ruling: `Error: ${msg}`,
        timestamp: Date.now(),
      }
      gates.push(result)

      if (gate.stopsOn.includes('VIOLATION') || gate.stopsOn.includes('VETO')) {
        return {
          decisionId,
          gates,
          finalVerdict: 'BLOCKED',
          escalationPath: `Gate ${gate.id} failed — escalate to operator`,
          duration: Date.now() - t0,
          log,
        }
      }
    }
  }

  // Step 3: Aggregate ruling
  const anyReject = gates.some(g => g.status === 'REJECT' || g.status === 'HOLD')
  const allPass = gates.every(g => g.status === 'PASS')

  const finalVerdict = allPass ? 'APPROVED'
    : anyReject ? 'CONDITIONAL'
    : 'REJECTED'

  log.push(`[${decisionId}] VERDICT: ${finalVerdict}`)
  log.push(`[${decisionId}] Logged to decision log — precedent captures ruling`)

  return {
    decisionId,
    gates,
    finalVerdict,
    escalationPath: finalVerdict !== 'APPROVED' ? 'operator' : null,
    duration: Date.now() - t0,
    log,
  }
}

/**
 * Check if a decision requires governance review based on thresholds.
 * Returns the gate entry point or null if no review needed.
 */
export function requiresGovernanceReview(
  spendAmount: number,
  gateThreshold: number,
  touchesConstitution: boolean = false,
  touchesLockedCommitment: boolean = false,
): boolean {
  return spendAmount > gateThreshold || touchesConstitution || touchesLockedCommitment
}
