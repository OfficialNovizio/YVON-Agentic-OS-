---
agent: trend
department: Market Intelligence
type: config
required_by: [custom/macro-signals/SKILL.md, custom/emerging-trends/SKILL.md, custom/regulatory-horizon/SKILL.md]
last_updated: 2026-07-29
---

# trend · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |
| Escalation | `<FILL_IN>` |

## Macro signals watched
| Signal | Source | Material-shift threshold |
|---|---|---|
| `<FILL_IN — e.g., US CPI>` | `<FILL_IN — FRED series ID>` | `<FILL_IN — ±0.5%>` |

## Emerging-trend sources
| Source | Type | Cadence |
|---|---|---|
| Crunchbase | Funding | daily |
| USPTO Assignee | Patents | weekly |
| Semantic Scholar / arXiv | Papers | daily |
| GitHub trending | Dev tooling | daily |
| Google Trends | Search | weekly |

## Regulatory sources per jurisdiction
| Jurisdiction | Legislative source | Regulatory source |
|---|---|---|
| `<FILL_IN>` | `<FILL_IN — e.g., Congress.gov>` | `<FILL_IN — e.g., Federal Register>` |

## Escalation
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine trend brief | trend |
| L2 | Material macro shift · gaining-tier trend crossing category threshold | `<FILL_IN>` |
| L3 | Market-critical regulatory pipeline (>70% pass · in-scope) · macro regime change | `Governance/board` |
