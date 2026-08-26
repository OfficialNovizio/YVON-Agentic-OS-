---
agent: viz
department: Data & Analytics
type: config
required_by: [custom/dashboard-standards/SKILL.md, custom/viz-accessibility/SKILL.md, custom/dashboard-audit/SKILL.md]
last_updated: 2026-07-29
---

# viz · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |

## Standards
| Field | Value |
|---|---|
| WCAG compliance floor | `<FILL_IN — AA / AAA>` |
| Colour-blind sim types | deuteranopia · protanopia · tritanopia |
| Approved palette (categorical) | Okabe-Ito |
| Approved palette (sequential) | viridis or cividis |

## Portfolio audit
| Field | Value |
|---|---|
| Staleness threshold (days since refresh) | `<FILL_IN — 30>` |
| Orphan threshold (unique viewers / 90 days) | `<FILL_IN — 3>` |
| Cadence | `<FILL_IN — quarterly>` |

## Escalation
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine standards check | viz |
| L2 | A11y fail · standards violation on shipped dashboard | `<FILL_IN>` |
| L3 | Portfolio-wide non-compliance · executive dashboard a11y-fail | `Governance/board` |

All `<FILL_IN>` per §14.7.
