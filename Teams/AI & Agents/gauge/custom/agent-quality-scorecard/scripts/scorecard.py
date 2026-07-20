#!/usr/bin/env python3
"""scorecard.py — per-agent quality flags (gauge / agent-quality-scorecard).

Usage: python scorecard.py <metrics.json> [--thresholds <thresholds.json>]

metrics.json shape (per agent, current period + trailing periods for drift):
{
  "period": "2026-W28",
  "agents": {
    "<name>": {
      "tasks": 40, "succeeded": 38, "cost_total": 12.0, "latency_p95_s": 30,
      "escalations": 2,
      "trailing": {"cost_per_task": [0.30, 0.31, 0.29, 0.30], "latency_p95_s": [28, 30, 29, 31],
                    "escalation_rate": [0.05, 0.04, 0.06, 0.05]}
    }
  }
}

Default thresholds (catalog-suggested, reasoning-based — override via --thresholds):
  success_floor 0.90 · cost_drift_max 0.20 · latency_drift_max 0.20 · escalation_drift_max 0.50
Flags print one per line: FLAG <agent> <metric> value=<v> baseline=<b> threshold=<t> -> route to forge
Exit 0 = no flags, 1 = flags raised, 2 = usage/data error.
"""
import json
import sys

# Catalog-suggested defaults; reasoning-based, not formula-verified (rule 0.6).
DEFAULTS = {"success_floor": 0.90, "cost_drift_max": 0.20,
            "latency_drift_max": 0.20, "escalation_drift_max": 0.50}


def mean(xs):
    return sum(xs) / len(xs) if xs else None


def drift(current, baseline):
    if baseline in (None, 0):
        return None  # no baseline -> no drift computable; report MISSING, never impute
    return (current - baseline) / baseline


def evaluate(agent, m, th):
    flags, notes = [], []
    tasks = m.get("tasks", 0)
    if tasks == 0:
        notes.append(f"NOTE {agent}: no tasks this period (MISSING, not healthy)")
        return flags, notes
    success = m.get("succeeded", 0) / tasks
    if success < th["success_floor"]:
        flags.append((agent, "success_rate", f"{success:.2%}", "-", f"<{th['success_floor']:.0%}"))
    cpt = m.get("cost_total", 0) / tasks
    trailing = m.get("trailing", {})
    checks = [("cost_per_task", cpt, mean(trailing.get("cost_per_task", [])), th["cost_drift_max"]),
              ("latency_p95_s", m.get("latency_p95_s"), mean(trailing.get("latency_p95_s", [])), th["latency_drift_max"]),
              ("escalation_rate", m.get("escalations", 0) / tasks, mean(trailing.get("escalation_rate", [])), th["escalation_drift_max"])]
    for name, cur, base, dmax in checks:
        if cur is None:
            notes.append(f"NOTE {agent}: {name} MISSING")
            continue
        d = drift(cur, base)
        if d is None:
            notes.append(f"NOTE {agent}: {name} has no baseline yet")
        elif d > dmax:
            flags.append((agent, name, f"{cur:.3g}", f"{base:.3g}", f"drift {d:+.0%} > {dmax:.0%}"))
    return flags, notes


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    with open(sys.argv[1]) as f:
        data = json.load(f)
    th = dict(DEFAULTS)
    if "--thresholds" in sys.argv:
        with open(sys.argv[sys.argv.index("--thresholds") + 1]) as f:
            th.update(json.load(f))
    all_flags = []
    print(f"# Scorecard {data.get('period', '?')}")
    for agent, m in sorted(data.get("agents", {}).items()):
        flags, notes = evaluate(agent, m, th)
        all_flags.extend(flags)
        for n in notes:
            print(n)
    for a, metric, v, b, t in all_flags:
        print(f"FLAG {a} {metric} value={v} baseline={b} threshold={t} -> route to forge (degradation-routing)")
    print(f"# {len(all_flags)} flag(s)")
    return 1 if all_flags else 0


if __name__ == "__main__":
    sys.exit(main())
