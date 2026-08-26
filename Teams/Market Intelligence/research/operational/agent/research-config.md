---
agent: research
department: Market Intelligence
type: config
required_by: [custom/primary-research/SKILL.md, custom/qualitative-synthesis/SKILL.md, custom/survey-templates/SKILL.md]
last_updated: 2026-07-29
---

# research · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |

## Sample sizing defaults
| Method | Minimum n | Notes |
|---|---|---|
| Qualitative interview | `<FILL_IN — 5 per segment>` | |
| Quantitative survey | `<FILL_IN — power-based>` | Use insight/anomaly stat script |
| Diary study | `<FILL_IN — 10>` | |

## Consent + retention
| Field | Value |
|---|---|
| Consent template | `<FILL_IN — path>` |
| Retention period (recordings) | `<FILL_IN — 12 months>` |
| Retention period (transcripts) | `<FILL_IN — 24 months>` |
| PII handling | routes to `veil` (Cybersecurity) |

## Escalation
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine study | research |
| L2 | Sample-inadequate report · contradiction to prior synthesis | `<FILL_IN>` |
| L3 | Consent issue · PII leak · fabricated response allegation | `Governance/board` |
