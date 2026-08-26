---
agent: rival
department: Market Intelligence
type: config
required_by: [custom/competitor-tracking/SKILL.md, custom/pricing-intel/SKILL.md, custom/feature-comparison/SKILL.md]
last_updated: 2026-07-29
---

# rival · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |
| Ownership | `<FILL_IN>` |

## Competitors in scope
| Slug | Name | Category | Refresh cadence |
|---|---|---|---|
| `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN — monthly / quarterly>` |

## Refresh triggers
- Funding round · pricing change · product launch · exec change · news signal

## Ethics floor
- **Never use** NDA-obtained · channel-partner-shared · scraped-behind-auth pricing.
- **Public sources only.**
- **Rumours tagged** `[rumoured — needs verification]`.

## Escalation
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine update / lookup | rival |
| L2 | Major competitor move · funding round · executive departure | `<FILL_IN>` |
| L3 | Competitive acquisition threat · category disruption | `Governance/board` |
