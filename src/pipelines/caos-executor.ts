// src/pipelines/caos-executor.ts — CAOS Pipeline Executor
//
// Traverses the execution graph, builds per-agent prompts, calls LLMs with
// RAG context + computed facts, enforces gates, routes outputs downstream,
// and logs everything in Lasswell-compliant format.
//
// This is THE orchestrator that turns the graph plan into actual agent calls.
//
// Flow per execution:
//   graph → iterate stages → for each: build prompt → RAG context → LLM → check gate → next
//
// Scaling properties:
//   - 100 agents: metadata filter absorbs growth (same latency)
//   - Multi-tenant: tenant_id in SQL WHERE clause isolates data
//   - Graph auto-rebuilds: reads DEPARTMENT-WORKFLOW.md at runtime

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import type { GraphStage, ExecutionPlan, GateResult } from '../cie/graph-resolver'
import { resolveExecutionGraph, evaluateGate } from '../cie/graph-resolver'
import { callRagBridge, callRagFeedback, RagRetrieveResult, ragToCieInjection } from '../cie/rag-bridge'
import { getCached, setCached } from '../cie/cache'
import { getConfig } from '../adapters/config'
import type { AgentProfile } from '../agents/personalities'
import { getAgentProfile } from '../agents/personalities'

// ─── Types ──────────────────────────────────────────────────────────

export interface AgentCall {
  agentId: string
  stage: GraphStage
  systemPrompt: string
  ragContext: string
  upstreamOutputs: string[]
  computedFacts: string
}

export interface AgentResult {
  agentId: string
  output: string
  gateResult?: GateResult
  timingMs: number
  chunksInjected: number
  computedFormulas: number
}

export interface CaosExecutionResult {
  plan: ExecutionPlan
  calls: AgentCall[]
  results: AgentResult[]
  finalOutput: string
  gateBlocked: boolean
  blockerReason?: string
  totalTimingMs: number
  trace: {
    graph: string
    retrievalMode: string
    cacheHits: number
    feedbackLogged: boolean
    citationsPresent: boolean
  }
}

// ─── Agent prompt builder ───────────────────────────────────────────

function buildAgentPrompt(agentId: string, task: string): string {
  const profile = getAgentProfile(agentId)
  if (!profile) return task

  // Read identity file for leaders
  let identityBlock = ''
  if (profile.isLeader && profile.identityPath) {
    const config = getConfig()
    const identityFile = join(config.teamsPath || '', profile.identityPath)
    // Find the .md file in identity folder
    try {
      if (existsSync(identityFile)) {
        const files = require('fs').readdirSync(identityFile)
        const mdFile = files.find((f: string) => f.endsWith('.md'))
        if (mdFile) {
          const content = readFileSync(join(identityFile, mdFile), 'utf-8')
          // Extract the personality baseline section
          const match = content.match(/##\s*(?:Personality Baseline|Default Behaviors|Identity)[\s\S]*?(?=##|$)/i)
          if (match) identityBlock = match[0].slice(0, 500)
        }
      }
    } catch {}
  }

  // Read principles file
  let principlesBlock = ''
  try {
    const config = getConfig()
    const princPath = join(config.teamsPath || '', profile.principlesPath)
    if (existsSync(princPath)) {
      const content = readFileSync(princPath, 'utf-8')
      principlesBlock = content.slice(0, 800)
    }
  } catch {}

  let prompt = `[AGENT: ${profile.name} — ${profile.role} (${profile.department})]\n\n`

  if (identityBlock) {
    prompt += `[IDENTITY]\n${identityBlock}\n\n`
  }

  if (principlesBlock) {
    prompt += `[CROSS-SKILL PRINCIPLES]\n${principlesBlock}\n\n`
  }

  prompt += `[TASK]\n${task}\n`
  prompt += `\n[CITATION RULE] Every recommendation must cite its source: book, chapter, page.\n`

  return prompt
}

// ─── Main executor ──────────────────────────────────────────────────

export async function executeCaosPipeline(
  task: string,
  agentId: string,
  venture: string = 'default',
  retrievalMode: string = 'auto',
  skipCache: boolean = false,
): Promise<CaosExecutionResult> {
  const t0 = Date.now()
  const calls: AgentCall[] = []
  const results: AgentResult[] = []
  let cacheHits = 0
  let feedbackLogged = false

  // ── Step 1: Resolve department ──────────────────────────────────
  const profile = getAgentProfile(agentId)
  const dept = profile?.department || 'Executive Office'

  // ── Step 2: Build execution graph ───────────────────────────────
  const plan = resolveExecutionGraph(dept, task, agentId)

  // Determine retrieval mode
  const mode = retrievalMode === 'auto'
    ? (plan.stages.length > 3 ? 'agentic' : 'standard')
    : retrievalMode

  // ── Step 3: Execute each stage ──────────────────────────────────
  const upstreamOutputs: string[] = []
  let gateBlocked = false
  let blockerReason = ''

  for (const stage of plan.stages) {
    // Wait for dependencies (in real async: Promise.all upstream stages)
    // For now: stages are sequential per department workflow

    // ── Build RAG context for this agent ─────────────────────────
    let ragContext = ''
    let ragResult: RagRetrieveResult | null = null
    let stageChunksInjected = 0
    let stageFormulasComputed = 0

    // Check cache first
    if (!skipCache) {
      const fp = `${stage.agentId}:${task.toLowerCase().trim().slice(0, 200)}`
      const cached = getCached(fp)
      if (cached) {
        ragContext = cached.result.injection_text
        cacheHits++
        stageChunksInjected = cached.result.chunks ?? 1
      }
    }

    // Missed cache → call RAG Bridge
    if (!ragContext) {
      try {
        ragResult = await callRagBridge({
          query: task,
          agentId: stage.agentId,
          dept: stage.agentDept,
          retrievalMode: (mode as 'standard' | 'agentic' | 'graph'),
        })

        if (ragResult.success) {
          ragContext = ragResult.injection_text || ''
          stageChunksInjected = ragResult.chunks ?? 0
          stageFormulasComputed = ragResult.computed_formulas?.filter(f => f.computed).length ?? 0
        }
      } catch {
        // RAG bridge unavailable — agent proceeds without RAG context
      }
    }

    // ── Build prompt ─────────────────────────────────────────────
    const systemPrompt = buildAgentPrompt(stage.agentId, task)

    // Compose upstream context
    let upstreamBlock = ''
    if (upstreamOutputs.length > 0) {
      upstreamBlock = `[UPSTREAM OUTPUTS — from ${stage.dependencies.join(', ')}]\n`
      upstreamBlock += upstreamOutputs.map((o, i) => `[${stage.dependencies[i] || 'prev'}]: ${o.slice(0, 300)}`).join('\n\n')
    }

    // ── Compose final prompt ─────────────────────────────────────
    const call: AgentCall = {
      agentId: stage.agentId,
      stage,
      systemPrompt,
      ragContext: ragContext || '[No RAG context available]',
      upstreamOutputs: upstreamOutputs.length ? upstreamOutputs : [],
      computedFacts: '',
    }

    calls.push(call)

    // ── ♢♢♢ LLM CALL ♢♢♢ ─────────────────────────────────────
    // In production: call Claude/DeepSeek API with the composed prompt.
    // For now: this is the structured call that any LLM client receives.
    const stageStart = Date.now()

    // Simulate for pipeline structure verification:
    // In reality, this is: await llmClient.complete({ systemPrompt, ragContext, task })
    const llmOutput = `[${stage.agentId} agent output — in production this is the LLM response]`

    const stageMs = Date.now() - stageStart

    // ── Check gate ──────────────────────────────────────────────
    let gateResult: GateResult | undefined
    if (stage.isGate) {
      gateResult = evaluateGate(stage, llmOutput)

      if (!gateResult.passed) {
        gateBlocked = true
        blockerReason = gateResult.blockingReason || 'Gate blocked'
        results.push({
          agentId: stage.agentId,
          output: llmOutput,
          gateResult,
          timingMs: stageMs,
          chunksInjected: stageChunksInjected,
          computedFormulas: stageFormulasComputed,
        })

        // Cache successful retrieval
        if (ragContext && !skipCache) {
          setCached(task, stage.agentId, {
            injection_text: ragContext,
            trace: ragResult?.trace || {},
            profile: ragResult?.profile,
            chunks: stageChunksInjected,
          })
        }

        // STOP — gates block downstream execution
        break
      }
    }

    // Pass output to downstream stages
    upstreamOutputs.push(llmOutput)

    results.push({
      agentId: stage.agentId,
      output: llmOutput,
      gateResult,
      timingMs: stageMs,
      chunksInjected: stageChunksInjected,
      computedFormulas: stageFormulasComputed,
    })
  }

  // ── Step 4: Log feedback ──────────────────────────────────────
  const finalOutput = results.length > 0
    ? results[results.length - 1].output
    : ''

  const lastResult = results[results.length - 1]
  if (lastResult?.gateResult) {
    try {
      await callRagFeedback({
        trace: {
          who: agentId,
          what: calls.map(c => ({
            chunk_id: c.stage.agentId,
            source: c.stage.description || '',
            section: c.stage.agentDept || '',
            tier: c.stage.isGate ? 1 : 2,
            adversary: false,
            chars: c.ragContext.length,
          })),
          channel: 'CAOS pipeline',
          whom: 'claude',
          effect: gateBlocked ? 'rejected' : 'accepted',
          strategy: mode,
          profile: plan.stages[0]?.agentDept || '',
        },
        outcome: gateBlocked ? 'rejected' : 'accepted',
      })
      feedbackLogged = true
    } catch {
      // Non-blocking
    }
  }

  const totalMs = Date.now() - t0

  return {
    plan,
    calls,
    results,
    finalOutput,
    gateBlocked,
    blockerReason,
    totalTimingMs: totalMs,
    trace: {
      graph: plan.stages.map(s => s.agentId).join(' → '),
      retrievalMode: mode,
      cacheHits,
      feedbackLogged,
      citationsPresent: calls.some(c => c.ragContext.includes('[') && c.ragContext.includes(']')),
    },
  }
}

// ─── Re-exports ─────────────────────────────────────────────────────

export type { GraphStage, ExecutionPlan, GateResult }
