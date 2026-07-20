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
