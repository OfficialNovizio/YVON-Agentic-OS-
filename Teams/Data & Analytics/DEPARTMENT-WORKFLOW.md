# Data & Analytics — Department Workflow

## Summary
Owns the **insight surface** on top of `dana`'s pipelines. Metric registry · BI · queries · visualisation · anomaly detection.

## Working structure
**Leader: `insight`** (Tukey EDA identity). Cross-agent routing through insight. Others: `query` · `viz` · `anomaly` — universal principles.

## Working tree
```
Teams/Data & Analytics/
├── README.md · DEPARTMENT-WORKFLOW.md
├── insight/      (4 skills: 1 marketplace + 3 custom + Tukey identity)
├── query/        (3 custom)
├── viz/          (3 custom)
└── anomaly/      (3 custom)
```

13 skills. 1 marketplace portable (business-pulse).

## Routing rules
- insight routes multi-agent asks
- All numbers reference canonical metrics (`insight/metric-definitions-registry`)
- All queries against catalog-registered datasets only (`query/warehouse-catalog`)
- All dashboards conform to viz standards + WCAG floor
- All anomalies triaged before routing further

## Escalation
L3 fixed to `Governance/board`. Always-L3:
- insight: exec dashboard down · systemic metric drift
- query: warehouse mutation attempted · systemic freshness failure
- viz: portfolio-wide non-compliance · exec dashboard a11y-fail
- anomaly: critical unresolved > 30m · alert-system down · systemic data-quality

## Boundaries with adjacent depts

| Case | We do | They do |
|---|---|---|
| Pipeline source → warehouse | consume | `Engineering/dana` |
| Product-metric definitions | consult registry | `Product/metric` owns product-metric semantics |
| Financial-metric definitions | consult registry | `Finance & Treasury/felix` owns financial-metric semantics |
| Security incident | route to cortex | `Cybersecurity/cortex` |
| System risk | route to warden | `Cybersecurity/warden` |
| PII flags on datasets | routed here | `Cybersecurity/veil` owns policy |

## Logical

All 4 agents have Path-1 book-requirements. Cross-agent script candidate flagged: `anomaly_statistical_tests` (anomaly agent) → migrate to `Shared OS/logical/` when second consumer materialises (§13.5 promotion rule).

## Fleet notes
+4 agents (54 → 58). All routing rows added to root `CLAUDE.md`. Toon coverage full.
