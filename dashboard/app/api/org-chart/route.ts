// GET /api/org-chart
// Real YVON fleet — 46 agents · 7 departments — built from lib/fleet.ts
// (generated from Teams/, the source of truth). TS-005 alignment.
import { FLEET, FLEET_DEPARTMENTS, fleetByDepartment, type FleetAgent, type FleetDepartment } from '@/lib/fleet'

export interface OrgChartAgent {
  id: string; name: string; role: string; department: string
  color: string; initials: string; status: string
  skillsCount: number; memoryHealth: number; level: number
  reportsTo: string; memoryAccess: string
  workspaceTags: string[]
}
export interface OrgChartNode { agent: OrgChartAgent; children: OrgChartNode[] }
export interface OrgChartTier { title: string; sub: string; agents: OrgChartAgent[]; nodes?: OrgChartNode[] }
export interface OrgChartResponse {
  tree: OrgChartNode; tiers: OrgChartTier[]
  totalAgents: number; departments: number; workshops: WorkshopInfo[]
}
export interface WorkshopInfo { id: string; name: string; icon: string; color: string; improving: string; agentIds: string[] }

// Department leaders (report directly to the operator) — from CLAUDE.md routing table.
const DEPT_LEADER: Record<FleetDepartment, string> = {
  'Executive Office': 'marcus',
  'Engineering': 'dev',
  'Brand Studio': 'spark',
  'Cybersecurity': 'warden',
  'Governance': 'board',
  'Product': 'spec',
  'AI & Agents': 'meta',
  // 2026-08-15 — 6 new departments, leaders per root CLAUDE.md's routing table.
  'Client Success': 'ally',
  'Comms & PR': 'herald',
  'Global Expansion': 'compass',
  'Growth & Partnerships': 'quest',
  'People & Culture': 'hire',
  'Risk & ESG': 'pilot',
}
const DEPT_SUB: Record<FleetDepartment, string> = {
  'Executive Office': 'Strategy, vision, investor comms — serves you directly',
  'Engineering': 'Everything that ships — build, deploy, QA, data, security',
  'Brand Studio': 'Creative direction, brand system, copy, visual, social',
  'Cybersecurity': 'GRC, IAM, infra security, detection, data protection',
  'Governance': 'Fiduciary oversight, precedent, audit',
  'Product': 'PRD, analytics, research, validation, pricing',
  'AI & Agents': 'Fleet governance, integrations, quality, benchmarks',
  'Client Success': 'Health scoring, lifecycle value, onboarding, retention, support ops',
  'Comms & PR': 'Media relations, press kits, internal comms, investor comms, crisis comms',
  'Global Expansion': 'Market selection, entry mode, localization, cross-border operations',
  'Growth & Partnerships': 'Sales, demand-gen, partnerships, pricing, GTM strategy',
  'People & Culture': 'Hiring, L&D, performance management, wellbeing, HR strategy',
  'Risk & ESG': 'Enterprise risk, ESG reporting, operational resilience, risk appetite',
}

function toAgent(a: FleetAgent, reportsTo: string, level: number): OrgChartAgent {
  return {
    id: a.id, name: a.name, role: a.role || a.department, department: a.department,
    color: a.color, initials: a.name.slice(0, 2).toUpperCase(), status: 'active',
    skillsCount: 0, memoryHealth: 100, level,
    reportsTo, memoryAccess: level <= 1 ? 'full — cross-workspace' : 'workspace',
    workspaceTags: [],
  }
}

function buildTree(): OrgChartNode {
  const you: OrgChartAgent = {
    id: 'operator', name: 'You', role: 'Operator', department: 'Command',
    color: '#e2e2e2', initials: 'YOU', status: 'active', skillsCount: 0, memoryHealth: 100,
    level: 0, reportsTo: '', memoryAccess: 'root', workspaceTags: [],
  }
  const deptNodes: OrgChartNode[] = FLEET_DEPARTMENTS.map((dept) => {
    const leaderId = DEPT_LEADER[dept]
    const members = fleetByDepartment(dept)
    const leader = members.find((m) => m.id === leaderId) ?? members[0]
    const leaderNode: OrgChartAgent = toAgent(leader, 'You', 1)
    const children = members
      .filter((m) => m.id !== leader.id)
      .map((m) => ({ agent: toAgent(m, leader.name, 2), children: [] }))
    return { agent: leaderNode, children }
  })
  return { agent: you, children: deptNodes }
}

function buildTiers(): OrgChartTier[] {
  return FLEET_DEPARTMENTS.map((dept) => ({
    title: dept,
    sub: DEPT_SUB[dept],
    agents: fleetByDepartment(dept).map((a) =>
      toAgent(a, a.id === DEPT_LEADER[dept] ? 'You' : DEPT_LEADER[dept], a.id === DEPT_LEADER[dept] ? 1 : 2)),
  }))
}

export async function GET() {
  const response: OrgChartResponse = {
    tree: buildTree(),
    tiers: buildTiers(),
    totalAgents: FLEET.length,
    departments: FLEET_DEPARTMENTS.length,
    workshops: [],
  }
  return Response.json(response)
}
