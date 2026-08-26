# Data & Analytics Department

**4 agents · all built** — BI, warehouse queries, visualisation, anomaly detection. Owns the *insight* side of data; `Engineering/dana` owns the *pipeline* side.

| Agent | Role | Status |
|---|---|---|
| **insight** | BI Lead (department leader) — cross-functional snapshot, canonical metric registry, ad-hoc analysis, exec dashboards | ✅ Built · Tukey persona |
| **query** | Query & Warehouse — dataset catalog, SQL optimization (read-only), dataset lineage | ✅ Built |
| **viz** | Visualisation — dashboard standards, WCAG accessibility, portfolio audit | ✅ Built |
| **anomaly** | Anomaly Detection — detection rules, alert routing, incident triage (data) | ✅ Built |

**Department doc:** [DEPARTMENT-WORKFLOW.md](DEPARTMENT-WORKFLOW.md)

## Boundaries

| Concern | Owned by | Not owned by |
|---|---|---|
| Cross-functional BI + metrics + dashboards | **D&A** | — |
| Data pipelines (source → warehouse) | `Engineering/dana` | this dept |
| Product metrics governance | `Product/metric` | this dept |
| Financial metrics | `Finance & Treasury/felix` | this dept |
| Security incidents | `Cybersecurity/cortex` | this dept |
| System risk | `Cybersecurity/warden` | this dept |
| Data privacy engineering | `Cybersecurity/veil` | this dept |

## Skills roster (13 total)

1 marketplace (`business-pulse` on insight) + 12 custom.

## Fleet contribution

+4 agents. Fleet count 54 → 58.
