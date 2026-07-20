// Agent Registry — 46 agents across 7 departments
//
// This replaces the old 13-agent hardcoded list. Every agent maps to
// its department framework files under <Dept>/<agent>/:
//
//   identity/            — persona (leader only, per playbook §6.1)
//   operational/agent/   — config, thresholds, escalation contacts
//   operational/principles/ — cross-skill rules
//   operational/commands/   — trigger → skill mapping
//   operational/skill/      — agent routing map
//   operational/tool/       — technical requirements
//   logical/             — book-requirements.md (link to Shared OS/logical/)
//   marketplace/         — verbatim copied skills
//   custom/              — built-from-scratch skills
//
// Personality is DERIVED from identity files (for leaders) and principles
// (for all agents), not hardcoded. The engine reads the file at runtime.
//
// ─── Usage ────────────────────────────────────────────────────────
// import { getAgentProfile } from './agents/personalities'
// const profile = getAgentProfile('marcus')
// // → { name: 'Marcus', department: 'Executive Office',
// //     identityPath: 'Executive Office/marcus/identity/...',
// //     principlesPath: '...', logicalScripts: ['capital_budgeting.py', ...] }

export interface AgentProfile {
  /** Short ID used in API routes (e.g. 'marcus', 'dev') */
  shortId: string
  /** Full name */
  name: string
  /** Which department */
  department: string
  /** Role within the department */
  role: string
  /** Leader status (playbook §6.1 — leader gets identity content) */
  isLeader: boolean
  /** Path to identity document (empty string if non-leader) */
  identityPath: string
  /** Path to operational principles file */
  principlesPath: string
  /** Path to operational agent config */
  configPath: string
  /** Shared OS/logical/ scripts this agent owns or inherits */
  logicalScripts: string[]
  /** The department leader for escalation context */
  departmentLeader: string
}

// ═══════════════════════════════════════════════════════════════════
// Full 46-Agent Registry
// ═══════════════════════════════════════════════════════════════════

export const AGENT_REGISTRY: AgentProfile[] = [

  // ─── Executive Office (3 agents) ──────────────────────────────
  {
    shortId: 'marcus', name: 'Marcus', department: 'Executive Office',
    role: 'Orchestrator (CEO)', isLeader: true,
    identityPath: 'Executive Office/marcus/identity/',
    principlesPath: 'Executive Office/marcus/operational/principles/marcus-principles.md',
    configPath: 'Executive Office/marcus/operational/agent/marcus-config.md',
    logicalScripts: ['capital_budgeting.py','forecasting.py','decision_analysis.py','competitive_strategy.py','planning_fallacy.py'],
    departmentLeader: 'marcus',
  },
  {
    shortId: 'echo', name: 'Echo', department: 'Executive Office',
    role: 'Investor Relations', isLeader: false,
    identityPath: '', principlesPath: 'Executive Office/echo/operational/principles/echo-principles.md',
    configPath: 'Executive Office/echo/operational/agent/echo-config.md',
    logicalScripts: ['venture_valuation.py','investor_metrics.py','pitch_validation.py','capital_budgeting.py','planning_fallacy.py'],
    departmentLeader: 'marcus',
  },
  {
    shortId: 'vista', name: 'Vista', department: 'Executive Office',
    role: 'Roadmap Lead', isLeader: false,
    identityPath: '', principlesPath: 'Executive Office/vista/operational/principles/vista-principles.md',
    configPath: 'Executive Office/vista/operational/agent/vista-config.md',
    logicalScripts: ['signal_detection.py','rice_prioritization.py','forecasting.py','planning_fallacy.py','investor_metrics.py'],
    departmentLeader: 'marcus',
  },

  // ─── Governance (3 agents) ────────────────────────────────────
  {
    shortId: 'board', name: 'Board', department: 'Governance',
    role: 'Governance Gate', isLeader: true,
    identityPath: 'Governance/board/identity/',
    principlesPath: 'Governance/board/operational/principles/board-principles.md',
    configPath: 'Governance/board/operational/agent/board-config.md',
    logicalScripts: ['governance_gate.py','decision_analysis.py','planning_fallacy.py','competitive_strategy.py'],
    departmentLeader: 'board',
  },
  {
    shortId: 'precedent', name: 'Precedent', department: 'Governance',
    role: 'Institutional Memory', isLeader: false,
    identityPath: '', principlesPath: 'Governance/precedent/operational/principles/precedent-principles.md',
    configPath: 'Governance/precedent/operational/agent/precedent-config.md',
    logicalScripts: ['case_law_method.py','decision_analysis.py','signal_detection.py'],
    departmentLeader: 'board',
  },
  {
    shortId: 'sentinel', name: 'Sentinel', department: 'Governance',
    role: 'Compliance Monitor', isLeader: false,
    identityPath: '', principlesPath: 'Governance/sentinel/operational/principles/sentinel-principles.md',
    configPath: 'Governance/sentinel/operational/agent/sentinel-config.md',
    logicalScripts: ['audit_sampling.py','signal_detection.py','governance_gate.py','planning_fallacy.py'],
    departmentLeader: 'board',
  },

  // ─── Engineering (11 agents) ──────────────────────────────────
  {
    shortId: 'dev', name: 'Dev', department: 'Engineering',
    role: 'Lead Developer', isLeader: true,
    identityPath: 'Engineering/dev/identity/',
    principlesPath: 'Engineering/dev/operational/principles/',
    configPath: 'Engineering/dev/operational/agent/',
    logicalScripts: ['sre_methods.py','algorithm_analysis.py','swe_practices.py','api_design.py','capital_budgeting.py'],
    departmentLeader: 'dev',
  },
  {
    shortId: 'ops', name: 'Ops', department: 'Engineering',
    role: 'DevOps & Reliability', isLeader: false,
    identityPath: '', principlesPath: 'Engineering/ops/operational/principles/',
    configPath: 'Engineering/ops/operational/agent/',
    logicalScripts: ['sre_methods.py','data_systems.py','swe_practices.py'],
    departmentLeader: 'dev',
  },
  {
    shortId: 'cypher', name: 'Cypher', department: 'Engineering',
    role: 'Adversary / Red Team', isLeader: false,
    identityPath: '', principlesPath: 'Engineering/cypher/operational/principles/',
    configPath: 'Engineering/cypher/operational/agent/',
    logicalScripts: ['security_assessment.py','test_design.py'],
    departmentLeader: 'dev',
  },
  {
    shortId: 'aegis', name: 'Aegis', department: 'Engineering',
    role: 'Application Security', isLeader: false,
    identityPath: '', principlesPath: 'Engineering/aegis/operational/principles/',
    configPath: 'Engineering/aegis/operational/agent/',
    logicalScripts: ['test_design.py','security_assessment.py'],
    departmentLeader: 'dev',
  },
  {
    shortId: 'axiom', name: 'Axiom', department: 'Engineering',
    role: 'Algorithms & Data Structures', isLeader: false,
    identityPath: '', principlesPath: 'Engineering/axiom/operational/principles/',
    configPath: 'Engineering/axiom/operational/agent/',
    logicalScripts: ['algorithm_analysis.py','swe_practices.py'],
    departmentLeader: 'dev',
  },
  {
    shortId: 'rank', name: 'Rank', department: 'Engineering',
    role: 'Technical SEO', isLeader: false,
    identityPath: '', principlesPath: 'Engineering/rank/operational/principles/',
    configPath: 'Engineering/rank/operational/agent/',
    logicalScripts: ['web_performance.py','api_design.py'],
    departmentLeader: 'dev',
  },
  {
    shortId: 'quinn', name: 'Quinn', department: 'Engineering',
    role: 'QA', isLeader: false,
    identityPath: '', principlesPath: 'Engineering/quinn/operational/principles/',
    configPath: 'Engineering/quinn/operational/agent/',
    logicalScripts: ['sre_methods.py','test_design.py','security_assessment.py'],
    departmentLeader: 'dev',
  },
  {
    shortId: 'dana', name: 'Dana', department: 'Engineering',
    role: 'Data Architecture', isLeader: false,
    identityPath: '', principlesPath: 'Engineering/dana/operational/principles/',
    configPath: 'Engineering/dana/operational/agent/',
    logicalScripts: ['data_systems.py'],
    departmentLeader: 'dev',
  },
  {
    shortId: 'raj', name: 'Raj', department: 'Engineering',
    role: 'Backend & APIs', isLeader: false,
    identityPath: '', principlesPath: 'Engineering/raj/operational/principles/',
    configPath: 'Engineering/raj/operational/agent/',
    logicalScripts: ['sre_methods.py','data_systems.py','api_design.py'],
    departmentLeader: 'dev',
  },
  {
    shortId: 'mia', name: 'Mia', department: 'Engineering',
    role: 'Frontend Web', isLeader: false,
    identityPath: '', principlesPath: 'Engineering/mia/operational/principles/',
    configPath: 'Engineering/mia/operational/agent/',
    logicalScripts: ['web_performance.py'],
    departmentLeader: 'dev',
  },
  {
    shortId: 'nova', name: 'Nova', department: 'Engineering',
    role: 'Mobile', isLeader: false,
    identityPath: '', principlesPath: 'Engineering/nova/operational/principles/',
    configPath: 'Engineering/nova/operational/agent/',
    logicalScripts: ['sre_methods.py','data_systems.py'],
    departmentLeader: 'dev',
  },

  // ─── Cybersecurity (5 agents) ─────────────────────────────────
  {
    shortId: 'warden', name: 'Warden', department: 'Cybersecurity',
    role: 'Risk & Compliance', isLeader: true,
    identityPath: 'Cybersecurity/warden/identity/',
    principlesPath: 'Cybersecurity/warden/operational/principles/',
    configPath: 'Cybersecurity/warden/operational/agent/',
    logicalScripts: ['risk_management.py','decision_analysis.py','security_assessment.py'],
    departmentLeader: 'warden',
  },
  {
    shortId: 'keyring', name: 'Keyring', department: 'Cybersecurity',
    role: 'Identity & Access', isLeader: false,
    identityPath: '', principlesPath: 'Cybersecurity/keyring/operational/principles/',
    configPath: 'Cybersecurity/keyring/operational/agent/',
    logicalScripts: ['identity_zero_trust.py','risk_management.py','security_assessment.py'],
    departmentLeader: 'warden',
  },
  {
    shortId: 'bastion', name: 'Bastion', department: 'Cybersecurity',
    role: 'Infrastructure Security', isLeader: false,
    identityPath: '', principlesPath: 'Cybersecurity/bastion/operational/principles/',
    configPath: 'Cybersecurity/bastion/operational/agent/',
    logicalScripts: ['identity_zero_trust.py','incident_response.py','risk_management.py','security_assessment.py'],
    departmentLeader: 'warden',
  },
  {
    shortId: 'cortex', name: 'Cortex', department: 'Cybersecurity',
    role: 'Incident Response & Detection', isLeader: false,
    identityPath: '', principlesPath: 'Cybersecurity/cortex/operational/principles/',
    configPath: 'Cybersecurity/cortex/operational/agent/',
    logicalScripts: ['incident_response.py','signal_detection.py','security_assessment.py','risk_management.py'],
    departmentLeader: 'warden',
  },
  {
    shortId: 'veil', name: 'Veil', department: 'Cybersecurity',
    role: 'Privacy & Data Protection', isLeader: false,
    identityPath: '', principlesPath: 'Cybersecurity/veil/operational/principles/',
    configPath: 'Cybersecurity/veil/operational/agent/',
    logicalScripts: ['privacy_compliance.py','risk_management.py','incident_response.py'],
    departmentLeader: 'warden',
  },

  // ─── Product (5 agents) ───────────────────────────────────────
  {
    shortId: 'spec', name: 'Spec', department: 'Product',
    role: 'Product Manager', isLeader: true,
    identityPath: 'Product/spec/identity/',
    principlesPath: 'Product/spec/operational/principles/',
    configPath: 'Product/spec/operational/agent/',
    logicalScripts: ['rice_prioritization.py','decision_analysis.py','signal_detection.py','experiment_methods.py','pricing_methods.py'],
    departmentLeader: 'spec',
  },
  {
    shortId: 'metric', name: 'Metric', department: 'Product',
    role: 'Product Analytics', isLeader: false,
    identityPath: '', principlesPath: 'Product/metric/operational/principles/',
    configPath: 'Product/metric/operational/agent/',
    logicalScripts: ['experiment_methods.py','signal_detection.py','investor_metrics.py','planning_fallacy.py','forecasting.py'],
    departmentLeader: 'spec',
  },
  {
    shortId: 'ux', name: 'UX', department: 'Product',
    role: 'UX Research', isLeader: false,
    identityPath: '', principlesPath: 'Product/ux/operational/principles/',
    configPath: 'Product/ux/operational/agent/',
    logicalScripts: ['ux_research_methods.py','signal_detection.py','experiment_methods.py'],
    departmentLeader: 'spec',
  },
  {
    shortId: 'loom', name: 'Loom', department: 'Product',
    role: 'PMF & Experimentation', isLeader: false,
    identityPath: '', principlesPath: 'Product/loom/operational/principles/',
    configPath: 'Product/loom/operational/agent/',
    logicalScripts: ['experiment_methods.py','signal_detection.py','investor_metrics.py','decision_analysis.py','pricing_methods.py'],
    departmentLeader: 'spec',
  },
  {
    shortId: 'price', name: 'Price', department: 'Product',
    role: 'Pricing & Packaging', isLeader: false,
    identityPath: '', principlesPath: 'Product/price/operational/principles/',
    configPath: 'Product/price/operational/agent/',
    logicalScripts: ['pricing_methods.py','experiment_methods.py','signal_detection.py','investor_metrics.py','capital_budgeting.py'],
    departmentLeader: 'spec',
  },

  // ─── AI & Agents (8 agents) ───────────────────────────────────
  {
    shortId: 'meta', name: 'Meta', department: 'AI & Agents',
    role: 'Fleet Orchestrator', isLeader: true,
    identityPath: 'AI & Agents/meta/identity/',
    principlesPath: 'AI & Agents/meta/operational/principles/',
    configPath: 'AI & Agents/meta/operational/agent/',
    logicalScripts: ['fleet_measurement.py','signal_detection.py','decision_analysis.py'],
    departmentLeader: 'meta',
  },
  {
    shortId: 'relay', name: 'Relay', department: 'AI & Agents',
    role: 'Gateway', isLeader: false,
    identityPath: '', principlesPath: 'AI & Agents/relay/operational/principles/',
    configPath: 'AI & Agents/relay/operational/agent/',
    logicalScripts: ['sre_methods.py','signal_detection.py','risk_management.py'],
    departmentLeader: 'meta',
  },
  {
    shortId: 'gauge', name: 'Gauge', department: 'AI & Agents',
    role: 'Quality Benchmarks', isLeader: false,
    identityPath: '', principlesPath: 'AI & Agents/gauge/operational/principles/',
    configPath: 'AI & Agents/gauge/operational/agent/',
    logicalScripts: ['signal_detection.py','experiment_methods.py','fleet_measurement.py'],
    departmentLeader: 'meta',
  },
  {
    shortId: 'anneal', name: 'Anneal', department: 'AI & Agents',
    role: 'Lessons & Maintenance', isLeader: false,
    identityPath: '', principlesPath: 'AI & Agents/anneal/operational/principles/',
    configPath: 'AI & Agents/anneal/operational/agent/',
    logicalScripts: ['fleet_measurement.py','staleness_economics.py','signal_detection.py','decision_analysis.py'],
    departmentLeader: 'meta',
  },
  {
    shortId: 'forge', name: 'Forge', department: 'AI & Agents',
    role: 'Quantitative Benchmarking', isLeader: false,
    identityPath: '', principlesPath: 'AI & Agents/forge/operational/principles/',
    configPath: 'AI & Agents/forge/operational/agent/',
    logicalScripts: ['experiment_methods.py','signal_detection.py','decision_analysis.py'],
    departmentLeader: 'meta',
  },
  {
    shortId: 'scout', name: 'Scout', department: 'AI & Agents',
    role: 'Skills Scout', isLeader: false,
    identityPath: '', principlesPath: 'AI & Agents/scout/operational/principles/',
    configPath: 'AI & Agents/scout/operational/agent/',
    logicalScripts: ['decision_analysis.py','rice_prioritization.py','security_assessment.py'],
    departmentLeader: 'meta',
  },
  {
    shortId: 'proto', name: 'Proto', department: 'AI & Agents',
    role: 'Prototype Lab', isLeader: false,
    identityPath: '', principlesPath: 'AI & Agents/proto/operational/principles/',
    configPath: 'AI & Agents/proto/operational/agent/',
    logicalScripts: ['experiment_methods.py','decision_analysis.py','fleet_measurement.py'],
    departmentLeader: 'meta',
  },
  {
    shortId: 'edge', name: 'Edge', department: 'AI & Agents',
    role: 'Technology Adoption', isLeader: false,
    identityPath: '', principlesPath: 'AI & Agents/edge/operational/principles/',
    configPath: 'AI & Agents/edge/operational/agent/',
    logicalScripts: ['decision_analysis.py','rice_prioritization.py','fleet_measurement.py'],
    departmentLeader: 'meta',
  },

  // ─── Brand Studio (11 agents) ─────────────────────────────────
  {
    shortId: 'spark', name: 'Spark', department: 'Brand Studio',
    role: 'Creative Director', isLeader: true,
    identityPath: 'Brand Studio/spark/identity/',
    principlesPath: 'Brand Studio/spark/operational/principles/',
    configPath: 'Brand Studio/spark/operational/agent/',
    logicalScripts: ['marketing_laws.py','brand_metrics.py'],
    departmentLeader: 'spark',
  },
  {
    shortId: 'atlas', name: 'Atlas', department: 'Brand Studio',
    role: 'Art Director', isLeader: false,
    identityPath: '', principlesPath: 'Brand Studio/atlas/operational/principles/',
    configPath: 'Brand Studio/atlas/operational/agent/',
    logicalScripts: ['marketing_laws.py','brand_metrics.py'],
    departmentLeader: 'spark',
  },
  {
    shortId: 'lena', name: 'Lena', department: 'Brand Studio',
    role: 'Brand Voice', isLeader: false,
    identityPath: '', principlesPath: 'Brand Studio/lena/operational/principles/',
    configPath: 'Brand Studio/lena/operational/agent/',
    logicalScripts: ['marketing_laws.py','content_performance.py','storyline_engine.py'],
    departmentLeader: 'spark',
  },
  {
    shortId: 'weave', name: 'Weave', department: 'Brand Studio',
    role: 'Storytelling', isLeader: false,
    identityPath: '', principlesPath: 'Brand Studio/weave/operational/principles/',
    configPath: 'Brand Studio/weave/operational/agent/',
    logicalScripts: ['marketing_laws.py','storyline_engine.py'],
    departmentLeader: 'spark',
  },
  {
    shortId: 'muse', name: 'Muse', department: 'Brand Studio',
    role: 'Ideation', isLeader: false,
    identityPath: '', principlesPath: 'Brand Studio/muse/operational/principles/',
    configPath: 'Brand Studio/muse/operational/agent/',
    logicalScripts: ['marketing_laws.py','content_performance.py'],
    departmentLeader: 'spark',
  },
  {
    shortId: 'pixel', name: 'Pixel', department: 'Brand Studio',
    role: 'Production', isLeader: false,
    identityPath: '', principlesPath: 'Brand Studio/pixel/operational/principles/',
    configPath: 'Brand Studio/pixel/operational/agent/',
    logicalScripts: ['marketing_laws.py','prompt_craft.py'],
    departmentLeader: 'spark',
  },
  {
    shortId: 'pulse', name: 'Pulse', department: 'Brand Studio',
    role: 'Social Media', isLeader: false,
    identityPath: '', principlesPath: 'Brand Studio/pulse/operational/principles/',
    configPath: 'Brand Studio/pulse/operational/agent/',
    logicalScripts: ['marketing_laws.py','content_performance.py'],
    departmentLeader: 'spark',
  },
  {
    shortId: 'rio', name: 'Rio', department: 'Brand Studio',
    role: 'Ads', isLeader: false,
    identityPath: '', principlesPath: 'Brand Studio/rio/operational/principles/',
    configPath: 'Brand Studio/rio/operational/agent/',
    logicalScripts: ['marketing_laws.py','experiment_methods.py','signal_detection.py','capital_budgeting.py'],
    departmentLeader: 'spark',
  },
  {
    shortId: 'nate', name: 'Nate', department: 'Brand Studio',
    role: 'Growth', isLeader: false,
    identityPath: '', principlesPath: 'Brand Studio/nate/operational/principles/',
    configPath: 'Brand Studio/nate/operational/agent/',
    logicalScripts: ['experiment_methods.py','signal_detection.py','marketing_laws.py'],
    departmentLeader: 'spark',
  },
  {
    shortId: 'kai', name: 'Kai', department: 'Brand Studio',
    role: 'Analyst', isLeader: false,
    identityPath: '', principlesPath: 'Brand Studio/kai/operational/principles/',
    configPath: 'Brand Studio/kai/operational/agent/',
    logicalScripts: ['signal_detection.py','investor_metrics.py','experiment_methods.py','marketing_laws.py'],
    departmentLeader: 'spark',
  },
  {
    shortId: 'tempo', name: 'Tempo', department: 'Brand Studio',
    role: 'Audio Branding', isLeader: false,
    identityPath: '', principlesPath: 'Brand Studio/tempo/operational/principles/',
    configPath: 'Brand Studio/tempo/operational/agent/',
    logicalScripts: ['marketing_laws.py'],
    departmentLeader: 'spark',
  },
]

// ═══════════════════════════════════════════════════════════════════
// Lookup functions
// ═══════════════════════════════════════════════════════════════════

/** Lookup by short ID or full name */
export function getAgentProfile(id: string): AgentProfile | undefined {
  const lower = id.toLowerCase()
  return AGENT_REGISTRY.find(
    (p) => p.shortId === lower || p.name.toLowerCase() === lower
  )
}

/** Get all agents in a department */
export function getDepartmentAgents(department: string): AgentProfile[] {
  return AGENT_REGISTRY.filter(p => p.department === department)
}

/** Get the department leader */
export function getDepartmentLeader(department: string): AgentProfile | undefined {
  return AGENT_REGISTRY.find(p => p.department === department && p.isLeader)
}

/** Get all department leaders */
export function getLeaders(): AgentProfile[] {
  return AGENT_REGISTRY.filter(p => p.isLeader)
}

/** List all departments */
export function getDepartments(): string[] {
  return [...new Set(AGENT_REGISTRY.map(p => p.department))]
}

/**
 * Derive a system prompt extension from the department framework.
 * This REPLACES the old hardcoded personality strings.
 * At runtime, the engine reads identity/principles files and builds the prompt.
 */
export function getAgentContext(id: string): {
  profile: AgentProfile | undefined
  department: string
  leader: string
  logicalScriptCount: number
  /** Paths to read for prompt building */
  paths: { identity: string; principles: string; config: string }
} {
  const profile = getAgentProfile(id)
  if (!profile) {
    return {
      profile: undefined, department: '', leader: '', logicalScriptCount: 0,
      paths: { identity: '', principles: '', config: '' },
    }
  }
  return {
    profile,
    department: profile.department,
    leader: profile.departmentLeader,
    logicalScriptCount: profile.logicalScripts.length,
    paths: {
      identity: profile.identityPath,
      principles: profile.principlesPath,
      config: profile.configPath,
    },
  }
}

/** Count of registered agents */
export const AGENT_COUNT = AGENT_REGISTRY.length

/** Count of departments */
export const DEPARTMENT_COUNT = getDepartments().length
