// AUTO-GENERATED from Teams/ by cli/gen-fleet.py — do not edit by hand.
// The real YVON fleet. Regenerate when Teams/ changes: python3 cli/gen-fleet.py

export type FleetDepartment =
  | 'Executive Office'
  | 'Engineering'
  | 'Brand Studio'
  | 'Cybersecurity'
  | 'Product'
  | 'Governance'
  | 'AI & Agents'

export interface FleetAgent {
  id: string
  name: string
  role: string
  department: FleetDepartment
  color: string
  icon: string
}

export const FLEET: FleetAgent[] = [
  // ── Executive Office ──
  { id: 'echo', name: 'Echo', role: 'Investor Relations', department: 'Executive Office', color: '#F59E0B', icon: '👑' },
  { id: 'marcus', name: 'Marcus', role: 'Orchestrator', department: 'Executive Office', color: '#F59E0B', icon: '👑' },
  { id: 'vista', name: 'Vista', role: 'Roadmap Lead', department: 'Executive Office', color: '#F59E0B', icon: '👑' },
  // ── Engineering ──
  { id: 'aegis', name: 'Aegis', role: 'Application Security (defense)', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  { id: 'axiom', name: 'Axiom', role: 'Algorithms & Data Structures', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  { id: 'cypher', name: 'Cypher', role: 'Adversary / Red Team (offense) — caged', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  { id: 'dana', name: 'Dana', role: 'Data Architecture', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  { id: 'dev', name: 'Dev', role: 'Lead Developer', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  { id: 'mia', name: 'Mia', role: 'Frontend Web', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  { id: 'nova', name: 'Nova', role: 'Mobile', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  { id: 'ops', name: 'Ops', role: 'DevOps & Reliability — production owner, the safety net', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  { id: 'quinn', name: 'Quinn', role: 'QA — blocking gate + Security Charter control point', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  { id: 'raj', name: 'Raj', role: 'Backend & APIs', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  { id: 'rank', name: 'Rank', role: 'Technical SEO', department: 'Engineering', color: '#3B82F6', icon: '💻' },
  // ── Brand Studio ──
  { id: 'atlas', name: 'Atlas', role: 'Art Director', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  { id: 'kai', name: 'Kai', role: 'Analyst', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  { id: 'lena', name: 'Lena', role: 'Brand Voice', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  { id: 'muse', name: 'Muse', role: 'Ideation', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  { id: 'nate', name: 'Nate', role: 'Growth', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  { id: 'pixel', name: 'Pixel', role: 'Production', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  { id: 'pulse', name: 'Pulse', role: 'Social Media', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  { id: 'rio', name: 'Rio', role: 'Ads', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  { id: 'spark', name: 'Spark', role: 'Creative Director', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  { id: 'tempo', name: 'Tempo', role: 'Audio Branding', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  { id: 'weave', name: 'Weave', role: 'Storytelling', department: 'Brand Studio', color: '#EC4899', icon: '🎨' },
  // ── Cybersecurity ──
  { id: 'bastion', name: 'Bastion', role: '', department: 'Cybersecurity', color: '#EF4444', icon: '🛡️' },
  { id: 'cortex', name: 'Cortex', role: '', department: 'Cybersecurity', color: '#EF4444', icon: '🛡️' },
  { id: 'keyring', name: 'Keyring', role: '', department: 'Cybersecurity', color: '#EF4444', icon: '🛡️' },
  { id: 'veil', name: 'Veil', role: '', department: 'Cybersecurity', color: '#EF4444', icon: '🛡️' },
  { id: 'warden', name: 'Warden', role: '', department: 'Cybersecurity', color: '#EF4444', icon: '🛡️' },
  // ── Product ──
  { id: 'loom', name: 'Loom', role: '', department: 'Product', color: '#10B981', icon: '📦' },
  { id: 'metric', name: 'Metric', role: '', department: 'Product', color: '#10B981', icon: '📦' },
  { id: 'price', name: 'Price', role: '', department: 'Product', color: '#10B981', icon: '📦' },
  { id: 'spec', name: 'Spec', role: '', department: 'Product', color: '#10B981', icon: '📦' },
  { id: 'ux', name: 'Ux', role: '', department: 'Product', color: '#10B981', icon: '📦' },
  // ── Governance ──
  { id: 'board', name: 'Board', role: 'Governance Gate', department: 'Governance', color: '#8B5CF6', icon: '⚖️' },
  { id: 'precedent', name: 'Precedent', role: 'Institutional Memory', department: 'Governance', color: '#8B5CF6', icon: '⚖️' },
  { id: 'sentinel', name: 'Sentinel', role: 'Compliance Monitor', department: 'Governance', color: '#8B5CF6', icon: '⚖️' },
  // ── AI & Agents ──
  { id: 'anneal', name: 'Anneal', role: '', department: 'AI & Agents', color: '#06B6D4', icon: '🤖' },
  { id: 'edge', name: 'Edge', role: '', department: 'AI & Agents', color: '#06B6D4', icon: '🤖' },
  { id: 'forge', name: 'Forge', role: '', department: 'AI & Agents', color: '#06B6D4', icon: '🤖' },
  { id: 'gauge', name: 'Gauge', role: '', department: 'AI & Agents', color: '#06B6D4', icon: '🤖' },
  { id: 'meta', name: 'Meta', role: '', department: 'AI & Agents', color: '#06B6D4', icon: '🤖' },
  { id: 'proto', name: 'Proto', role: '', department: 'AI & Agents', color: '#06B6D4', icon: '🤖' },
  { id: 'relay', name: 'Relay', role: '', department: 'AI & Agents', color: '#06B6D4', icon: '🤖' },
  { id: 'scout', name: 'Scout', role: '', department: 'AI & Agents', color: '#06B6D4', icon: '🤖' },
]

export const FLEET_DEPARTMENTS: FleetDepartment[] = [
  'Executive Office', 'Engineering', 'Brand Studio', 'Cybersecurity', 'Product', 'Governance', 'AI & Agents'
]

export function fleetByDepartment(dept: FleetDepartment): FleetAgent[] {
  return FLEET.filter((a) => a.department === dept)
}
export function getFleetAgent(id: string): FleetAgent | undefined {
  return FLEET.find((a) => a.id === id)
}
