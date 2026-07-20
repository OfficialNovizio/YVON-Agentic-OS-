# Platform Playbook — [platform name] — [business name]

> One platform, one playbook, one date. Ground truth (verified records) outranks vendor docs. Never edit into fiction — re-date on verification, archive on platform change.

**As of:** [YYYY-MM-DD] · **Source:** [vendor docs version / verified-by-doing record refs]
**Staleness horizon:** [date — past this, every use carries a "verify before trusting" flag]
**Stack-profile section:** [§ref — the ADR trail for why this platform]
**Connector:** [MCP/connector name if bound · "none — manual mechanics below, degraded loudly"]

## Deploy mechanics (consumed by release-discipline)
- Build/artifact: [commands/pipeline — verified [date]]
- Deploy strategies available here: [blue-green/canary/rolling — which this platform supports, how]
- Rollback mechanics: [exact procedure — the thing release-discipline exercises in staging]
- Health checks: [endpoints/probes]

## Observability (consumed by maintenance-hygiene, incident-response)
- Logs live at: [where, retention]
- Metrics/dashboards: [where; baseline sources]
- Alerting: [product, how thresholds are set]

## Backups (consumed by maintenance-hygiene)
- Service/mechanism: [what backs up what]
- Restore procedure: [exact steps — what the restore test runs]

## Access & limits
- Environments: [staging/prod topology]
- Quotas/limits that bite: [dated facts]
- Expiring items on this platform: [→ expiry register entries]

## Charter notes
- Steps in this playbook that would touch data destructively: [each written as prepared-script-for-OPERATOR — a playbook never instructs an agent to run one (Rail 3)]
- Egress this platform's tooling needs: [→ allowlist entries, operator-approved (Rail 2)]

## Verified-run log (ground truth — re-dates this playbook)
| Date | Operation | Record ref | Playbook section confirmed/corrected |
|---|---|---|---|
