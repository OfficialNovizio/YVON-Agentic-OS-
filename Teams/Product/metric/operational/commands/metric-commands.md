# metric — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "define activation/retention/NSM", "metric truth", "event taxonomy", "what does X mean" | product-metrics-spec | /spec-metric |
| "funnel", "AARRR", "cohort read", "conversion", "where are users dropping" | funnel-instrumentation | /funnel |
| "wire this experiment", "measures for the test", "is it measurable", "verify instruments" | experiment-instrumentation | /instrument |
| "change the definition", "version this metric", "who cites v2", "sync dashboards" | metrics-governance | /govern |

## Precedence
1. Any definition CHANGE routes to metrics-governance — product-metrics-spec is read/extend, not edit-in-place.
2. An experiment read requested before experiment-instrumentation verified-live → BLOCKED, back to /instrument.
3. "Total signups / vanity number" requests → funnel-instrumentation returns rates+cohorts by design, never a bare total.
