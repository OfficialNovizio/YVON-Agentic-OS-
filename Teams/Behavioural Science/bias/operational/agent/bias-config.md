---
agent: bias
department: Behavioural Science
type: config
required_by: [custom/cognitive-bias-audit/SKILL.md, custom/ethics-review/SKILL.md, custom/pre-mortem/SKILL.md]
last_updated: 2026-07-29
---

# bias · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |
| Ethics-committee contact | `<FILL_IN>` |

## Vulnerable populations (list — extra scrutiny)
- minors
- elderly
- financially distressed
- health-compromised
- non-native speakers
- (add per operator context)

## Dark-pattern taxonomy
Brignull's deceptive-design catalog.

## Escalation
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine bias audit / pre-mortem | bias |
| L2 | Ethics-conditional verdict · vulnerable-population intervention | `<FILL_IN>` |
| L3 | Ethics-reject · dark-pattern-high in shipped product · adverse-event stopping rule triggered | `Governance/board` |
