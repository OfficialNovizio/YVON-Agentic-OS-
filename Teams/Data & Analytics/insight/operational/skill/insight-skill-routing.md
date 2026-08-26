# insight · skill routing

> Data & Analytics department leader. Identity: Tukey EDA persona.

## Skill map
| Skill | Entry? | Triggers |
|---|---|---|
| `business-pulse` (marketplace) | ✅ | "business pulse", "how are we doing", "Monday brief" |
| `metric-definitions-registry` | ✅ | "metric definition", "what does X mean", "register a metric" |
| `ad-hoc-analysis` | ✅ | "analyze this", "why did X spike", "deep-dive" |
| `exec-dashboard` | ✅ | "executive dashboard", "MBR deck", "refresh the dashboard" |

## Precedence
| Trigger | Winner |
|---|---|
| "dashboard" | ASK — one-page pulse, exec-recurring, or ad-hoc? |
| "analyze" | ad-hoc-analysis |
| "what does revenue mean" | metric-definitions-registry |

## Cross-agent handoffs
- `query` (D&A) — SQL execution.
- `viz` (D&A) — chart rendering.
- `anomaly` (D&A) — anomaly detection feeds ad-hoc-analysis.
- `dana` (Engineering) — data pipelines; consume, do not overlap.
- `felix` (F&T) — financial metrics owned there.
- `metric` (Product) — product metrics owned there.
- Shared OS: `verification-before-completion`.

## Identity
Leader. Tukey EDA discipline via `identity/tukey-EDA.md`.

## yvon-compile block

```yaml
# yvon-compile:
agent: insight
department: "Data & Analytics"
identity_layer: true
skills:
  - {name: business-pulse, entry_point: true, tier: 3, handoffs: [{to: verification-before-completion, dept: Shared OS}]}
  - {name: metric-definitions-registry, entry_point: true, tier: 3, handoffs: [{to: verification-before-completion, dept: Shared OS}]}
  - name: ad-hoc-analysis
    entry_point: true
    tier: 3
    handoffs:
      - {to: query, dept: "Data & Analytics", why: SQL execution}
      - {to: viz, dept: "Data & Analytics", why: chart rendering}
      - {to: verification-before-completion, dept: Shared OS}
  - name: exec-dashboard
    entry_point: true
    tier: 3
    handoffs:
      - {to: query, dept: "Data & Analytics"}
      - {to: viz, dept: "Data & Analytics"}
      - {to: anomaly, dept: "Data & Analytics", why: widget threshold triggers anomaly alert}
      - {to: board, dept: Governance, why: L3 executive dashboard down}
      - {to: verification-before-completion, dept: Shared OS}
precedence:
  - {trigger: "dashboard", winner: null}
  - {trigger: "analyze this", winner: ad-hoc-analysis}
  - {trigger: "metric definition", winner: metric-definitions-registry}
  - {trigger: "business pulse", winner: business-pulse}
```
