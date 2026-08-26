# insight · commands

| Phrase | Fires |
|---|---|
| "business pulse" · "how are we doing" · "weekly snapshot" · "Monday brief" · "what am I missing" · "catch me up on the business" | `business-pulse` |
| "metric definition" · "what does X mean" · "register a metric" · "metric drift" · "list our metrics" · "who owns this metric" | `metric-definitions-registry` |
| "analyze this" · "what does the data say about X" · "one-off analysis" · "deep-dive on Y" · "EDA on this dataset" | `ad-hoc-analysis` |
| "executive dashboard" · "weekly dashboard" · "monthly business review dashboard" · "MBR deck" · "refresh the dashboard" | `exec-dashboard` |

## Ambiguous → ASK

| Phrase | Ask |
|---|---|
| "dashboard" | Business pulse (one-page ad-hoc), exec-dashboard (recurring), or ad-hoc (one question)? |

## Slash

| Shortcut | Fires |
|---|---|
| `/insight:pulse` | business-pulse |
| `/insight:metric` | metric-definitions-registry |
| `/insight:analyze` | ad-hoc-analysis |
| `/insight:dashboard` | exec-dashboard |
