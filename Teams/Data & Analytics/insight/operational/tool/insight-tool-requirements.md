# insight · tool requirements

> **States needs, not grants** (§7).

| Skill | Required | Optional | Source line |
|---|---|---|---|
| business-pulse | Multi-connector parallel fetch (QB, PayPal, Stripe, Square, HubSpot, Calendar, Gmail, Slack) · File write (share) | — | Marketplace body Step 1 |
| metric-definitions-registry | File read/write | — | All steps mutate `metrics.yaml` |
| ad-hoc-analysis | File read (registry) · Data query routing | File write (report) | Steps 2-3 |
| exec-dashboard | File read (config, registry) · Data query routing · File write (persistent) | BI tool MCP (Tableau/Looker/Metabase) | Steps 1-5 |

Governance in `insight-config.md`.
