# metric — Tool Requirements

**This file specifies needs; it does not grant them.** Access is configured at deployment (operator/platform; Fleet Charter Rails 1–2 apply — registered tools only, least privilege).

| Skill | Needs | Why |
|---|---|---|
| product-metrics-spec | file read/write (own spec files) | the metric-truth document |
| funnel-instrumentation | file read (metric spec, event data reads); file write (own funnel maps + cohort reads) | AARRR reads |
| experiment-instrumentation | file read (metric spec); read of live event volume (verify-live); **script execution (sample_size.py — stdlib, no network)**; handoff channel to Engineering (instrumentation requests, echo-confirmed) | pre-flight verification + sizing/significance |
| metrics-governance | file read/write (own version log); export channel to data layer + kai dashboards | change control + sync |

metric reads product-behavior data and writes only its own specs/reads; it never writes production instrumentation (Engineering does) and never executes definition changes without a versioned proposal.
