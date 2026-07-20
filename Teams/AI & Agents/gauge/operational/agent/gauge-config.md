# gauge — Config (fill-in template; every field traces to a skill line)

| Field | Referenced by | Value |
|---|---|---|
| collection_cadence | agent-quality-scorecard §"When to Use" | `<FILL_IN: suggested weekly>` |
| telemetry_source | agent-quality-scorecard §1 | `<FILL_IN: e.g. platform logs / Datadog read-only (registered w/ relay)>` |
| success_floor / cost_drift_max / latency_drift_max / escalation_drift_max | scorecard.py defaults | `<FILL_IN: suggested 90% / +20% / +20% / +50% — reasoning-based>` |
| golden_task_set | llm-ops-basics §2 | `<FILL_IN: operator-supplied, versioned>` |
| golden_cadence | llm-ops-basics §3 | `<FILL_IN: suggested weekly>` |
| case_stall_limit | degradation-routing §3 | `<FILL_IN: suggested 2 periods>` |
| report_cadence / operator_channel | fleet-health-report §"When to Use", §Protocol | `<FILL_IN>` |
