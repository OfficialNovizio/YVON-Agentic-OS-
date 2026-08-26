---
agent: anomaly
department: Data & Analytics
role: Anomaly Detection
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# anomaly · agent.md

## Summary
anomaly owns the **alert side of D&A** — detection rules · routing · triage of fired alerts. Distinct from `cortex` (security incidents) and `warden` (system risk).

## Purpose
| Problem | Skill |
|---|---|
| Which conditions on a metric fire what alert | `anomaly-detection-rules` |
| Where does a fired alert go | `alert-routing` |
| Is this real, false-positive, known event, or data-quality | `incident-triage-data` |

## Position
Data & Analytics / Anomaly Detection. Sibling: `insight` (leader) · `query` · `viz`.

## Skill roster
| Skill | Type | Status |
|---|---|---|
| `anomaly-detection-rules` | custom | ✅ Built |
| `alert-routing` | custom | ✅ Built |
| `incident-triage-data` | custom | ✅ Built |

## Operational
5 files built.

## Identity
None.

## Logical
Touch 1. 3 candidates (Rousseeuw · NIST · Google SRE · AWS reliability). Tier A/B. `anomaly_statistical_tests` flagged as cross-agent-migration candidate on second consumer.

## Workflow
`operational/skill/anomaly-skill-routing.md`. Handoffs: `insight` (metric registry + deeper analysis), `query` (lineage), `dana` (data-quality), `cortex` (peer for security-incident domain), `board` (L3).
