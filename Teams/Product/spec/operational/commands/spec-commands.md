# spec — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "write prd", "spec this", "amend the prd", "out of scope" | prd-discipline | /prd |
| "backlog", "prioritize", "rice", "groom", "age out", "next sprint view" | backlog-rules | /backlog |
| "is this worth doing", "size this", "do-nothing cost", "should we build" | opportunity-assessment | /assess |
| "acceptance criteria", "hand to eng", "testable", "criteria dispute", "bounced criterion" | acceptance-criteria-handoff | /criteria |

## Precedence
1. New ideas start at opportunity-assessment — /prd on an unassessed idea bounces to /assess.
2. Release-time disputes → acceptance-criteria-handoff (frozen text arbitrates), whatever else is running.
3. Ranking questions inside a PRD flow stay in backlog-rules; the PRD only cites its rank.
