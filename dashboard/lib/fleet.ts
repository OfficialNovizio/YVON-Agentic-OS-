// ═══════════════════════════════════════════════════════════════
// YVON Dashboard — Fleet Observability (WI-4, TASK-SPEC TS-001)
// Live data read from the repo itself: Teams/ roster, dist/skills
// compiled output, store/telemetry invocation log, agent configs.
// Read-only by design (agents view = observe, never command).
// ═══════════════════════════════════════════════════════════════

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd(), '..');
const TEAMS = path.join(ROOT, 'Teams');
const DIST = path.join(ROOT, 'dist', 'skills');
const TELEMETRY = path.join(ROOT, 'store', 'telemetry', 'skill-invocations.jsonl');

const NON_DEPTS = new Set(['Books', 'Shared OS']);

export interface AgentStat {
  agent: string;
  dept: string;
  skillsCompiled: number;
  invocations: number;
  completions: number;
  blocked: number;
  configUnfilled: number;
  identity: string | null;
}

export interface FleetData {
  generatedAt: string;
  totals: {
    agents: number;
    departments: number;
    skillsCompiled: number;
    invocations: number;
    blocked: number;
    configsNeedingAttention: number;
  };
  agents: AgentStat[];
}

function safeDir(p: string): string[] {
  try {
    return fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return [];
  }
}

function telemetryByAgent(): Map<string, { inv: number; done: number; blocked: number }> {
  const map = new Map<string, { inv: number; done: number; blocked: number }>();
  try {
    const lines = fs.readFileSync(TELEMETRY, 'utf8').split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const e = JSON.parse(line);
        const cur = map.get(e.agent) || { inv: 0, done: 0, blocked: 0 };
        if (e.event === 'complete') {
          if (e.outcome === 'blocked') cur.blocked++;
          else cur.done++;
        } else {
          cur.inv++;
        }
        map.set(e.agent, cur);
      } catch { /* skip bad line */ }
    }
  } catch { /* no telemetry yet — renders as zeros, honestly */ }
  return map;
}

export function fleetStats(): FleetData {
  const tel = telemetryByAgent();
  const agents: AgentStat[] = [];
  const depts = safeDir(TEAMS).filter((d) => !NON_DEPTS.has(d));

  for (const dept of depts) {
    for (const agent of safeDir(path.join(TEAMS, dept))) {
      const aDir = path.join(TEAMS, dept, agent);
      if (!fs.existsSync(path.join(aDir, 'agent.md'))) continue;

      let configUnfilled = 0;
      try {
        const cfgDir = path.join(aDir, 'operational', 'agent');
        const cfg = fs.readdirSync(cfgDir).find((f) => f.endsWith('.md'));
        if (cfg) configUnfilled = (fs.readFileSync(path.join(cfgDir, cfg), 'utf8').match(/<FILL_IN>/g) || []).length;
      } catch { /* no config — shows 0, config column flags via skills view */ }

      let identity: string | null = null;
      try {
        const idFile = fs.readdirSync(path.join(aDir, 'identity')).find((f) => f.endsWith('.md'));
        identity = idFile ? idFile.replace('.md', '') : null;
      } catch { /* no identity dir */ }

      const t = tel.get(agent) || { inv: 0, done: 0, blocked: 0 };
      agents.push({
        agent,
        dept,
        skillsCompiled: safeDir(path.join(DIST, agent)).length,
        invocations: t.inv,
        completions: t.done,
        blocked: t.blocked,
        configUnfilled,
        identity,
      });
    }
  }

  agents.sort((a, b) => a.dept.localeCompare(b.dept) || a.agent.localeCompare(b.agent));
  return {
    generatedAt: new Date().toISOString(),
    totals: {
      agents: agents.length,
      departments: depts.length,
      skillsCompiled: agents.reduce((s, a) => s + a.skillsCompiled, 0),
      invocations: agents.reduce((s, a) => s + a.invocations, 0),
      blocked: agents.reduce((s, a) => s + a.blocked, 0),
      configsNeedingAttention: agents.filter((a) => a.configUnfilled > 0).length,
    },
    agents,
  };
}
