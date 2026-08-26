# anomaly · tool requirements
> **States needs, not grants** (§7).

| Skill | Required | Optional | Source line |
|---|---|---|---|
| anomaly-detection-rules | File read/write · Historical data query | Statistical library (numpy / scipy) | All steps |
| alert-routing | File read/write (alert log) | Slack MCP · Email MCP · scheduled-task API | All steps |
| incident-triage-data | File read (alert log · lineage · known-events) · Historical query · File write (memo) | — | All steps |
