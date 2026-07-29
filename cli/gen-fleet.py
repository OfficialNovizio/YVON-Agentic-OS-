#!/usr/bin/env python3
"""
gen-fleet.py — regenerate dashboard/lib/fleet.ts from Teams/ (source of truth).
Run whenever agents or departments are added/renamed under Teams/ so the
dashboard (org-chart, agents, dashboard-home stats) reflects the real, growing fleet.

  python3 cli/gen-fleet.py
"""
import os, re, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
TEAMS = os.path.join(ROOT, 'Teams')
OUT = os.path.join(ROOT, 'dashboard', 'lib', 'fleet.ts')

# Canonical department order + display colors/icons. New departments added under
# Teams/ that aren't listed here still appear (appended, neutral color).
DEPT_ORDER = ['Executive Office', 'Engineering', 'Brand Studio', 'Cybersecurity',
              'Product', 'Governance', 'AI & Agents']
DEPT_COLOR = {'Executive Office': '#F59E0B', 'Engineering': '#3B82F6', 'Brand Studio': '#EC4899',
              'Cybersecurity': '#EF4444', 'Governance': '#8B5CF6', 'Product': '#10B981', 'AI & Agents': '#06B6D4'}
DEPT_ICON = {'Executive Office': '👑', 'Engineering': '💻', 'Brand Studio': '🎨', 'Cybersecurity': '🛡️',
             'Governance': '⚖️', 'Product': '📦', 'AI & Agents': '🤖'}


def collect():
    agents = []
    for dept in sorted(os.listdir(TEAMS)):
        dp = os.path.join(TEAMS, dept)
        if not os.path.isdir(dp) or dept == 'Shared OS':
            continue
        for ag in sorted(os.listdir(dp)):
            md = os.path.join(dp, ag, 'agent.md')
            if not os.path.isfile(md):
                continue
            head = open(md, encoding='utf-8').read()[:600]
            def f(k):
                m = re.search(r'^%s:\s*(.+)$' % k, head, re.M)
                return m.group(1).strip() if m else ''
            name = f('name') or ag
            agents.append({'id': ag, 'name': name[:1].upper() + name[1:], 'role': f('role'),
                           'department': f('department') or dept})
    return agents


def emit(agents):
    depts = DEPT_ORDER + [d for d in {a['department'] for a in agents} if d not in DEPT_ORDER]
    esc = lambda s: s.replace('\\', '\\\\').replace("'", "\\'")
    L = ['// AUTO-GENERATED from Teams/ by cli/gen-fleet.py — do not edit by hand.',
         '// The real YVON fleet. Regenerate when Teams/ changes: python3 cli/gen-fleet.py', '',
         'export type FleetDepartment =', '  | ' + '\n  | '.join(f"'{d}'" for d in depts), '',
         'export interface FleetAgent {', '  id: string', '  name: string', '  role: string',
         '  department: FleetDepartment', '  color: string', '  icon: string', '}', '',
         'export const FLEET: FleetAgent[] = [']
    for d in depts:
        L.append(f'  // ── {d} ──')
        for a in [x for x in agents if x['department'] == d]:
            L.append("  { id: '%s', name: '%s', role: '%s', department: '%s', color: '%s', icon: '%s' },"
                     % (esc(a['id']), esc(a['name']), esc(a['role']), esc(a['department']),
                        DEPT_COLOR.get(d, '#64748B'), DEPT_ICON.get(d, '🔹')))
    L += [']', '',
          'export const FLEET_DEPARTMENTS: FleetDepartment[] = [',
          '  ' + ', '.join(f"'{d}'" for d in depts), ']', '',
          'export function fleetByDepartment(dept: FleetDepartment): FleetAgent[] {',
          '  return FLEET.filter((a) => a.department === dept)', '}',
          'export function getFleetAgent(id: string): FleetAgent | undefined {',
          '  return FLEET.find((a) => a.id === id)', '}', '']
    open(OUT, 'w').write('\n'.join(L))


if __name__ == '__main__':
    agents = collect()
    emit(agents)
    from collections import Counter
    c = Counter(a['department'] for a in agents)
    print(f'✅ {len(agents)} agents → {OUT}')
    for d, n in c.most_common():
        print(f'   {d}: {n}')
