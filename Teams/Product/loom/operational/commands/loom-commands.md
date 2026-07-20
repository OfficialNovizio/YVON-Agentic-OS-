# loom — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "what are we assuming", "riskiest assumption", "leap of faith", "what could kill this" | assumption-mapping | /assume |
| "run an experiment", "test this", "A/B", "fake door", "decision rule", "freeze criteria" | experiment-discipline | /experiment |
| "have we tested this", "experiment history", "record the verdict", "did we try that" | experiment-registry | /registry |
| "do we have PMF", "product-market fit", "Ellis survey", "retention curve", "double down or pivot" | pmf-scorecard | /pmf |

## Precedence
1. A proposed experiment queries experiment-registry FIRST — re-running a settled test needs a stated delta.
2. experiment-discipline will not run until metric (experiment-instrumentation) reports instruments verified-live.
3. PMF verdicts route to spec/marcus as evidence — the double-down/pivot decision is theirs, not loom's.
4. Criteria/decision-rule freeze precedes data always; a post-hoc success bar bounces.
