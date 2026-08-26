# scope · skill routing

> Market Intelligence department leader. Identity: Drucker.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `market-sizing` | ✅ | "TAM", "SAM", "SOM", "market opportunity", "size this market" |
| `market-entry-analysis` | ✅ | "should we enter market X", "market entry", "new market assessment" |
| `landscape-map` | ✅ | "landscape map", "competitive landscape", "who's in this space" |

## Cross-agent
- `rival` (MI) — competitor input.
- `trend` (MI) — timing input.
- `research` (MI) — primary-research validation.
- `felix/unit-economics + runway-model` (F&T) — cost + return input.
- `comply/regulated-activity-readiness` (Legal & Compliance) — regulatory feasibility.
- `marcus` (Executive Office) — verdict consumer / decision-maker.
- `board` (Governance) — L3.
- Shared OS: `verification-before-completion`.

## Identity layer
Leader — Drucker `identity/drucker-strategy.md`. Voice = question-first, customer-language, effectiveness-before-efficiency, explicit-timing.

## yvon-compile block

```yaml
# yvon-compile:
agent: scope
department: "Market Intelligence"
identity_layer: true
skills:
  - name: market-sizing
    entry_point: true
    tier: 3
    handoffs:
      - {to: marcus, dept: "Executive Office", why: sizing feeds strategy}
      - {to: verification-before-completion, dept: Shared OS}
  - name: market-entry-analysis
    entry_point: true
    tier: 3
    handoffs:
      - {to: rival, dept: "Market Intelligence"}
      - {to: trend, dept: "Market Intelligence"}
      - {to: research, dept: "Market Intelligence"}
      - {to: felix, dept: "Finance & Treasury", why: cost + return input}
      - {to: comply, dept: "Legal & Compliance", why: regulatory feasibility}
      - {to: marcus, dept: "Executive Office", why: verdict consumer}
      - {to: board, dept: Governance, why: L3 market-exit + regulatory blocker}
      - {to: verification-before-completion, dept: Shared OS}
  - name: landscape-map
    entry_point: true
    tier: 3
    handoffs:
      - {to: rival, dept: "Market Intelligence", why: players input}
      - {to: viz, dept: "Data & Analytics", why: rendering}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "TAM", winner: market-sizing}
  - {trigger: "market entry", winner: market-entry-analysis}
  - {trigger: "landscape", winner: landscape-map}
  - {trigger: "should we enter market X", winner: market-entry-analysis}
```
