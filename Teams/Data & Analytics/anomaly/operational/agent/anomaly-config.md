---
agent: anomaly
department: Data & Analytics
type: config
required_by: [custom/anomaly-detection-rules/SKILL.md, custom/alert-routing/SKILL.md, custom/incident-triage-data/SKILL.md]
last_updated: 2026-07-29
---

# anomaly · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |
| On-call rotation | `<FILL_IN>` |

## Alert-fatigue guardrails
| Field | Value |
|---|---|
| Max fires per rule per day (backtest floor) | `<FILL_IN — e.g., 5>` |
| Default cooldown (warning) | `<FILL_IN — 15m>` |
| Default cooldown (critical) | `<FILL_IN — 5m>` |

## Known-events log
Path to operator-declared known-events file (deploys, launches, holidays, campaigns).

## Escalation
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine rule reg · triage | anomaly |
| L2 | Rule fires > threshold · false-positive trend | `<FILL_IN>` |
| L3 | Critical unresolved > 30m · alert-system down · data-quality systemic | `Governance/board` |

All `<FILL_IN>` per §14.7.
