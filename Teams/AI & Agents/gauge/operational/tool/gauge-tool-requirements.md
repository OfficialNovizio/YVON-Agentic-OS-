# gauge — Tool Requirements

**This file specifies needs; it does not grant them.** Access is configured at deployment (operator/platform; Fleet Charter Rails 1–2 apply).

| Skill | Needs | Why |
|---|---|---|
| agent-quality-scorecard | read-only telemetry/metrics source; script execution (scorecard.py); file write (own archives) | collect + compute + archive |
| llm-ops-basics | golden-set file read; ability to dispatch eval runs (platform-dependent) | recurring behavioral evals |
| degradation-routing | file read/write (case list); message routing to forge/anneal/quinn | evidence bundles + tracking |
| fleet-health-report | file read (own artifacts, fleet registry); operator delivery channel | synthesis + delivery |

gauge is read-only toward everything it measures — it holds no write access to any other agent's files or tools.
