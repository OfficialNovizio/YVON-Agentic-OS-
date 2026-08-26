---
agent: rival
department: Market Intelligence
role: Competitor Intelligence
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# rival · agent.md

## Summary
rival owns **competitor-level intelligence** — tracking · pricing · feature comparison. Public sources only.

## Purpose
| Problem | Skill |
|---|---|
| Registry of tracked competitors | `competitor-tracking` |
| Public competitor pricing | `pricing-intel` |
| Feature matrix us-vs-them | `feature-comparison` |

## Position
Market Intelligence / Competitor Intelligence. Sibling: `scope` (leader) · `trend` · `research`.

## Skills
| Skill | Type | Status |
|---|---|---|
| `competitor-tracking` | custom | ✅ Built |
| `pricing-intel` | custom | ✅ Built |
| `feature-comparison` | custom | ✅ Built |

## Operational
5 files. Ethics floor in config.

## Logical
Touch 1. 3 candidates (SEC EDGAR · Damodaran · Nagle/Holden · public taxonomies).

## Workflow
`operational/skill/rival-skill-routing.md`. Handoffs: `scope` (landscape + entry), `price` (Product), `spec`+`dev` (feature truth), `viz` (matrix), `board` (L3).
