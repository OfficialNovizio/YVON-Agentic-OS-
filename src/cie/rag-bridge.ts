// src/cie/rag-bridge.ts — RAG Bridge: CIE → Python RAG subprocess
//
// Spawns `python3 rag/bridge.py` as a child process, sends JSON via stdin,
// reads structured context + computed formulas from stdout.
//
// This is THE bridge between the TypeScript CIE engine and the Python
// RAG + Shared OS + Graph systems.
//
// Usage:
//   const context = await callRagBridge({ query, agentId, dept, mode: 'standard' })
//   // context.injection_text → ready for LLM system prompt
//   // context.computed_formulas → executable formula results
//   // context.trace → Lasswell-compliant audit trail
//
//   await callRagBridge({ trace, outcome: 'accepted' }, 'feedback')

import { spawn } from 'child_process'
import { join, resolve } from 'path'
import { getConfig } from '../adapters/config'
import type { KnowledgeSource } from './types'

// ─── Types ──────────────────────────────────────────────────────

export interface RagRetrieveParams {
  query: string
  agentId: string
  dept?: string
  topK?: number
  retrievalMode?: 'standard' | 'agentic' | 'graph'
}

export interface RagRetrieveResult {
  success: boolean
  timing_ms: number
  query: string
  agent_id: string
  profile?: string
  chunks?: number
  chars?: number
  budget?: number
  adversary?: boolean
  rewritten_queries?: string[]
  injection_text: string
  trace?: Record<string, unknown>
  selected_chunks?: Array<{
    chunk_id: string; source_file: string; section: string
    priority_tier: number; adversary: boolean; chars: number
  }>
  computed_formulas?: Array<{
    script: string; function: string
    result?: { value: unknown; type: string }
    citation?: string; computed: boolean; error?: string
  }>
}

export interface RagFeedbackParams {
  trace: Record<string, unknown>
  outcome: 'accepted' | 'revised' | 'rejected' | 'pending'
  notes?: string
}

export interface RagFormulaParams {
  formulas: Array<{ script: string; function: string; args: unknown[] }>
}

// ─── Bridge call ────────────────────────────────────────────────

function getBridgePath(): string {
  try {
    const config = getConfig()
    return join(config.projectRoot, 'rag', 'bridge.py')
  } catch {
    return resolve(__dirname, '..', '..', 'rag', 'bridge.py')
  }
}

function callBridge(mode: string, input: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const bridgePath = getBridgePath()
    const child = spawn('python3', [bridgePath, `--mode=${mode}`], {
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data: Buffer) => { stdout += data.toString() })
    child.stderr.on('data', (data: Buffer) => { stderr += data.toString() })

    child.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Bridge exited with code ${code}: ${stderr.slice(0, 200)}`))
        return
      }
      try {
        const result = JSON.parse(stdout.trim())
        resolve(result)
      } catch (e) {
        reject(new Error(`Failed to parse bridge output: ${stdout.slice(0, 200)}`))
      }
    })

    child.on('error', (err: Error) => {
      reject(new Error(`Bridge spawn failed: ${err.message}`))
    })

    // Send input
    child.stdin.write(JSON.stringify(input))
    child.stdin.end()
  })
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Retrieve RAG context for a query.
 * This replaces CIE's old retrieveContext() step.
 */
export async function callRagBridge(
  params: RagRetrieveParams,
): Promise<RagRetrieveResult> {
  const input = {
    query: params.query,
    agent_id: params.agentId,
    dept: params.dept || '',
    top_k: params.topK ?? 40,
    retrieval_mode: params.retrievalMode ?? 'standard',
  }

  const raw = await callBridge('retrieve', input)
  return raw as unknown as RagRetrieveResult
}

/**
 * Send feedback for a completed agent call.
 */
export async function callRagFeedback(
  params: RagFeedbackParams,
): Promise<{ success: boolean; event_id: string }> {
  const raw = await callBridge('feedback', {
    trace: params.trace,
    outcome: params.outcome,
    notes: params.notes ?? '',
  })
  return raw as { success: boolean; event_id: string }
}

/**
 * Execute Shared OS formulas directly (no retrieval).
 */
export async function callRagFormulas(
  params: RagFormulaParams,
): Promise<{ success: boolean; results: RagRetrieveResult['computed_formulas'] }> {
  const raw = await callBridge('formula', {
    formulas: params.formulas,
  })
  return raw as { success: boolean; results: RagRetrieveResult['computed_formulas'] }
}

/**
 * Convert RAG bridge result to CIE's injection format.
 * Bridges the gap between RAG's injection_text and CIE's systemExtension + dataBlock.
 */
export function ragToCieInjection(bridgeResult: RagRetrieveResult): {
  systemExtension: string
  dataBlock: string
  trace: Record<string, unknown>
} {
  const injectionParts: string[] = []

  // 1. Computed formulas (highest priority)
  if (bridgeResult.computed_formulas && bridgeResult.computed_formulas.length > 0) {
    const computedFacts = bridgeResult.computed_formulas
      .filter(f => f.computed && f.result)
      .map(f => {
        const val = typeof f.result?.value === 'object'
          ? JSON.stringify(f.result?.value)
          : String(f.result?.value ?? '')
        return `  ${f.function}() = ${val}  [${f.citation || f.script}]`
      })

    if (computedFacts.length > 0) {
      injectionParts.push('[COMPUTED FACTS — Shared OS scripts]')
      computedFacts.forEach(f => injectionParts.push(f))
      injectionParts.push('[End Computed Facts]\n')
    }
  }

  // 2. RAG retrieval injection
  if (bridgeResult.injection_text) {
    injectionParts.push(bridgeResult.injection_text)
  }

  return {
    systemExtension: injectionParts.join('\n'),
    dataBlock: '',  // RAG bridge already formats compact context
    trace: bridgeResult.trace || {},
  }
}
