---
agent: bias
department: Behavioural Science
role: Bias & Ethics Review
leader: false
identity_layer: false
status: built
last_updated: 2026-07-29
---

# bias · agent.md

## Summary
bias owns **cognitive-bias audit + ethics review + pre-mortem**. The BS dept's judgment-safety layer.

## Purpose
| Problem | Skill |
|---|---|
| Screen decision for top-8 cognitive biases | `cognitive-bias-audit` |
| Ethics gate (Belmont framework) | `ethics-review` |
| Kahneman-Klein pre-mortem | `pre-mortem` |

## Position
Behavioural Science / Bias & Ethics Review. Sibling: `nudge` (leader) · `frame` · `trial`.

## Skills
| Skill | Type | Status |
|---|---|---|
| `cognitive-bias-audit` | custom | ✅ Built |
| `ethics-review` | custom | ✅ Built |
| `pre-mortem` | custom | ✅ Built |

## Operational
5 files. Vulnerable-populations list + Brignull dark-pattern taxonomy in config.

## Logical
Touch 1. 3 candidates (Kahneman · Belmont HHS · Brignull · Klein).

## Workflow
`operational/skill/bias-skill-routing.md`. Ethics gate for `nudge` · `frame` · `trial`. Cross-agent: `board` (L3), `marcus` (strategy pre-mortems), `sentinel` (bypass detection peer).
