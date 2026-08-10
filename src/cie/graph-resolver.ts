// src/cie/graph-resolver.ts — Agent Dependency Graph Resolver
//
// Reads DEPARTMENT-WORKFLOW.md at runtime to resolve agent dependencies,
// execution order, and gate conditions. Converts department workflow docs
// into executable Directed Acyclic Graphs.
//
// Graph types:
//   sequential — agents run one after another, each consuming upstream output
//   parallel   — agents run concurrently, independent of each other
//   gate       — blocking check (VIOLATION/VETO stops execution)
//
// Usage:
//   const plan = resolveExecutionGraph('Brand Studio', 'review ad creative')
//   → { stages: [{agent:'muse', deps:[], parallel:true}, {agent:'spark', deps:['muse','lena','weave','pixel'], gate:true}] }

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getConfig } from '../adapters/config'
import { getImpactRadius } from './sources/graphify'

// ─── Types ──────────────────────────────────────────────────────

export interface GraphStage {
  agentId: string
  agentDept: string
  dependencies: string[]     // Agents that must complete before this one
  parallelOk: boolean         // Can run concurrently with other stages?
  isGate: boolean             // Is this a blocking gate?
  gateCondition?: string      // What triggers VIOLATION/VETO?
  required: boolean           // Is this stage mandatory?
  description: string
}

export interface ExecutionPlan {
  department: string
  stages: GraphStage[]
  maxDepth: number
  estimatedDurationMs: number
  warnings: string[]
}

// ─── Department Workflow Definitions ────────────────────────────

// Brand Studio content pipeline — every creative flows through this.
const BRAND_STUDIO_PIPELINE: GraphStage[] = [
  {
    agentId: 'muse', agentDept: 'Brand Studio', dependencies: [],
    parallelOk: true, isGate: false, required: true,
    description: 'Generate concepts, dedupe vs registry, top-3 to spark coach',
  },
  {
    agentId: 'weave', agentDept: 'Brand Studio', dependencies: ['muse'],
    parallelOk: false, isGate: false, required: true,
    description: 'Chapter positioning, element advanced, continuity ledger',
  },
  {
    agentId: 'lena', agentDept: 'Brand Studio', dependencies: ['weave'],
    parallelOk: false, isGate: false, required: true,
    description: 'Structure by formula, voice by guide, humanic pass ALWAYS last',
  },
  {
    agentId: 'pixel', agentDept: 'Brand Studio', dependencies: ['lena'],
    parallelOk: false, isGate: false, required: true,
    description: 'Shot lists, per-asset QA vs kit, per-series QA',
  },
  {
    agentId: 'spark', agentDept: 'Brand Studio', dependencies: ['pixel'],
    parallelOk: false, isGate: true,
    gateCondition: 'Ogilvy 10-test battery → APPROVE/REVISE/REJECT',
    required: true,
    description: 'Creative Director gate — coherence-qa + art-direction-critique',
  },
]

// Engineering pipeline — §6.3 Layer 7.2. Built 2026-08-09 against the real,
// already-documented workflow in Teams/Engineering/DEPARTMENT-WORKFLOW.md,
// not the generic "Frontend → Backend → Testing → Security" placeholder
// MASTER.md used to describe (verified: that phrasing matches no code or
// department doc anywhere — corrected there, implemented here for real).
//
// Real shape: raj (backend) + mia (frontend) build in parallel → dev reviews
// every change (integrity → correctness → security → tests → style) →
// quinn gates on TWO independent verdicts (quality AND security/charter
// compliance — either blocks alone) → ops ships rollback-first. aegis
// (defense) + cypher (caged offense) are a CONTINUOUS pod in the real
// workflow, not a one-shot conditional phase — but for a single task's
// execution graph, appending them only when the change looks
// security-sensitive is the closest honest approximation of "continuous
// coverage, weighted toward what needs it most" without literally running
// two more agents on every trivial change.
const ENGINEERING_PIPELINE: GraphStage[] = [
  {
    agentId: 'raj', agentDept: 'Engineering', dependencies: [],
    parallelOk: true, isGate: false, required: true,
    description: 'Backend/APIs — implements against dana\'s data model + axiom\'s algorithm choices',
  },
  {
    agentId: 'mia', agentDept: 'Engineering', dependencies: [],
    parallelOk: true, isGate: false, required: true,
    description: 'Frontend — implements against atlas-bridged design tokens',
  },
  {
    agentId: 'dev', agentDept: 'Engineering', dependencies: ['raj', 'mia'],
    parallelOk: false, isGate: false, required: true,
    description: 'Review every change: integrity -> correctness -> security -> tests -> style',
  },
  {
    agentId: 'quinn', agentDept: 'Engineering', dependencies: ['dev'],
    parallelOk: false, isGate: true,
    gateCondition: 'GATE PASS requires BOTH quality verdict and security/charter verdict — either blocks alone',
    required: true,
    description: 'Quality gate (test tiers + regression map + browser evidence) AND charter/security gate',
  },
  {
    agentId: 'ops', agentDept: 'Engineering', dependencies: ['quinn'],
    parallelOk: false, isGate: false, required: true,
    description: 'Ship rollback-first, monitor, watch-window held',
  },
]

// Appended to ENGINEERING_PIPELINE (after dev's review, before quinn's gate)
// only when the change looks security-sensitive. aegis+cypher's continuous
// real-world pod isn't literally "conditional" — this is the graph-shaped
// approximation of it for a single task's stage list.
const ENGINEERING_SECURITY_PHASE: GraphStage[] = [
  {
    agentId: 'aegis', agentDept: 'Engineering', dependencies: ['raj', 'mia'],
    parallelOk: false, isGate: false, required: true,
    description: 'Threat-model -> vuln-pipeline -> secure-code-review -> verified-patching',
  },
  {
    agentId: 'cypher', agentDept: 'Engineering', dependencies: ['aegis'],
    parallelOk: false, isGate: true,
    gateCondition: 'Findings filed to quinn — inverted per §6.3 Layer 5c: a finding is a pass for this phase, silence needs a coverage-completeness check',
    required: false,
    description: 'Caged offense — attacks in-scope targets, files findings to quinn',
  },
]

// Governance 4-gate cycle
const GOVERNANCE_PIPELINE: GraphStage[] = [
  {
    agentId: 'board', agentDept: 'Governance', dependencies: [],
    parallelOk: false, isGate: true,
    gateCondition: 'Constitutional VIOLATION → STOP',
    required: true,
    description: 'Gate 1: Constitution enforcement — categorical never-do\'s',
  },
  {
    agentId: 'board', agentDept: 'Governance', dependencies: ['board'],
    parallelOk: false, isGate: true,
    gateCondition: 'Strategic VETO → STOP',
    required: false,  // Only for major decisions
    description: 'Gate 2: Strategic veto — locked strategy commitments',
  },
  {
    agentId: 'board', agentDept: 'Governance', dependencies: [],
    parallelOk: false, isGate: true,
    gateCondition: 'REJECT if spend above threshold',
    required: false,  // Only for spend decisions
    description: 'Gate 3: Fiduciary guard — spend thresholds',
  },
  {
    agentId: 'board', agentDept: 'Governance', dependencies: [],
    parallelOk: false, isGate: false, required: false,
    description: 'Gate 4a: Pre-mortem — major commitments',
  },
  {
    agentId: 'board', agentDept: 'Governance', dependencies: [],
    parallelOk: false, isGate: true,
    gateCondition: 'HOLD until mitigated',
    required: false,
    description: 'Gate 4b: Risk assessment matrix',
  },
]

// Default: single agent, no pipeline
function defaultStage(agentId: string, dept: string): GraphStage {
  return {
    agentId, agentDept: dept, dependencies: [],
    parallelOk: true, isGate: false, required: true,
    description: 'Single agent execution — no pipeline',
  }
}

// ─── Resolver ────────────────────────────────────────────────────

export function resolveExecutionGraph(
  department: string,
  task: string,
  agentId: string = '',
  entityId?: string,
): ExecutionPlan {
  let stages: GraphStage[] = []
  const warnings: string[] = []

  // Brand Studio content pipeline
  if (department === 'Brand Studio' && isCreativeTask(task)) {
    stages = [...BRAND_STUDIO_PIPELINE]
  }

  // Governance 4-gate cycle
  else if (department === 'Governance' && isGovernanceTask(task)) {
    stages = [...GOVERNANCE_PIPELINE]
  }

  // Engineering pipeline — §6.3 Layer 7.2
  else if (department === 'Engineering' && isEngineeringTask(task)) {
    const sensitive = isSecuritySensitive(task, entityId)
    if (sensitive.flagged) {
      // Insert the security phase after dev's review, before quinn's gate —
      // and make quinn wait on cypher's findings too, not just dev's review.
      stages = [
        ...ENGINEERING_PIPELINE.slice(0, 3),          // raj, mia, dev
        ...ENGINEERING_SECURITY_PHASE,                 // aegis, cypher
        { ...ENGINEERING_PIPELINE[3], dependencies: ['dev', 'cypher'] }, // quinn
        ENGINEERING_PIPELINE[4],                        // ops
      ]
      warnings.push(`Security phase included: ${sensitive.reason}`)
    } else {
      stages = [...ENGINEERING_PIPELINE]
    }
  }

  // Default: single agent
  else {
    stages = [defaultStage(agentId || 'unknown', department || 'unknown')]
    if (!agentId) {
      warnings.push('No agent specified — using default single-stage pipeline')
    }
  }

  // Validate: no circular dependencies
  const agentSet = new Set(stages.map(s => s.agentId))
  for (const stage of stages) {
    for (const dep of stage.dependencies) {
      if (!agentSet.has(dep) && dep !== stage.agentId) {
        warnings.push(`Dependency '${dep}' not in execution graph for stage '${stage.agentId}'`)
      }
    }
  }

  // Compute depth
  const maxDepth = stages.reduce((max, s) => Math.max(max, s.dependencies.length + 1), 1)

  // Estimate duration: ~100ms per stage + RAG time
  const estimatedMs = stages.length * 150

  return {
    department: department || 'unknown',
    stages,
    maxDepth,
    estimatedDurationMs: estimatedMs,
    warnings,
  }
}

// ─── Task classifiers ────────────────────────────────────────────

function isCreativeTask(task: string): boolean {
  const creativeKeywords = [
    'creative', 'ad', 'headline', 'copy', 'design', 'visual',
    'brand', 'campaign', 'content', 'image', 'video', 'social',
    'post', 'story', 'voice', 'review ad', 'review creative',
    'review this', 'generate ad', 'create ad', 'write ad',
  ]
  const lower = task.toLowerCase()
  return creativeKeywords.some(k => lower.includes(k))
}

function isGovernanceTask(task: string): boolean {
  const govtKeywords = [
    'fiduciary', 'constitution', 'board', 'gate', 'violation',
    'veto', 'approve budget', 'approve spend', 'review decision',
    'compliance', 'audit', 'charter', 'governance', 'oversight',
  ]
  const lower = task.toLowerCase()
  return govtKeywords.some(k => lower.includes(k))
}

function isEngineeringTask(task: string): boolean {
  const engKeywords = [
    'build', 'implement', 'feature', 'bug', 'fix', 'api', 'endpoint',
    'backend', 'frontend', 'deploy', 'ship', 'refactor', 'migration',
    'schema', 'database', 'component', 'route', 'pipeline', 'code review',
  ]
  const lower = task.toLowerCase()
  return engKeywords.some(k => lower.includes(k))
}

/**
 * isSecuritySensitive — decides whether Engineering's execution graph needs
 * the aegis/cypher security phase. Two mechanisms, in priority order:
 *
 * 1. Real: if `entityId` is given, walk `getImpactRadius()` (real AST-derived
 *    dependency edges — sources/graphify.ts) and check whether any node in
 *    the radius has a source_file path matching a security-sensitive area.
 *    This is genuinely graph-driven, not guessed from task text.
 * 2. Fallback: keyword scan of the task description itself, same pattern as
 *    isCreativeTask/isGovernanceTask above. Used whenever no entityId is
 *    available — which is every call site in this repo today
 *    (caos-executor.ts and src/cie/index.ts don't thread a code-entity id
 *    through yet). Documented as an approximation, not silently treated as
 *    equivalent to a real graph check.
 */
const SECURITY_SENSITIVE_PATH_HINTS = [
  'auth', 'login', 'session', 'token', 'credential', 'password',
  'payment', 'billing', 'stripe', 'pii', 'gdpr', 'migration', 'rls', 'policy',
]
const SECURITY_SENSITIVE_KEYWORDS = [
  ...SECURITY_SENSITIVE_PATH_HINTS,
  'security', 'vulnerability', 'exploit', 'encryption', 'secret', 'api key',
  'permission', 'access control', 'sql injection', 'xss', 'csrf',
]

function isSecuritySensitive(
  task: string,
  entityId?: string,
): { flagged: boolean; reason: string } {
  if (entityId) {
    try {
      const radius = getImpactRadius(entityId, { hops: 1 })
      const hit = radius.find(r =>
        SECURITY_SENSITIVE_PATH_HINTS.some(h => (r.node.source_file || r.node.id || '').toLowerCase().includes(h))
      )
      if (hit) {
        return { flagged: true, reason: `getImpactRadius('${entityId}') touches ${hit.node.id} (real graph edge, not a keyword guess)` }
      }
      // Real graph check ran and found nothing — still fall through to the
      // keyword check on task text, since the graph only sees code
      // structure, not what the task description says it's for.
    } catch {
      // graph.json unavailable in this environment — fall through to keywords
    }
  }

  const lower = task.toLowerCase()
  const hitKeyword = SECURITY_SENSITIVE_KEYWORDS.find(k => lower.includes(k))
  if (hitKeyword) {
    return { flagged: true, reason: `task text matched keyword '${hitKeyword}' (approximation — no entityId was given for a real graph check)` }
  }
  return { flagged: false, reason: 'no security-sensitive signal found' }
}

// ─── Gate execution ──────────────────────────────────────────────

export interface GateResult {
  passed: boolean
  gateCondition: string
  blockingReason?: string
}

export function evaluateGate(stage: GraphStage, agentOutput: string): GateResult {
  if (!stage.isGate) {
    return { passed: true, gateCondition: stage.gateCondition || '' }
  }

  const output = agentOutput.toLowerCase()

  // Detect blocking conditions
  if (output.includes('violation') || output.includes('constitutional violation')) {
    return {
      passed: false,
      gateCondition: stage.gateCondition || '',
      blockingReason: 'VIOLATION detected in agent output — stopping execution',
    }
  }

  if (output.includes('veto') || output.includes('strategic veto')) {
    return {
      passed: false,
      gateCondition: stage.gateCondition || '',
      blockingReason: 'VETO detected in agent output — stopping execution',
    }
  }

  if (output.includes('reject') && stage.gateCondition?.includes('REJECT')) {
    return {
      passed: false,
      gateCondition: stage.gateCondition || '',
      blockingReason: 'REJECT detected — threshold exceeded',
    }
  }

  return { passed: true, gateCondition: stage.gateCondition || '' }
}
