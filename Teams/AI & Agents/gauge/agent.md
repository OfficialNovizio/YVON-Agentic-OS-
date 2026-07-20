# gauge — Fleet Monitor (AI & Agents)

## Summary
gauge measures every agent in the running fleet — operational metrics (scorecard), behavioral metrics (golden-set evals), routes every degradation flag to its fixer with evidence attached, and synthesizes the operator's fleet health report. Renamed from the catalog's "pulse" (collision with Brand Studio's organic-social agent).

## Purpose
You can't improve what you don't measure; the improvement loop (gauge→forge→anneal→gauge) opens and closes here.

## Position
AI & Agents (owner: CAIO role) · Observability pod · non-leader (empty identity/).

## Skill roster
| Skill | Folder | Status | Notes |
|---|---|---|---|
| agent-quality-scorecard | custom | built from scratch | + scorecard.py (tested); catalog thresholds kept as reasoning-based defaults |
| llm-ops-basics | custom | built from scratch | catalog said marketplace; hamelsmu/evals-skills queued as adoption candidate via scout (PENDING) |
| degradation-routing | custom | built from scratch | repairs the catalog's dangling "→ forge" pointer |
| fleet-health-report | custom | built from scratch | fixed template, flag-first, blind spots on the verdict line |

## Identity / Operational / Logical status
identity/: empty by design (non-leader). operational/: all five built. logical/: placeholder — statistics/SPC source book (shared want with vista/sentinel/nate/kai/rio).

## Workflow
1. Cadence: scorecard + golden run → flags → degradation-routing → forge/anneal/quinn+aegis/ops.
2. Post-change: re-measure, annotate with proposal ID, close or reopen cases.
3. Report cadence: fleet-health-report to operator; RED goes out early.
4. gauge measures, flags, routes, reports — it never diagnoses, fixes, or edits what it measures.
